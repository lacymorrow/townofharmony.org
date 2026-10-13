/**
 * Delete all Builder.io page documents.
 * Run this before re-seeding via seed-builder-pages.ts to avoid duplicates.
 *
 * Usage: pnpm exec tsx scripts/clean-builder-pages.ts
 */

import { config } from "dotenv";
config();

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY!;
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

if (!BUILDER_PRIVATE_KEY || !BUILDER_API_KEY) {
  console.error("Missing BUILDER_PRIVATE_KEY or NEXT_PUBLIC_BUILDER_API_KEY");
  process.exit(1);
}

interface PageEntry {
  id: string;
  name: string;
  urlPath: string;
}

async function listPages(): Promise<PageEntry[]> {
  const res = await fetch(
    `https://cdn.builder.io/api/v3/content/page?apiKey=${BUILDER_API_KEY}&limit=200&includeUnpublished=true`
  );
  if (!res.ok) {
    throw new Error(`List pages: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return (json.results || []).map((r: any) => ({
    id: r.id,
    name: r.name || "unnamed",
    urlPath: r.query?.find((q: any) => q.property === "urlPath")?.value ?? r.data?.url ?? "?",
  }));
}

async function deletePage(id: string): Promise<void> {
  const res = await fetch(`https://builder.io/api/v1/write/page/${id}?apiKey=${BUILDER_API_KEY}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete ${id}: ${res.status} ${text}`);
  }
}

async function main() {
  const pages = await listPages();
  console.log(`Found ${pages.length} page documents.`);
  for (const p of pages) {
    console.log(`  ${p.urlPath.padEnd(40)} ${p.name}`);
  }

  if (!process.argv.includes("--delete")) {
    console.log("\nDry run. Pass --delete to remove all pages.");
    return;
  }

  let success = 0;
  let failed = 0;
  for (const p of pages) {
    try {
      await deletePage(p.id);
      console.log(`  [DEL] ${p.urlPath} (${p.name})`);
      success++;
    } catch (err) {
      console.error(`  [FAIL] ${p.urlPath}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} deleted, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
