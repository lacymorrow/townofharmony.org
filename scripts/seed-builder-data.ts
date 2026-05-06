/**
 * Seed Builder.io data models and entries via the Admin SDK and Write API.
 *
 * Usage:
 *   npx tsx scripts/seed-builder-data.ts
 *   npx tsx scripts/seed-builder-data.ts --models-only
 *   npx tsx scripts/seed-builder-data.ts --data-only
 *   npx tsx scripts/seed-builder-data.ts --model=town-news
 *   npx tsx scripts/seed-builder-data.ts --dry-run
 *
 * Env vars (loaded from .env automatically):
 *   BUILDER_PRIVATE_KEY - Builder.io private API key
 *   NEXT_PUBLIC_BUILDER_API_KEY - Builder.io public API key
 */

import { config } from "dotenv";
config(); // Load .env

import { createAdminApiClient } from "@builder.io/admin-sdk";
import { modelDefinitions } from "../src/lib/builder-model-definitions";

// Import real static data
import { teamMembers } from "../src/data/town/team-members";
import { emergencyServices } from "../src/data/town/emergency-services";
import { historyArticles } from "../src/data/town/history";
import { pointsOfInterest } from "../src/data/town/points-of-interest";
import { resources } from "../src/data/town/resources";
import { announcements } from "../src/data/town/announcements";
import { settings } from "../src/data/town/settings";
import { news } from "../src/data/town/news";
import { events } from "../src/data/town/events";
import { meetings } from "../src/data/town/meetings";
import { businesses } from "../src/data/town/businesses";
import { elections } from "../src/data/town/elections";
import { sewerRateTiers } from "../src/data/town/sewer-rates";
import { homepage } from "../src/data/town/homepage";

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

const adminClient = createAdminApiClient(BUILDER_PRIVATE_KEY);

// --- CLI flags ---
const args = process.argv.slice(2);
const modelsOnly = args.includes("--models-only");
const dataOnly = args.includes("--data-only");
const dryRun = args.includes("--dry-run");
const modelFilter = args.find((a) => a.startsWith("--model="))?.split("=")[1];

// ============================================================
// Transform static data → Builder seed entries
// ============================================================

interface SeedEntry {
	name: string;
	data: Record<string, unknown>;
}

function toSeedEntries<T extends Record<string, any>>(
	items: T[],
	nameKey: keyof T,
): SeedEntry[] {
	return items.map((item) => ({
		name: String(item[nameKey]),
		data: { ...item } as Record<string, unknown>,
	}));
}

/** Flatten nested settings object for Builder's flat field model */
function flattenSettings(s: typeof settings): SeedEntry[] {
	return [
		{
			name: "Town of Harmony Settings",
			data: {
				siteTitle: s.siteTitle,
				siteDescription: s.siteDescription,
				contactPhone: s.contactInfo.phone,
				contactAddress: s.contactInfo.address,
				contactEmail: s.contactInfo.email,
				officeHoursWeekday: s.officeHours.weekday,
				officeHoursWeekend: s.officeHours.weekend,
				socialFacebook: s.socialMedia.facebook,
				socialTwitter: s.socialMedia.twitter,
				socialYoutube: s.socialMedia.youtube,
				brandingTagline: s.branding.tagline,
				brandingEstablished: s.branding.established,
				brandingCounty: s.branding.county,
				brandingState: s.branding.state,
			},
		},
	];
}

const seedData: Record<string, SeedEntry[]> = {
	"town-team-member": toSeedEntries(teamMembers, "name"),
	"town-emergency-service": toSeedEntries(emergencyServices, "title"),
	"town-history-article": toSeedEntries(historyArticles, "title"),
	"town-point-of-interest": toSeedEntries(pointsOfInterest, "name"),
	"town-resource": toSeedEntries(resources, "title"),
	"town-announcement": toSeedEntries(announcements, "title"),
	"town-settings": flattenSettings(settings),
	"town-news": toSeedEntries(news, "title"),
	"town-event": toSeedEntries(events, "title"),
	"town-meeting": toSeedEntries(meetings, "title"),
	"town-business": toSeedEntries(businesses, "name"),
	"town-election": toSeedEntries(elections, "title"),
	"town-homepage-slide": homepage.heroSlides.map((slide, i) => ({
		name: slide.title,
		data: {
			title: slide.title,
			subtitle: slide.subtitle ?? "",
			description: slide.description ?? "",
			image: slide.image ?? "",
			ctaText: slide.ctaText ?? "",
			ctaHref: slide.ctaHref ?? "",
			sortOrder: i,
		},
	})),
	"town-sewer-rate": sewerRateTiers.map((tier, i) => ({
		name: tier.name,
		data: {
			tierId: tier.id,
			name: tier.name,
			description: tier.description,
			location: tier.location,
			type: tier.type,
			monthlyRate: tier.monthlyRate,
			sortOrder: i,
		},
	})),
};

