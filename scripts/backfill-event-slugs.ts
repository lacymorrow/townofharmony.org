/**
 * Backfill missing `data.slug` on Builder.io town-event entries.
 *
 * The slug field is intentionally optional in the model (editors can leave
 * it blank), but a missing slug forces `getEventBySlug` down a fallback
 * path that scans the full events collection. Derives the slug from the
 * entry title and writes it back, so the fast Builder query path is used
 * for every event from then on.
 *
 * Usage:
 *   npx tsx scripts/backfill-event-slugs.ts --dry-run   # preview only
 *   npx tsx scripts/backfill-event-slugs.ts             # apply
 */

import { config } from "dotenv";
config();

import { slugify } from "../src/lib/utils/extract-headings";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_CDN = "https://cdn.builder.io/api/v3/content";
const BUILDER_WRITE = "https://builder.io/api/v1/write";
const MODEL = "town-event";

if (!BUILDER_API_KEY || !BUILDER_PRIVATE_KEY) {
	console.error("Missing NEXT_PUBLIC_BUILDER_API_KEY or BUILDER_PRIVATE_KEY");
	process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

interface Entry {
	id: string;
	name: string;
	data?: Record<string, unknown>;
	published?: string;
}

async function fetchAllEvents(): Promise<Entry[]> {
	const all: Entry[] = [];
	for (let offset = 0; ; offset += 100) {
		const url = new URL(`${BUILDER_CDN}/${MODEL}`);
		url.searchParams.set("apiKey", BUILDER_API_KEY!);
		url.searchParams.set("limit", "100");
		url.searchParams.set("offset", String(offset));
		url.searchParams.set("includeUnpublished", "true");
		url.searchParams.set("cachebust", "true");
		url.searchParams.set("noCache", "true");
		const res = await fetch(url.toString(), { cache: "no-store" });
		if (!res.ok) {
			throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
		}
		const json = (await res.json()) as { results?: Entry[] };
		const results = json.results ?? [];
		all.push(...results);
		if (results.length < 100) break;
	}
	return all;
}

async function writeSlug(entry: Entry, slug: string): Promise<void> {
	const data = { ...(entry.data ?? {}), slug };
	const res = await fetch(`${BUILDER_WRITE}/${MODEL}/${entry.id}?apiKey=${BUILDER_API_KEY}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
		},
		body: JSON.stringify({
			published: entry.published ?? "published",
			name: entry.name,
			data,
		}),
	});
	if (!res.ok) {
		throw new Error(`PUT ${entry.id} failed: ${res.status} ${await res.text()}`);
	}
}

async function main() {
	const events = await fetchAllEvents();
	console.log(`Fetched ${events.length} town-event entries\n`);
	if (dryRun) console.log("=== DRY RUN ===\n");

	let backfilled = 0;
	let alreadyPresent = 0;
	let skippedNoTitle = 0;

	for (const event of events) {
		const slug = event.data?.slug;
		if (typeof slug === "string" && slug.trim() !== "") {
			alreadyPresent++;
			continue;
		}
		const title = event.data?.title;
		if (typeof title !== "string" || !title.trim()) {
			console.log(`  [SKIP] ${event.id}: no title to derive slug from`);
			skippedNoTitle++;
			continue;
		}
		const derived = slugify(title);
		if (!derived) {
			console.log(`  [SKIP] ${event.id}: title "${title}" slugified to empty`);
			skippedNoTitle++;
			continue;
		}
		if (dryRun) {
			console.log(`  [WOULD BACKFILL] "${title}" → slug "${derived}"`);
		} else {
			await writeSlug(event, derived);
			console.log(`  [BACKFILLED]     "${title}" → slug "${derived}"`);
		}
		backfilled++;
	}

	console.log(
		`\n${dryRun ? "[DRY RUN] " : ""}Summary: ${backfilled} backfilled, ${alreadyPresent} already had slug, ${skippedNoTitle} skipped (no title)`,
	);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
