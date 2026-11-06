/**
 * Repair `data.slug` on Builder.io town-event entries.
 *
 * Two defects, one pass:
 *
 * 1. **Missing slug.** The field is intentionally optional in the model
 *    (editors can leave it blank), but a missing slug forces
 *    `getEventBySlug` down a fallback path that scans the full events
 *    collection. Derived from the entry title and written back.
 *
 * 2. **Malformed slug.** Editors type the slug by hand, so an entry can
 *    carry a value that is not URL-shaped. The Christmas Festival entry
 *    held a literal space — `"christmas-festival-tree-lighting 2026"` —
 *    which rendered every list link as `%20` and served a dead page
 *    (LAC-7168). Any slug that differs from its own slugified form is
 *    rewritten to that form.
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

  // Seed the seen-set with every slug already in Builder. Two events with
  // the same title would otherwise derive the same slug, which causes
  // silent routing collisions at `/events/<slug>`.
  const seenSlugs = new Set<string>();
  for (const event of events) {
    const slug = event.data?.slug;
    if (typeof slug === "string" && slug.trim() !== "") {
      seenSlugs.add(slug.trim());
    }
  }

  let backfilled = 0;
  let repaired = 0;
  let alreadyPresent = 0;
  let skippedNoTitle = 0;
  let skippedDuplicate = 0;

  for (const event of events) {
    const slug = event.data?.slug;
    if (typeof slug === "string" && slug.trim() !== "") {
      const canonical = slugify(slug);
      if (canonical === slug.trim()) {
        alreadyPresent++;
        continue;
      }
      // Present but not URL-shaped — a space, uppercase, punctuation. The
      // link and the lookup both canonicalize, so the stored value is the
      // odd one out; rewrite it (LAC-7168).
      if (!canonical) {
        console.log(`  [SKIP] ${event.id}: slug "${slug}" slugified to empty`);
        skippedNoTitle++;
        continue;
      }
      if (seenSlugs.has(canonical)) {
        console.log(
          `  [SKIP] ${event.id}: canonical slug "${canonical}" already in use by another event — fix "${slug}" by hand`
        );
        skippedDuplicate++;
        continue;
      }
      seenSlugs.delete(slug.trim());
      seenSlugs.add(canonical);
      if (dryRun) {
        console.log(`  [WOULD REPAIR]   "${slug}" → slug "${canonical}"`);
      } else {
        await writeSlug(event, canonical);
        console.log(`  [REPAIRED]       "${slug}" → slug "${canonical}"`);
      }
      repaired++;
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
    if (seenSlugs.has(derived)) {
      console.log(
        `  [SKIP] ${event.id}: derived slug "${derived}" already in use — rename "${title}" or set slug manually`
      );
      skippedDuplicate++;
      continue;
    }
    seenSlugs.add(derived);
    if (dryRun) {
      console.log(`  [WOULD BACKFILL] "${title}" → slug "${derived}"`);
    } else {
      await writeSlug(event, derived);
      console.log(`  [BACKFILLED]     "${title}" → slug "${derived}"`);
    }
    backfilled++;
  }

  const parts = [
    `${backfilled} backfilled`,
    `${repaired} repaired`,
    `${alreadyPresent} already canonical`,
    `${skippedNoTitle} skipped (no title)`,
  ];
  if (skippedDuplicate > 0) parts.push(`${skippedDuplicate} skipped (duplicate slug)`);
  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Summary: ${parts.join(", ")}`);
  if (skippedDuplicate > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