// ============================================================
// Model creation via Admin SDK
// ============================================================

async function createModel(definition: (typeof modelDefinitions)[0]) {
	if (dryRun) {
		console.log(`  [DRY] Would create model "${definition.name}" with ${definition.fields.length} fields`);
		return { id: "dry-run", name: definition.name };
	}

	try {
		const body: Record<string, unknown> = {
			name: definition.name,
			kind: definition.kind,
			fields: definition.fields.map((f) => ({
				"@type": "@builder.io/core:Field",
				name: f.name,
				type: f.type,
				required: f.required ?? false,
				...(f.defaultValue !== undefined ? { defaultValue: f.defaultValue } : {}),
				...(f.enum ? { enum: f.enum } : {}),
				...(f.subFields
					? {
							subFields: f.subFields.map((sf) => ({
								"@type": "@builder.io/core:Field",
								...sf,
							})),
						}
					: {}),
			})),
		};

		const result = await adminClient.mutation({
			addModel: [{ body }, { id: true, name: true }],
		});

		return result.data?.addModel;
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		if (
			message.includes("already exists") ||
			message.includes("duplicate") ||
			message.includes("A model with that name already exists")
		) {
			console.log(`  [SKIP] Model "${definition.name}" already exists`);
			return null;
		}
		throw err;
	}
}

// ============================================================
// Data seeding via Write API
// ============================================================

async function seedEntry(modelName: string, entry: SeedEntry) {
	if (dryRun) {
		console.log(`    [DRY] Would seed "${entry.name}" to ${modelName}`);
		return { id: "dry-run" };
	}

	const res = await fetch(
		`https://builder.io/api/v1/write/${modelName}?apiKey=${BUILDER_API_KEY}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
			},
			body: JSON.stringify({
				name: entry.name,
				data: entry.data,
				published: "published",
			}),
		},
	);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(
			`Failed to seed "${entry.name}" to ${modelName}: ${res.status} ${text}`,
		);
	}

	return res.json();
}

// ============================================================
// Main
// ============================================================

async function main() {
	const models = modelFilter
		? modelDefinitions.filter((m) => m.name === modelFilter)
		: modelDefinitions;

	if (modelFilter && models.length === 0) {
		console.error(`No model definition found for "${modelFilter}"`);
		process.exit(1);
	}

	if (dryRun) {
		console.log("\n=== DRY RUN (no changes will be made) ===\n");
	}

	// Phase 1: Create models
	if (!dataOnly) {
		console.log(`\nCreating ${models.length} Builder.io data models...\n`);
		let modelSuccess = 0;
		let modelFailed = 0;

		for (const model of models) {
			try {
				const result = await createModel(model);
				if (result) {
					console.log(`  [OK] Model "${model.name}" created`);
					modelSuccess++;
				}
			} catch (err) {
				console.error(
					`  [FAIL] Model "${model.name}": ${err instanceof Error ? err.message : err}`,
				);
				modelFailed++;
			}
		}

		console.log(`\nModels: ${modelSuccess} created, ${modelFailed} failed.\n`);

		if (modelsOnly) {
			process.exit(modelFailed > 0 ? 1 : 0);
		}

		if (!dryRun) {
			console.log("Waiting 3s for models to propagate...\n");
			await new Promise((r) => setTimeout(r, 3000));
		}
	}

	// Phase 2: Seed data
	console.log("Seeding data entries...\n");
	let dataSuccess = 0;
	let dataFailed = 0;

	for (const model of models) {
		const entries = seedData[model.name];
		if (!entries || entries.length === 0) {
			console.log(`  [SKIP] No data for "${model.name}"`);
			continue;
		}

		console.log(`  ${model.name} (${entries.length} entries):`);

		for (const entry of entries) {
			try {
				const result = await seedEntry(model.name, entry);
				console.log(`    [OK] ${entry.name} → ${result.id}`);
				dataSuccess++;
			} catch (err) {
				console.error(
					`    [FAIL] ${entry.name}: ${err instanceof Error ? err.message : err}`,
				);
				dataFailed++;
			}
		}
	}

	console.log(`\nData: ${dataSuccess} seeded, ${dataFailed} failed.`);
	if (dataFailed > 0) process.exit(1);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
