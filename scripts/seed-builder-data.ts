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
import { announcements } from "../src/data/town/announcements";
import { businesses } from "../src/data/town/businesses";
import { contactInquiryTypes } from "../src/data/town/contact-inquiry-types";
import { elections } from "../src/data/town/elections";
import { emergencyServices } from "../src/data/town/emergency-services";
import { events } from "../src/data/town/events";
import { historyArticles } from "../src/data/town/history";
import { homepage } from "../src/data/town/homepage";
import { mapBusinesses } from "../src/data/town/map-businesses";
import { meetings } from "../src/data/town/meetings";
import { navigation } from "../src/data/town/navigation";
import { news } from "../src/data/town/news";
import { pointsOfInterest } from "../src/data/town/points-of-interest";
import { resources } from "../src/data/town/resources";
import { settings } from "../src/data/town/settings";
import { sewerRateTiers } from "../src/data/town/sewer-rates";
import { staticPages } from "../src/data/town/static-pages";
// Import real static data
import { teamMembers } from "../src/data/town/team-members";
import { modelDefinitions } from "../src/lib/builder-model-definitions";
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

const adminClient = createAdminApiClient(BUILDER_PRIVATE_KEY);
const client = { apiKey: BUILDER_API_KEY, privateKey: BUILDER_PRIVATE_KEY };

// --- CLI flags ---
const args = process.argv.slice(2);
const modelsOnly = args.includes("--models-only");
const dataOnly = args.includes("--data-only");
const modelFilter = args.find((a) => a.startsWith("--model="))?.split("=")[1];
const opts = parseUpsertFlags(args);
const { dryRun } = opts;

// ============================================================
// Transform static data → Builder seed entries
// ============================================================

interface SeedEntry {
	name: string;
	data: Record<string, unknown>;
}

function toSeedEntries<T extends Record<string, any>>(items: T[], nameKey: keyof T): SeedEntry[] {
	return items.map((item) => ({
		name: String(item[nameKey]),
		data: { ...item } as Record<string, unknown>,
	}));
}

