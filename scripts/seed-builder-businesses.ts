/**
 * Seed Builder.io "business" data model with the 29 Harmony businesses.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-builder-businesses.ts
 *
 * Steps:
 *   1. Creates (or verifies) the "business" data model
 *   2. Fetches existing entries to avoid duplicates
 *   3. Seeds each business from src/data/town/map-businesses.ts
 *
 * Requires BUILDER_PRIVATE_KEY and NEXT_PUBLIC_BUILDER_API_KEY in .env.
 */

import { config } from "dotenv";
config();

import { mapBusinesses } from "@/data/town/map-businesses";
import { ALL_CATEGORIES, type MapBusiness } from "@/lib/map-utils";

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (!BUILDER_PRIVATE_KEY) {
	console.error("Missing BUILDER_PRIVATE_KEY env var");
	process.exit(1);
}

if (!BUILDER_API_KEY) {
	console.error("Missing NEXT_PUBLIC_BUILDER_API_KEY env var");
	process.exit(1);
}

const MODEL_FIELDS = [
	{ name: "name", type: "text", required: true, helperText: "Business name" },
	{ name: "address", type: "text", required: true, helperText: "Street address" },
	{ name: "phone", type: "text", helperText: "Phone number" },
	{
		name: "category",
		type: "text",
		required: true,
		enum: ALL_CATEGORIES,
		helperText: "Business category",
	},
	{ name: "lat", type: "number", required: true, helperText: "Latitude" },
	{ name: "lng", type: "number", required: true, helperText: "Longitude" },
	{ name: "description", type: "longText", helperText: "Short description" },
	{ name: "isOverride", type: "boolean", defaultValue: false, helperText: "Manual override (won't be replaced by Google sync)" },
	{ name: "googlePlaceId", type: "text", helperText: "Google Places ID (merge key for auto-sync)" },
];

async function ensureModel() {
	const res = await fetch("https://builder.io/api/v1/models", {
		headers: { Authorization: `Bearer ${BUILDER_PRIVATE_KEY}` },
	});

	if (!res.ok) {
		throw new Error(`Failed to list models: ${res.status} ${await res.text()}`);
	}

	const models = await res.json();
	const existing = models.find(
		(m: { name: string }) => m.name === "business",
	);

	if (existing) {
		console.log(`Model "business" already exists (${existing.id})`);
		return existing;
	}

	console.log('Creating "business" data model...');
	const createRes = await fetch("https://builder.io/api/v1/models", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
		},
		body: JSON.stringify({
			name: "business",
			kind: "data",
			fields: MODEL_FIELDS,
		}),
	});

	if (!createRes.ok) {
		throw new Error(
			`Failed to create model: ${createRes.status} ${await createRes.text()}`,
		);
	}

	const created = await createRes.json();
	console.log(`Created model "business" (${created.id})`);
	return created;
}

async function fetchExistingNames(): Promise<Set<string>> {
	const url = new URL("https://cdn.builder.io/api/v3/content/business");
	url.searchParams.set("apiKey", BUILDER_API_KEY!);
	url.searchParams.set("limit", "100");
	url.searchParams.set("fields", "data.name");
	url.searchParams.set("includeUnpublished", "false");

	const res = await fetch(url.toString());
	if (!res.ok) return new Set();

	const json = await res.json();
	const names = new Set<string>();
	for (const entry of json.results ?? []) {
		if (entry.data?.name) names.add(entry.data.name);
	}
	return names;
}

async function seedBusiness(biz: MapBusiness) {
	const body = {
		name: biz.name,
		data: {
			name: biz.name,
			address: biz.address,
			phone: biz.phone,
			category: biz.category,
			lat: biz.lat,
			lng: biz.lng,
			description: biz.description ?? "",
			isOverride: false,
			googlePlaceId: "",
		},
		published: "published" as const,
	};

	const res = await fetch(
		`https://builder.io/api/v1/write/business?apiKey=${BUILDER_API_KEY}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
			},
			body: JSON.stringify(body),
		},
	);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to seed "${biz.name}": ${res.status} ${text}`);
	}

	return res.json();
}

async function main() {
	await ensureModel();

	console.log("\nChecking for existing entries...");
	const existingNames = await fetchExistingNames();
	if (existingNames.size > 0) {
		console.log(`Found ${existingNames.size} existing businesses — will skip duplicates.`);
	}

	const toSeed = mapBusinesses.filter((b) => !existingNames.has(b.name));
	if (toSeed.length === 0) {
		console.log("All businesses already seeded. Nothing to do.");
		return;
	}

	console.log(`\nSeeding ${toSeed.length} new businesses (skipping ${mapBusinesses.length - toSeed.length} existing)...\n`);

	let success = 0;
	let failed = 0;

	for (const biz of toSeed) {
		try {
			const result = await seedBusiness(biz);
			console.log(`  [OK] ${biz.name} → ${result.id}`);
			success++;
		} catch (err) {
			console.error(
				`  [FAIL] ${biz.name}: ${err instanceof Error ? err.message : err}`,
			);
			failed++;
		}
	}

	console.log(`\nDone: ${success} seeded, ${failed} failed, ${existingNames.size} already existed.`);
	if (failed > 0) process.exit(1);
}

main();
