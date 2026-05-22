/**
 * Sync Builder.io entry names from their data title/name fields.
 *
 * Builder.io data model entries have an internal "name" (CMS list label)
 * separate from data fields like `data.title`. These can diverge when
 * entries are created manually in the Builder UI. This script fixes that.
 *
 * Usage:
 *   npx tsx scripts/sync-builder-names.ts                    # all models
 *   npx tsx scripts/sync-builder-names.ts --model=town-event # one model
 *   npx tsx scripts/sync-builder-names.ts --dry-run          # preview only
 */

import { config } from "dotenv";
config();

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_CDN = "https://cdn.builder.io/api/v3/content";
const BUILDER_WRITE = "https://builder.io/api/v1/write";

if (!BUILDER_API_KEY || !BUILDER_PRIVATE_KEY) {
	console.error("Missing NEXT_PUBLIC_BUILDER_API_KEY or BUILDER_PRIVATE_KEY");
	process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const modelFilter = args.find((a) => a.startsWith("--model="))?.split("=")[1];

const MODELS_WITH_TITLE: Record<string, string> = {
	"town-event": "title",
	"town-news": "title",
	"town-emergency-service": "title",
	"town-history-article": "title",
	"town-resource": "title",
	"town-announcement": "title",
	"town-meeting": "title",
	"town-election": "title",
	"town-team-member": "name",
	"town-point-of-interest": "name",
	"town-business": "name",
	"town-map-business": "name",
	"town-sewer-rate": "name",
};

interface Entry {
	id: string;
	name: string;
	data?: Record<string, unknown>;
}

async function fetchAll(model: string): Promise<Entry[]> {
	const all: Entry[] = [];
	for (let offset = 0; ; offset += 100) {
		const url = new URL(`${BUILDER_CDN}/${model}`);
		url.searchParams.set("apiKey", BUILDER_API_KEY!);
		url.searchParams.set("limit", "100");
		url.searchParams.set("offset", String(offset));
		url.searchParams.set("includeUnpublished", "true");
		url.searchParams.set("cachebust", "true");
		url.searchParams.set("noCache", "true");
		const res = await fetch(url.toString(), { cache: "no-store" });
		if (!res.ok) break;
		const json = (await res.json()) as { results?: Entry[] };
		const results = json.results ?? [];
		all.push(...results);
		if (results.length < 100) break;
	}
	return all;
}

async function patchName(model: string, entryId: string, newName: string): Promise<void> {
	const res = await fetch(`${BUILDER_WRITE}/${model}/${entryId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
		},
		body: JSON.stringify({ name: newName }),
	});
	if (!res.ok) {
		throw new Error(`PATCH failed: ${res.status} ${await res.text()}`);
	}
}

async function main() {
	const models = modelFilter
		? { [modelFilter]: MODELS_WITH_TITLE[modelFilter] }
		: MODELS_WITH_TITLE;

	if (modelFilter && !MODELS_WITH_TITLE[modelFilter]) {
		console.error(`Unknown model "${modelFilter}". Known: ${Object.keys(MODELS_WITH_TITLE).join(", ")}`);
		process.exit(1);
	}

	if (dryRun) console.log("=== DRY RUN ===\n");

	let totalFixed = 0;
	let totalChecked = 0;

	for (const [model, titleField] of Object.entries(models)) {
		if (!titleField) continue;
		const entries = await fetchAll(model);
		console.log(`${model} (${entries.length} entries):`);

		for (const entry of entries) {
			totalChecked++;
			const dataTitle = entry.data?.[titleField];
			if (typeof dataTitle !== "string" || !dataTitle) continue;

			if (entry.name !== dataTitle) {
				if (dryRun) {
					console.log(`  [WOULD FIX] "${entry.name}" → "${dataTitle}"`);
				} else {
					await patchName(model, entry.id, dataTitle);
					console.log(`  [FIXED] "${entry.name}" → "${dataTitle}"`);
				}
				totalFixed++;
			}
		}
	}

	console.log(`\n${dryRun ? "[DRY RUN] " : ""}Checked ${totalChecked}, fixed ${totalFixed}`);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
