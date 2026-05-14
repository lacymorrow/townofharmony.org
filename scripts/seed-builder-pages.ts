/**
 * Seed Builder.io pages via the Write API.
 *
 * Idempotent: matches existing pages by `data.url`. Creates new pages,
 * updates seed-only pages in place, skips human-edited pages by default.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-builder-pages.ts
 *   pnpm exec tsx scripts/seed-builder-pages.ts --dry-run
 *   pnpm exec tsx scripts/seed-builder-pages.ts --overwrite-edited
 *   pnpm exec tsx scripts/seed-builder-pages.ts --only-new
 *
 * Requires a Builder.io private API key (Account Settings → API Keys).
 */

import { config } from "dotenv";
config(); // Load .env

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

interface BuilderBlock {
	"@type": "@builder.io/sdk:Element";
	component: {
		name: string;
		options?: Record<string, unknown>;
	};
}

interface PageDef {
	name: string;
	url: string;
	title: string;
	description: string;
	blocks: BuilderBlock[];
}

const block = (
	name: string,
	options?: Record<string, unknown>,
): BuilderBlock => ({
	"@type": "@builder.io/sdk:Element",
	component: { name, options },
});

const pages: PageDef[] = [
	// --- Homepage ---
	{
		name: "Homepage",
		url: "/",
		title: "Town of Harmony - Welcome",
		description:
			"Official website of the Town of Harmony, North Carolina. Find news, events, meetings, and community resources.",
		blocks: [
			block("TownHero"),
			block("TownQuickLinks"),
			block("TownLatestNews", { limit: 3 }),
			block("TownUpcomingEvents", { limit: 5 }),
			block("TownCommunitySpotlight"),
			block("TownNewsletterSignup"),
		],
	},

	// --- News ---
	{
		name: "News",
		url: "/news",
		title: "News - Town of Harmony",
		description:
			"Stay up to date with the latest news from the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Town News",
				subtitle: "Stay informed about what's happening in Harmony",
			}),
			block("TownNewsGrid"),
		],
	},
	{
		name: "News Article",
		url: "/news/:slug",
		title: "News Article - Town of Harmony",
		description: "Read this news article from the Town of Harmony.",
		blocks: [block("TownNewsDetail")],
	},

	// --- Events ---
	{
		name: "Events",
		url: "/events",
		title: "Events - Town of Harmony",
		description:
			"Discover upcoming events and activities in the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Events & Activities",
				subtitle: "Discover what's happening in our community",
			}),
			block("TownEventsList"),
		],
	},
	{
		name: "Event Detail",
		url: "/events/:slug",
		title: "Event - Town of Harmony",
		description: "View event details for this Town of Harmony event.",
		blocks: [block("TownEventDetail")],
	},

	// --- Meetings ---
	{
		name: "Meetings",
		url: "/meetings",
		title: "Meetings - Town of Harmony",
		description:
			"View upcoming and past government meetings for the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Government Meetings",
				subtitle: "Upcoming and past meetings of town government bodies",
			}),
			block("TownMeetingsList"),
		],
	},
	{
		name: "Meeting Detail",
		url: "/meetings/:slug",
		title: "Meeting - Town of Harmony",
		description: "View meeting details, agenda, and minutes.",
		blocks: [block("TownMeetingDetail")],
	},

	// --- Business Directory ---
	{
		name: "Business Directory",
		url: "/business",
		title: "Business Directory - Town of Harmony",
		description:
			"Browse local businesses in the Town of Harmony business directory.",
		blocks: [
			block("TownPageHeader", {
				title: "Business Directory",
				subtitle: "Discover local businesses in our community",
			}),
			block("TownBusinessDirectory"),
		],
	},
	{
		name: "Business Detail",
		url: "/business/:slug",
		title: "Business - Town of Harmony",
		description: "View business details and contact information.",
		blocks: [block("TownBusinessDetail")],
	},

	// --- Elections ---
	{
		name: "Elections",
		url: "/elections",
		title: "Elections - Town of Harmony",
		description:
			"View upcoming and past elections, candidates, and voting information.",
		blocks: [
			block("TownPageHeader", {
				title: "Elections & Voting",
				subtitle: "Stay informed about local elections",
			}),
			block("TownElectionsList"),
		],
	},
	{
		name: "Election Detail",
		url: "/elections/:slug",
		title: "Election - Town of Harmony",
		description:
			"View election details, candidates, and polling information.",
		blocks: [block("TownElectionDetail")],
	},

	// --- Our Team ---
	{
		name: "Our Team",
		url: "/our-team",
		title: "Our Team - Town of Harmony",
		description:
			"Meet the officials and staff of the Town of Harmony government.",
		blocks: [
			block("TownPageHeader", {
				title: "Our Team",
				subtitle: "Meet the people who serve our community",
			}),
			block("TownTeamMembers"),
		],
	},

	// --- History ---
	{
		name: "History",
		url: "/history",
		title: "History - Town of Harmony",
		description:
			"Explore the rich history and landmarks of the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Our History",
				subtitle: "Explore the heritage of Harmony, North Carolina",
			}),
			block("TownHistoryTimeline"),
		],
	},

	// --- Resources ---
	{
		name: "Resources",
		url: "/resources",
		title: "Resources - Town of Harmony",
		description:
			"Access documents, services, and helpful links for Town of Harmony residents.",
		blocks: [
			block("TownPageHeader", {
				title: "Resources",
				subtitle: "Documents, services, and helpful links",
			}),
			block("TownResourcesList"),
		],
	},

	// --- Points of Interest ---
	{
		name: "Points of Interest",
		url: "/points-of-interest",
		title: "Points of Interest - Town of Harmony",
		description:
			"Discover parks, historic sites, and attractions in the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Points of Interest",
				subtitle: "Discover parks, landmarks, and attractions",
			}),
			block("TownPointsOfInterest"),
		],
	},

	// --- Emergency ---
	{
		name: "Emergency",
		url: "/emergency",
		title: "Emergency Services - Town of Harmony",
		description:
			"Emergency alerts, services, and contact information for the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Emergency Services",
				subtitle: "Emergency alerts, contacts, and preparedness",
				variant: "barn-red",
			}),
			block("TownEmergencyAlertsList", { showAll: false, limit: 5 }),
			block("TownEmergencyServices"),
		],
	},
	{
		name: "Emergency Alerts",
		url: "/emergency/alerts",
		title: "Emergency Alerts - Town of Harmony",
		description: "View all emergency alerts for the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Emergency Alerts",
				subtitle: "Current and past emergency notifications",
				variant: "barn-red",
			}),
			block("TownEmergencyAlertsList", { showAll: true }),
		],
	},

	// --- Contact ---
	{
		name: "Contact",
		url: "/contact",
		title: "Contact Us - Town of Harmony",
		description:
			"Get in touch with the Town of Harmony. Find phone numbers, email, office hours, and a contact form.",
		blocks: [
			block("TownPageHeader", {
				title: "Contact Us",
				subtitle: "Get in touch with Town of Harmony",
			}),
			block("TownContactForm"),
		],
	},

	// --- Permits ---
	{
		name: "Permits",
		url: "/permits",
		title: "Permits - Town of Harmony",
		description:
			"Information about building permits and applications in the Town of Harmony.",
		blocks: [
			block("TownPageHeader", {
				title: "Permits & Applications",
				subtitle: "Building permits, zoning, and applications",
			}),
			block("TownResourcesList", { type: "document" }),
		],
	},

	// --- Agenda & Minutes ---
	{
		name: "Agenda & Minutes",
		url: "/agenda-minutes",
		title: "Agenda & Minutes - Town of Harmony",
		description:
			"View meeting agendas and minutes for Town of Harmony government meetings.",
		blocks: [
			block("TownPageHeader", {
				title: "Agenda & Minutes",
				subtitle: "Meeting agendas and official minutes",
			}),
			block("TownAgendaMinutes"),
		],
	},
];

