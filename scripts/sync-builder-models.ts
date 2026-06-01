/**
 * Sync Builder.io data model schemas with the local `modelDefinitions`.
 *
 * `seed-builder-data.ts` only *creates* models — once a model exists in
 * Builder.io it never updates the schema even if we change field types,
 * required flags, helperText, etc. locally. This script closes that gap by
 * pushing local field definitions to existing live models via the Admin SDK's
 * `updateModel` mutation.
 *
 * Usage:
 *   bun run scripts/sync-builder-models.ts                 # all models, apply
 *   bun run scripts/sync-builder-models.ts --dry-run       # diff only
 *   bun run scripts/sync-builder-models.ts --model=town-event
 *
 * Env vars (loaded from .env automatically):
 *   BUILDER_PRIVATE_KEY        - Builder.io private API key
 *   NEXT_PUBLIC_BUILDER_API_KEY - (not strictly needed here, but parity)
 */

import { config } from "dotenv";
config();

import { createAdminApiClient } from "@builder.io/admin-sdk";
import { modelDefinitions, type BuilderField } from "../src/lib/builder-model-definitions";

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
	console.error("Missing BUILDER_PRIVATE_KEY env var");
	process.exit(1);
}

const adminClient = createAdminApiClient(PRIVATE_KEY);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const modelFilter = args.find((a) => a.startsWith("--model="))?.split("=")[1];

/** Build the raw field object Builder.io's API expects. */
function buildFieldPayload(f: BuilderField): Record<string, unknown> {
	const payload: Record<string, unknown> = {
		"@type": "@builder.io/core:Field",
		name: f.name,
		type: f.type,
		required: f.required ?? false,
	};
	if (f.defaultValue !== undefined) payload.defaultValue = f.defaultValue;
	if (f.enum) payload.enum = f.enum;
	if (f.allowedFileTypes) payload.allowedFileTypes = f.allowedFileTypes;
	if (f.regex) payload.regex = f.regex;
	if (f.helperText) payload.helperText = f.helperText;
	if (f.friendlyName) payload.friendlyName = f.friendlyName;
	if (f.advanced !== undefined) payload.advanced = f.advanced;
	if (f.model) payload.model = f.model;
	if (f.subFields) {
		payload.subFields = f.subFields.map(buildFieldPayload);
	}
	return payload;
}

interface LiveModel {
	id: string;
	name: string;
	fields: Array<Record<string, unknown>>;
	nameField?: string | null;
	helperText?: string | null;
}

async function fetchLiveModels(): Promise<LiveModel[]> {
	const result = await adminClient.query({
		models: {
			id: true,
			name: true,
			fields: true,
			nameField: true,
			helperText: true,
		},
	});
	return (result.data?.models ?? []) as unknown as LiveModel[];
}

interface FieldDiff {
	added: string[];
	removed: string[];
	changed: Array<{ name: string; reasons: string[] }>;
}

function diffFields(
	localFields: BuilderField[],
	liveFields: Array<Record<string, unknown>>,
): FieldDiff {
	const localByName = new Map(localFields.map((f) => [f.name, f]));
	const liveByName = new Map(liveFields.map((f) => [f.name as string, f]));

	const added: string[] = [];
	const removed: string[] = [];
	const changed: FieldDiff["changed"] = [];

	for (const [name, lf] of localByName) {
		const live = liveByName.get(name);
		if (!live) {
			added.push(name);
			continue;
		}
		const reasons: string[] = [];
		if ((live.type as string) !== lf.type) {
			reasons.push(`type ${String(live.type)} → ${lf.type}`);
		}
		if (((live.required as boolean | undefined) ?? false) !== (lf.required ?? false)) {
			reasons.push(`required ${live.required ?? false} → ${lf.required ?? false}`);
		}
		if (((live.helperText as string | undefined) ?? "") !== (lf.helperText ?? "")) {
			reasons.push(`helperText`);
		}
		if (((live.friendlyName as string | undefined) ?? "") !== (lf.friendlyName ?? "")) {
			reasons.push(`friendlyName`);
		}
		const liveEnum = (live.enum as string[] | undefined) ?? [];
		const localEnum = lf.enum ?? [];
		if (liveEnum.join("|") !== localEnum.join("|")) {
			reasons.push(`enum`);
		}
		if (reasons.length > 0) changed.push({ name, reasons });
	}

	for (const name of liveByName.keys()) {
		if (!localByName.has(name)) removed.push(name);
	}

	return { added, removed, changed };
}

