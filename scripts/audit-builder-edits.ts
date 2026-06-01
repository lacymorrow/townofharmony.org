/**
 * Read-only audit of Builder.io entries vs. last seed timestamp.
 *
 * Lists every entry whose `lastUpdated` is more than EDIT_THRESHOLD_MS past
 * the seed timestamp (or createdDate fallback) — i.e. client-edited since
 * the last seed. Dumps the current `data` payload of each edited entry so
 * we can reconcile local src/data/town/* files before re-seeding.
 *
 * Usage: npx tsx scripts/audit-builder-edits.ts [--model=town-news] [--json]
 */

import { config } from "dotenv";

config();

import { modelDefinitions } from "../src/lib/builder-model-definitions";
import {
	EDIT_THRESHOLD_MS,
	fetchExisting,
	formatTimestamp,
	isEdited,
	SEED_TIMESTAMP_FIELD,
} from "./lib/builder-upsert";

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (!BUILDER_PRIVATE_KEY || !BUILDER_API_KEY) {
	console.error("Missing BUILDER_PRIVATE_KEY or NEXT_PUBLIC_BUILDER_API_KEY");
	process.exit(1);
}

const client = { apiKey: BUILDER_API_KEY, privateKey: BUILDER_PRIVATE_KEY };

const args = process.argv.slice(2);
const modelFilter = args.find((a) => a.startsWith("--model="))?.split("=")[1];
const asJson = args.includes("--json");

interface EditedReport {
	model: string;
	id: string;
	name: string;
	lastUpdated: string;
	seededAt: string | null;
	createdAt: string;
	data: Record<string, unknown>;
}

async function main() {
	const models = modelFilter
		? modelDefinitions.filter((m) => m.name === modelFilter)
		: modelDefinitions;

	const report: EditedReport[] = [];
	const counts: Record<string, { total: number; edited: number; neverSeeded: number }> = {};

	for (const model of models) {
		let existing: Awaited<ReturnType<typeof fetchExisting>>;
		try {
			existing = await fetchExisting(client, model.name);
		} catch (err) {
			console.error(`[FAIL] ${model.name}: ${err instanceof Error ? err.message : err}`);
			continue;
		}

		let editedCount = 0;
		let neverSeeded = 0;
		for (const e of existing) {
			const seedAt = e.data?.[SEED_TIMESTAMP_FIELD];
			const hasSeedStamp = typeof seedAt === "number" && seedAt > 0;
			if (!hasSeedStamp) neverSeeded++;
			if (isEdited(e)) {
				editedCount++;
				report.push({
					model: model.name,
					id: e.id,
					name: e.name,
					lastUpdated: formatTimestamp(e.lastUpdated),
					seededAt: hasSeedStamp ? formatTimestamp(seedAt as number) : null,
					createdAt: formatTimestamp(e.createdDate),
					data: { ...(e.data ?? {}) },
				});
			}
		}
		counts[model.name] = { total: existing.length, edited: editedCount, neverSeeded };
	}

	if (asJson) {
		console.log(
			JSON.stringify({ counts, edited: report, thresholdMs: EDIT_THRESHOLD_MS }, null, 2)
		);
		return;
	}

	console.log("\n=== Builder.io drift audit ===\n");
	console.log(`Edit threshold: ${EDIT_THRESHOLD_MS}ms past seed/create\n`);
	for (const [model, c] of Object.entries(counts)) {
		const flag = c.edited > 0 ? " ⚠" : "";
		console.log(
			`  ${model.padEnd(32)} total=${String(c.total).padStart(4)}  edited=${String(c.edited).padStart(3)}  never-seeded=${String(c.neverSeeded).padStart(3)}${flag}`
		);
	}

	if (report.length === 0) {
		console.log("\nNo post-seed edits detected. Safe to re-seed.\n");
		return;
	}

	console.log(`\n--- Edited entries (${report.length}) ---\n`);
	for (const r of report) {
		console.log(`\n[${r.model}] "${r.name}" (${r.id})`);
		console.log(`  seededAt:   ${r.seededAt ?? "(never)"}`);
		console.log(`  createdAt:  ${r.createdAt}`);
		console.log(`  lastUpdated: ${r.lastUpdated}`);
		const dataNoStamp = { ...r.data };
		delete dataNoStamp[SEED_TIMESTAMP_FIELD];
		console.log(`  data: ${JSON.stringify(dataNoStamp, null, 2).replace(/\n/g, "\n        ")}`);
	}
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
