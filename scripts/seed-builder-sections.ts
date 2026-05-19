/**
 * Seed Builder.io Section model entries via the Write API.
 *
 * Idempotent: matches existing entries by name. Creates new entries,
 * updates seed-only entries in place, skips human-edited entries by default.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-builder-sections.ts
 *   pnpm exec tsx scripts/seed-builder-sections.ts --dry-run
 *   pnpm exec tsx scripts/seed-builder-sections.ts --overwrite-edited
 *   pnpm exec tsx scripts/seed-builder-sections.ts --only-new
 *
 * Requires a Builder.io private API key (Account Settings → API Keys).
 *
 * NOTE: The three Section models (announcement-bar, homepage-hero, page-cta)
 * must be created manually in the Builder.io dashboard before running this script:
 *   Models → + Create Model → Section → name the model
 */

import { config } from "dotenv";
config();

import {
	emptyCounters,
	fetchExisting,
	formatResult,
	indexExistingBy,
	parseUpsertFlags,
	printSummary,
	tallyResult,
	upsert,
} from "./lib/builder-upsert";

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

const client = { apiKey: BUILDER_API_KEY, privateKey: BUILDER_PRIVATE_KEY };
const opts = parseUpsertFlags(process.argv.slice(2));

interface SectionBlock {
	"@type": "@builder.io/sdk:Element";
	component: {
		name: string;
		options?: Record<string, unknown>;
	};
}

interface SectionDef {
	model: string;
	name: string;
	blocks: SectionBlock[];
}

const block = (name: string, options?: Record<string, unknown>): SectionBlock => ({
	"@type": "@builder.io/sdk:Element",
	component: { name, options },
});

const sections: SectionDef[] = [
	{
		model: "announcement-bar",
		name: "Default Announcement Bar",
		blocks: [
			block("TownAnnouncementBar", {
				message: "Welcome to the Town of Harmony, NC. Check our latest news and events.",
				level: "info",
				ctaText: "View News",
				ctaHref: "/news",
				isActive: false,
			}),
		],
	},
	{
		model: "homepage-hero",
		name: "Homepage Hero",
		blocks: [
			block("TownHeroBanner", {
				title: "Welcome to the Town of Harmony",
				subtitle:
					"Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit.",
				ctaText: "Discover Harmony",
				ctaHref: "/history",
			}),
		],
	},
	{
		model: "page-cta",
		name: "Default Page CTA",
		blocks: [
			block("TownPageCta", {
				heading: "Stay Connected with Harmony",
				body: "Sign up for town updates, follow us on social media, or reach out to town hall directly.",
				ctaText: "Contact Town Hall",
				ctaHref: "/contact",
				variant: "primary",
			}),
		],
	},
];

function buildSectionBody(section: SectionDef) {
	return {
		name: section.name,
		data: {
			blocks: section.blocks,
		},
	};
}

async function seedModel(modelName: string, modelSections: SectionDef[]) {
	console.log(`\n--- ${modelName} ---`);

	const existing = await fetchExisting(client, modelName);
	const byName = indexExistingBy(existing, (e) => e.name ?? undefined);
	const counters = emptyCounters();

	for (const section of modelSections) {
		const label = section.name.padEnd(30);
		try {
			const result = await upsert(
				client,
				modelName,
				buildSectionBody(section),
				section.name,
				byName,
				opts,
			);
			console.log(formatResult(label, result));
			tallyResult(counters, result);
		} catch (err) {
			console.error(`  [FAIL]     ${label}: ${err instanceof Error ? err.message : err}`);
			counters.failed++;
		}
	}

	return counters;
}

async function main() {
	const modelGroups = sections.reduce<Record<string, SectionDef[]>>((acc, s) => {
		(acc[s.model] ??= []).push(s);
		return acc;
	}, {});

	const totalSections = sections.length;
	console.log(
		`Upserting ${totalSections} Builder.io section entr${totalSections === 1 ? "y" : "ies"}${opts.dryRun ? " (dry run)" : ""}...`,
	);

	let totalFailed = 0;

	for (const [modelName, modelSections] of Object.entries(modelGroups)) {
		const counters = await seedModel(modelName, modelSections);
		printSummary(counters, opts);
		totalFailed += counters.failed;
	}

	if (totalFailed > 0) process.exit(1);
}

main();