async function syncModel(definition: (typeof modelDefinitions)[number], live: LiveModel) {
	const diff = diffFields(definition.fields, live.fields);
	const nameFieldDiff =
		(definition.nameField ?? null) !== (live.nameField ?? null)
			? `nameField ${live.nameField ?? "null"} → ${definition.nameField ?? "null"}`
			: null;
	const liveHelper = (live.helperText ?? "") || "";
	const localHelper = definition.helperText ?? "";
	const modelHelperDiff = liveHelper !== localHelper ? "model helperText" : null;

	const hasChanges =
		diff.added.length > 0 ||
		diff.removed.length > 0 ||
		diff.changed.length > 0 ||
		nameFieldDiff !== null ||
		modelHelperDiff !== null;

	if (!hasChanges) {
		console.log(`  [OK]    ${definition.name} — no schema drift`);
		return false;
	}

	console.log(`\n  [DIFF]  ${definition.name}`);
	if (nameFieldDiff) console.log(`     • ${nameFieldDiff}`);
	if (modelHelperDiff) console.log(`     • ${modelHelperDiff}`);
	for (const name of diff.added) console.log(`     + add ${name}`);
	for (const name of diff.removed)
		console.log(`     - drop ${name}  (PRESERVED; sync only adds/updates)`);
	for (const c of diff.changed) console.log(`     ~ ${c.name}: ${c.reasons.join(", ")}`);

	if (dryRun) return true;

	// Merge strategy: union of local + live fields, preferring local definitions
	// where they exist. Live-only fields are kept (we never destructively drop
	// fields here — that should be an explicit, manual decision).
	const mergedFields: Array<Record<string, unknown>> = [];
	const seen = new Set<string>();
	for (const lf of definition.fields) {
		mergedFields.push(buildFieldPayload(lf));
		seen.add(lf.name);
	}
	for (const lf of live.fields) {
		const name = lf.name as string;
		if (!seen.has(name)) {
			mergedFields.push(lf);
		}
	}

	const data: Record<string, unknown> = { fields: mergedFields };
	if (definition.nameField !== undefined) data.nameField = definition.nameField;
	if (definition.helperText !== undefined) data.helperText = definition.helperText;

	const result = await adminClient.mutation({
		updateModel: [
			{ body: { id: live.id, data } },
			{ id: true, name: true },
		],
	});
	if (!result.data?.updateModel) {
		throw new Error(`updateModel returned no data for ${definition.name}`);
	}
	console.log(`     ✓ updated (${result.data.updateModel.id})`);
	return true;
}

async function main() {
	const targets = modelFilter
		? modelDefinitions.filter((m) => m.name === modelFilter)
		: modelDefinitions;
	if (modelFilter && targets.length === 0) {
		console.error(`No model definition found for "${modelFilter}"`);
		process.exit(1);
	}

	console.log(`\n=== sync-builder-models${dryRun ? " (dry run)" : ""} ===\n`);
	console.log(`Fetching live models…`);
	const live = await fetchLiveModels();
	const liveByName = new Map(live.map((m) => [m.name, m]));
	console.log(`  ${live.length} live models found.\n`);

	let changedCount = 0;
	let missingCount = 0;
	for (const def of targets) {
		const liveModel = liveByName.get(def.name);
		if (!liveModel) {
			console.log(`  [MISSING] ${def.name} — create via seed-builder-data.ts first`);
			missingCount++;
			continue;
		}
		try {
			const didChange = await syncModel(def, liveModel);
			if (didChange) changedCount++;
		} catch (err) {
			console.error(
				`  [FAIL] ${def.name}: ${err instanceof Error ? err.message : String(err)}`,
			);
			process.exitCode = 1;
		}
	}

	console.log(
		`\n${dryRun ? "[DRY RUN] " : ""}Summary: ${changedCount} ${
			dryRun ? "would change" : "updated"
		}, ${missingCount} missing, ${targets.length - changedCount - missingCount} unchanged.\n`,
	);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
