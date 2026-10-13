/**
 * Fix Builder.io CMS entries for SEO:
 * 1. Add unique descriptions to news articles (from static data excerpts)
 * 2. Make meeting titles unique by appending month/year
 *
 * Usage:
 *   npx tsx scripts/fix-builder-seo.ts
 *   npx tsx scripts/fix-builder-seo.ts --dry-run
 */

import { config } from "dotenv";
config();

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (!BUILDER_PRIVATE_KEY || !BUILDER_API_KEY) {
  console.error("Missing BUILDER_PRIVATE_KEY or NEXT_PUBLIC_BUILDER_API_KEY");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

const WRITE_API = "https://builder.io/api/v1/write";
const CDN_API = "https://cdn.builder.io/api/v3/content";

async function fetchEntries(model: string) {
  const url = `${CDN_API}/${model}?apiKey=${BUILDER_API_KEY}&limit=100&includeUnpublished=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${model}: ${res.status}`);
  const json = await res.json();
  return json.results;
}

async function updateEntry(model: string, entryId: string, data: Record<string, unknown>) {
  if (dryRun) {
    console.log(`  [DRY] Would update ${model}/${entryId}:`, JSON.stringify(data));
    return;
  }

  const url = `${WRITE_API}/${model}/${entryId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      data,
      published: "published",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  [FAIL] ${model}/${entryId}: ${res.status} ${text}`);
  } else {
    console.log(`  [OK] Updated ${model}/${entryId}`);
  }
}

// News descriptions from static data
const newsDescriptions: Record<string, string> = {
  "fy2025-26-budget-approved":
    "Town Council unanimously approved the FY2025-26 budget at the April meeting, allocating funds for sewer upgrades and park improvements.",
  "ncdot-hwy-21-resurfacing":
    "NCDOT will resurface a 1.2-mile section of Hwy 21 North through town this summer. Expect lane closures and flagging operations.",
  "community-center-reservations-2025":
    "The Harmony Community Center is open for event reservations. Updated rental rates and a new online request form are now available.",
  "spring-cleanup-day-2025":
    "The annual Spring Cleanup will be held Saturday, April 26. Dumpsters will be available at Town Hall for residential use.",
  "sewer-smoke-testing-may-2025":
    "The Town will conduct smoke testing of sewer lines in May to identify leaks and inflow sources. Smoke is non-toxic and harmless.",
};

// Month names for meeting title uniqueness
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMeetingDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

async function fixNewsDescriptions() {
  console.log("\n--- Fixing news descriptions ---");
  const entries = await fetchEntries("town-news");

  for (const entry of entries) {
    const slug = entry.data?.slug;
    const desc = newsDescriptions[slug];
    if (desc && !entry.data?.description) {
      console.log(`  ${entry.name}: adding description`);
      await updateEntry("town-news", entry.id, { description: desc });
    } else if (entry.data?.description) {
      console.log(`  ${entry.name}: already has description, skipping`);
    } else {
      console.log(`  ${entry.name}: no matching description found for slug "${slug}"`);
    }
  }
}

async function fixMeetingTitles() {
  console.log("\n--- Fixing duplicate meeting titles ---");
  const entries = await fetchEntries("town-meeting");

  for (const entry of entries) {
    const title = entry.data?.title;
    const date = entry.data?.meetingDate;

    if (!date) continue;

    const monthYear = formatMeetingDate(date);

    // Only fix "Town Council Regular Meeting" duplicates
    if (title === "Town Council Regular Meeting") {
      const newTitle = `Town Council Regular Meeting - ${monthYear}`;
      const description =
        `Regular meeting of the Harmony Town Council, ${monthYear}. ${entry.data?.agenda || ""}`.trim();
      console.log(`  ${entry.name} (${date}): -> "${newTitle}"`);
      await updateEntry("town-meeting", entry.id, {
        title: newTitle,
        description,
      });
    } else {
      // Non-duplicate titles still need descriptions
      const description = entry.data?.description || `${title}. ${entry.data?.agenda || ""}`.trim();
      if (!entry.data?.description) {
        console.log(`  ${entry.name}: adding description`);
        await updateEntry("town-meeting", entry.id, { description });
      } else {
        console.log(`  ${entry.name}: already has description, skipping`);
      }
    }
  }
}

async function fixEventDescriptions() {
  console.log("\n--- Checking event descriptions ---");
  const entries = await fetchEntries("town-event");

  for (const entry of entries) {
    if (entry.data?.description) {
      console.log(`  ${entry.name}: OK (has description)`);
    } else {
      console.log(`  ${entry.name}: missing description`);
    }
  }
}

async function main() {
  if (dryRun) console.log("=== DRY RUN ===\n");

  await fixNewsDescriptions();
  await fixMeetingTitles();
  await fixEventDescriptions();

  console.log("\nDone.");
}

main().catch(console.error);
