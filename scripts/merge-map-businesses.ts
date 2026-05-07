/**
 * Merge Google Places data with Builder.io manual overrides.
 * Builder.io entries win on conflict (matched by googlePlaceId or address).
 * New Google Places entries are flagged for review.
 *
 * Usage:
 *   npx tsx scripts/merge-map-businesses.ts
 *   npx tsx scripts/merge-map-businesses.ts --dry-run
 *   npx tsx scripts/merge-map-businesses.ts --google=path/to/google.json
 *
 * Env vars:
 *   NEXT_PUBLIC_BUILDER_API_KEY - Builder.io public API key
 */

import { config } from "dotenv";
config();

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

interface GoogleSyncedBusiness {
	googlePlaceId: string;
	name: string;
	address: string;
	phone: string;
	category: string;
	lat: number;
	lng: number;
	description: string;
	googleTypes: string[];
	businessStatus: string;
	syncedAt: string;
}

interface BuilderMapBusiness {
	data: {
		name: string;
		address: string;
		phone: string;
		category: string;
		lat: number;
		lng: number;
		description: string;
		googlePlaceId: string;
		isOverride: boolean;
		businessStatus: string;
	};
}

interface MergedBusiness {
	id: string;
	name: string;
	address: string;
	phone: string;
	category: string;
	lat: number;
	lng: number;
	description: string;
	source: "google" | "builder" | "merged";
	googlePlaceId: string;
	isNew: boolean;
}

const ADDRESS_ABBREVS: Record<string, string> = {
	street: "st", st: "st",
	avenue: "ave", ave: "ave",
	road: "rd", rd: "rd",
	drive: "dr", dr: "dr",
	highway: "hwy", hwy: "hwy",
	lane: "ln", ln: "ln",
	boulevard: "blvd", blvd: "blvd",
	north: "n", n: "n",
	south: "s", s: "s",
	east: "e", e: "e",
	west: "w", w: "w",
};

function normalizeAddress(addr: string): string {
	// Take only the street portion before city/state/zip/country
	const street = addr.split(",")[0];
	return street
		.toLowerCase()
		.replace(/[.#]/g, "")
		.replace(/\s+/g, " ")
		.replace(/\b(street|st|avenue|ave|road|rd|drive|dr|highway|hwy|lane|ln|boulevard|blvd|north|south|east|west|n|s|e|w)\b/g, (m) => {
			return ADDRESS_ABBREVS[m] ?? m;
		})
		.trim();
}

function addressMatch(a: string, b: string): boolean {
	return normalizeAddress(a) === normalizeAddress(b);
}

async function fetchBuilderBusinesses(): Promise<BuilderMapBusiness[]> {
	if (!BUILDER_API_KEY) {
		console.log("  No BUILDER_API_KEY — skipping Builder.io fetch");
		return [];
	}

	const all: BuilderMapBusiness[] = [];
	const limit = 100;
	let offset = 0;

	while (true) {
		const res = await fetch(
			`https://cdn.builder.io/api/v3/content/town-map-business?apiKey=${BUILDER_API_KEY}&limit=${limit}&offset=${offset}&fields=data`,
		);

		if (!res.ok) {
			console.error(`  Builder.io fetch failed: ${res.status}`);
			return all;
		}

		const json = await res.json();
		const results: BuilderMapBusiness[] = json.results ?? [];
		all.push(...results);

		if (results.length < limit) break;
		offset += limit;
	}

	return all;
}

function loadGoogleData(path: string): GoogleSyncedBusiness[] {
	if (!existsSync(path)) {
		console.log(`  No Google data file at ${path}`);
		return [];
	}

	const raw = JSON.parse(readFileSync(path, "utf-8"));
	return raw.businesses ?? [];
}

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const googlePath = resolve(
		process.cwd(),
		args.find((a) => a.startsWith("--google="))?.split("=")[1] ??
			"src/data/town/map-businesses-google.json",
	);
	const outputPath = resolve(process.cwd(), "src/data/town/map-businesses-merged.json");

	console.log("Merging map business data...\n");

	const googleBusinesses = loadGoogleData(googlePath);
	console.log(`  Google Places: ${googleBusinesses.length} entries`);

	const builderBusinesses = await fetchBuilderBusinesses();
	console.log(`  Builder.io overrides: ${builderBusinesses.length} entries`);

	const merged: MergedBusiness[] = [];
	const matchedGoogleIds = new Set<string>();

	for (const b of builderBusinesses) {
		const d = b.data;
		merged.push({
			id: d.googlePlaceId || `builder-${d.name.toLowerCase().replace(/\s+/g, "-")}`,
			name: d.name,
			address: d.address,
			phone: d.phone ?? "",
			category: d.category,
			lat: d.lat,
			lng: d.lng,
			description: d.description ?? "",
			source: d.googlePlaceId ? "merged" : "builder",
			googlePlaceId: d.googlePlaceId ?? "",
			isNew: false,
		});

		if (d.googlePlaceId) {
			matchedGoogleIds.add(d.googlePlaceId);
		}
	}

	const newBusinesses: MergedBusiness[] = [];
	for (const g of googleBusinesses) {
		if (matchedGoogleIds.has(g.googlePlaceId)) continue;

		const addressOverlap = builderBusinesses.some(
			(b) => addressMatch(b.data.address, g.address),
		);
		if (addressOverlap) {
			matchedGoogleIds.add(g.googlePlaceId);
			continue;
		}

		const biz: MergedBusiness = {
			id: g.googlePlaceId,
			name: g.name,
			address: g.address,
			phone: g.phone,
			category: g.category,
			lat: g.lat,
			lng: g.lng,
			description: g.description,
			source: "google",
			googlePlaceId: g.googlePlaceId,
			isNew: true,
		};

		merged.push(biz);
		newBusinesses.push(biz);
	}

	console.log(`\n  Merged total: ${merged.length}`);
	console.log(`  From Builder.io: ${builderBusinesses.length}`);
	console.log(`  New from Google: ${newBusinesses.length}`);

	if (newBusinesses.length > 0) {
		console.log("\n  New businesses detected:");
		for (const b of newBusinesses) {
			console.log(`    - ${b.name} (${b.address})`);
		}
	}

	if (dryRun) {
		console.log("\n  Dry run — not writing files");
		return;
	}

	const output = {
		mergedAt: new Date().toISOString(),
		totalCount: merged.length,
		newCount: newBusinesses.length,
		businesses: merged,
	};

	writeFileSync(outputPath, JSON.stringify(output, null, "\t") + "\n");
	console.log(`\n  Written to ${outputPath}`);

	if (newBusinesses.length > 0) {
		console.log(
			"\n  ACTION NEEDED: Review new businesses above and add them to Builder.io if appropriate.",
		);
	}
}

main().catch((err) => {
	console.error("Merge failed:", err);
	process.exit(1);
});