function buildPageBody(page: PageDef) {
	// Detail pages use :slug patterns — match with startsWith on the base path
	const isDetailPage = page.url.includes(":");
	const queryValue = isDetailPage
		? `${page.url.substring(0, page.url.indexOf(":"))}`
		: page.url;
	const queryOperator = isDetailPage ? "startsWith" : "is";

	return {
		name: page.name,
		data: {
			title: page.title,
			description: page.description,
			url: page.url,
			blocks: page.blocks,
		},
		query: [
			{
				"@type": "@builder.io/core:Query",
				property: "urlPath",
				operator: queryOperator,
				value: queryValue,
			},
		],
	};
}

async function main() {
	console.log(
		`Upserting ${pages.length} Builder.io pages${opts.dryRun ? " (dry run)" : ""}...\n`,
	);

	const existing = await fetchExisting(client, "page");
	const byUrl = indexExistingBy(
		existing,
		(e) => (e.data?.url as string | undefined) ?? undefined,
	);

	const counters = emptyCounters();

	for (const page of pages) {
		const label = `${page.name.padEnd(22)} ${page.url}`;
		try {
			const result = await upsert(
				client,
				"page",
				buildPageBody(page),
				page.url,
				byUrl,
				opts,
			);
			console.log(formatResult(label, result));
			tallyResult(counters, result);
		} catch (err) {
			console.error(
				`  [FAIL]     ${label}: ${err instanceof Error ? err.message : err}`,
			);
			counters.failed++;
		}
	}

	printSummary(counters, opts);
	if (counters.failed > 0) process.exit(1);
}

main();