/** Flatten the navigation tree into the flat-list shape Builder stores. */
function flattenNavigation(n: typeof navigation): SeedEntry[] {
	const mainNav: Array<{ name: string; href: string; parentName?: string }> = [];
	for (const item of n.mainNav) {
		mainNav.push({ name: item.name, href: item.href });
		for (const child of item.children ?? []) {
			mainNav.push({ name: child.name, href: child.href, parentName: item.name });
		}
	}
	const footerLinks: Array<{ category: string; name: string; href: string }> = [];
	for (const section of n.footerLinks) {
		for (const link of section.links) {
			footerLinks.push({ category: section.category, name: link.name, href: link.href });
		}
	}
	return [
		{
			name: "Town of Harmony Navigation",
			data: {
				mainNav,
				topBarLinks: n.topBarLinks,
				quickLinks: n.quickLinks,
				footerLinks,
			},
		},
	];
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
				contactMailingAddress: s.contactInfo.mailingAddress,
				officeHoursWeekday: s.officeHours.weekday,
				officeHoursWeekend: s.officeHours.weekend,
				socialFacebook: s.socialMedia.facebook,
				socialTwitter: s.socialMedia.twitter,
				socialYoutube: s.socialMedia.youtube,
				brandingTagline: s.branding.tagline,
				brandingEstablished: s.branding.established,
				brandingCounty: s.branding.county,
				brandingState: s.branding.state,
				sewerContactAddress: s.sewer.contactAddress,
				sewerContactPhone: s.sewer.contactPhone,
				sewerContactHours: s.sewer.contactHours,
				sewerContactEmail: s.sewer.contactEmail,
				sewerPageHeading: s.sewer.pageHeading,
				sewerPageDescription: s.sewer.pageDescription,
				sewerPaymentHeading: s.sewer.paymentHeading,
				sewerSuccessCopy: s.sewer.successCopy,
				sewerCancelCopy: s.sewer.cancelCopy,
				homepageHeroBadgeText: s.homepage.heroBadgeText,
				homepageHeroSecondaryCtaText: s.homepage.heroSecondaryCtaText,
				homepageHeroSecondaryCtaHref: s.homepage.heroSecondaryCtaHref,
				homepageQuickLinksHeading: s.homepage.quickLinksHeading,
				homepageQuickLinksSubheading: s.homepage.quickLinksSubheading,
				homepageLatestNewsHeading: s.homepage.latestNewsHeading,
				homepageUpcomingEventsHeading: s.homepage.upcomingEventsHeading,
				homepageSpotlightBadge: s.homepage.spotlightBadge,
				homepageSpotlightTitle: s.homepage.spotlightTitle,
				homepageSpotlightDescription: s.homepage.spotlightDescription,
				homepageSpotlightCtaText: s.homepage.spotlightCtaText,
				homepageSpotlightCtaHref: s.homepage.spotlightCtaHref,
				homepageSpotlightImageLetter: s.homepage.spotlightImageLetter,
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
	"town-navigation": flattenNavigation(navigation),
	"town-news": toSeedEntries(news, "title"),
	"town-event": toSeedEntries(events, "title"),
	"town-meeting": toSeedEntries(meetings, "title"),
	"town-business": toSeedEntries(businesses, "name"),
	"town-election": toSeedEntries(elections, "title"),
	"town-homepage-slide": homepage.heroSlides.map((slide) => ({
		name: slide.title,
		data: {
			title: slide.title,
			subtitle: slide.subtitle ?? "",
			description: slide.description ?? "",
			image: slide.image ?? "",
			ctaText: slide.ctaText ?? "",
			ctaHref: slide.ctaHref ?? "",
		},
	})),
	"town-contact-inquiry-type": contactInquiryTypes.map((t) => ({
		name: t.label,
		data: {
			value: t.value,
			label: t.label,
			isActive: t.isActive,
		},
	})),
	"town-static-page": staticPages.map((page) => ({
		name: page.title,
		data: {
			slug: page.slug,
			title: page.title,
			body: page.body,
		},
	})),
	"town-sewer-rate": sewerRateTiers.map((tier) => ({
		name: tier.name,
		data: {
			tierId: tier.id,
			name: tier.name,
			description: tier.description,
			location: tier.location,
			type: tier.type,
			monthlyRate: tier.monthlyRate,
		},
	})),
	"town-map-business": mapBusinesses.map((b) => ({
		name: b.name,
		data: {
			name: b.name,
			address: b.address,
			phone: b.phone ?? "",
			category: b.category,
			lat: b.lat,
			lng: b.lng,
			description: b.description ?? "",
			googlePlaceId: "",
			isOverride: true,
			businessStatus: "OPERATIONAL",
		},
	})),
};

// ============================================================
// Model creation via Admin SDK
// ============================================================

async function createModel(definition: (typeof modelDefinitions)[0]) {
	if (dryRun) {
		console.log(
			`  [DRY] Would create model "${definition.name}" with ${definition.fields.length} fields`
		);
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
				...(f.allowedFileTypes ? { allowedFileTypes: f.allowedFileTypes } : {}),
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
					`  [FAIL] Model "${model.name}": ${err instanceof Error ? err.message : err}`
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
	console.log(`Upserting data entries${opts.dryRun ? " (dry run)" : ""}...\n`);
	const counters = emptyCounters();

	for (const model of models) {
		const entries = seedData[model.name];
		if (!entries || entries.length === 0) {
			console.log(`  [SKIP] No data for "${model.name}"`);
			continue;
		}

		console.log(`\n  ${model.name} (${entries.length} entries):`);

		const existing = await fetchExisting(client, model.name);
		const byName = indexExistingBy(existing, (e) => e.name);

		for (const entry of entries) {
			try {
				const result = await upsert(
					client,
					model.name,
					{ name: entry.name, data: entry.data },
					entry.name,
					byName,
					opts
				);
				console.log(`  ${formatResult(entry.name, result)}`);
				tallyResult(counters, result);
			} catch (err) {
				console.error(`    [FAIL]    ${entry.name}: ${err instanceof Error ? err.message : err}`);
				counters.failed++;
			}
		}
	}

	printSummary(counters, opts);
	if (counters.failed > 0) process.exit(1);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
