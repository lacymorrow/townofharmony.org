/**
 * Destructively drop a single field from a Builder.io data model.
 *
 * `sync-builder-models.ts` preserves live-only fields by design — this script
 * is the explicit escape hatch when a field has been intentionally removed
 * from `modelDefinitions` and the live schema needs to follow. Existing
 * entry data on the dropped field is left intact in Builder (orphaned data,
 * but Builder hides it from the UI once the field is gone).
 *
 * Usage:
 *   npx tsx scripts/drop-builder-field.ts --model=town-contact-inquiry-type --field=sortOrder
 *   npx tsx scripts/drop-builder-field.ts --model=town-contact-inquiry-type --field=sortOrder --dry-run
 */

import { config } from "dotenv";
config();

import { createAdminApiClient } from "@builder.io/admin-sdk";

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
	console.error("Missing BUILDER_PRIVATE_KEY env var");
	process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const modelName = args.find((a) => a.startsWith("--model="))?.split("=")[1];
const fieldName = args.find((a) => a.startsWith("--field="))?.split("=")[1];

if (!modelName || !fieldName) {
	console.error("Required: --model=<name> --field=<name>");
	process.exit(1);
}

const adminClient = createAdminApiClient(PRIVATE_KEY);

interface LiveModel {
	id: string;
	name: string;
	fields: Array<Record<string, unknown>>;
}

async function main() {
	const live = await adminClient.query({
		models: { id: true, name: true, fields: true },
	});
	// GraphQL errors come back in `errors`, not as thrown exceptions. Without
	// this check, a 401 / permission failure would look like "model not found".
	if (live.errors?.length) {
		console.error("Builder.io query errors:", JSON.stringify(live.errors, null, 2));
		process.exit(1);
	}

	const models = (live.data?.models ?? []) as unknown as LiveModel[];
	const model = models.find((m) => m.name === modelName);
	if (!model) {
		console.error(`Model "${modelName}" not found.`);
		process.exit(1);
	}

	const existing = model.fields ?? [];
	const matchingField = existing.find((f) => f.name === fieldName);
	if (!matchingField) {
		console.log(`Field "${fieldName}" is not present on "${modelName}" — nothing to do.`);
		return;
	}

	const remaining = existing.filter((f) => f.name !== fieldName);
	console.log(`Will drop "${fieldName}" from "${modelName}".`);
	console.log(`  Before: ${existing.length} field(s)  →  After: ${remaining.length} field(s)`);

	if (dryRun) {
		console.log("[DRY RUN] No changes written.");
		return;
	}

	const result = await adminClient.mutation({
		updateModel: [
			{ body: { id: model.id, data: { fields: remaining } } },
			{ id: true, name: true },
		],
	});
	if (result.errors?.length) {
		console.error("Builder.io mutation errors:", JSON.stringify(result.errors, null, 2));
		process.exit(1);
	}
	if (!result.data?.updateModel) {
		throw new Error(`updateModel returned no data for ${modelName}`);
	}
	console.log(`✓ dropped (${result.data.updateModel.id})`);
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
