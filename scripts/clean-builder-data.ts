/**
 * Clean stale Builder.io data entries and re-seed with current static data.
 *
 * Usage:
 *   npx tsx scripts/clean-builder-data.ts              # List all entries (dry run)
 *   npx tsx scripts/clean-builder-data.ts --delete      # Delete all entries
 *   npx tsx scripts/clean-builder-data.ts --model=town-news --delete  # Delete entries for one model
 *   npx tsx scripts/clean-builder-data.ts --update-models  # Update model schemas
 *
 * After cleaning, run seed-builder-data.ts --data-only to re-seed.
 */

import { config } from "dotenv";
config();

import { createAdminApiClient } from "@builder.io/admin-sdk";
import { modelDefinitions } from "../src/lib/builder-model-definitions";

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY!;
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

if (!BUILDER_PRIVATE_KEY || !BUILDER_API_KEY) {
  console.error("Missing BUILDER_PRIVATE_KEY or NEXT_PUBLIC_BUILDER_API_KEY");
  process.exit(1);
}

const adminClient = createAdminApiClient(BUILDER_PRIVATE_KEY);

const args = process.argv.slice(2);
const doDelete = args.includes("--delete");
const updateModels = args.includes("--update-models");
const modelFilter = args.find((a) => a.startsWith("--model="))?.split("=")[1];

const modelNames = modelFilter ? [modelFilter] : modelDefinitions.map((m) => m.name);

// ============================================================
// List entries for a model via Content API
// ============================================================
async function listEntries(modelName: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(
    `https://cdn.builder.io/api/v3/content/${modelName}?apiKey=${BUILDER_API_KEY}&limit=100&includeUnpublished=true`
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`List ${modelName}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return (json.results || []).map((r: any) => ({
    id: r.id,
    name: r.name || r.data?.name || r.data?.title || "unnamed",
  }));
}

// ============================================================
// Delete a single entry via Write API
// ============================================================
async function deleteEntry(modelName: string, entryId: string): Promise<void> {
  const res = await fetch(
    `https://builder.io/api/v1/write/${modelName}/${entryId}?apiKey=${BUILDER_API_KEY}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete ${entryId}: ${res.status} ${text}`);
  }
}

// ============================================================
// Update model schema via Admin SDK
// ============================================================
async function updateModelSchema(definition: (typeof modelDefinitions)[0]) {
  try {
    const fields = definition.fields.map((f) => ({
      "@type": "@builder.io/core:Field" as const,
      name: f.name,
      type: f.type,
      required: f.required ?? false,
      ...(f.defaultValue !== undefined ? { defaultValue: f.defaultValue } : {}),
      ...(f.enum ? { enum: f.enum } : {}),
      ...(f.subFields
        ? {
            subFields: f.subFields.map((sf) => ({
              "@type": "@builder.io/core:Field" as const,
              ...sf,
            })),
          }
        : {}),
    }));

    const result = await adminClient.mutation({
      updateModel: [{ body: { fields } as Record<string, unknown> }, { id: true, name: true }],
    });

    return result.data?.updateModel;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // If model doesn't exist, create it
    if (message.includes("not found") || message.includes("does not exist")) {
      console.log(`  Model "${definition.name}" not found, creating...`);
      const result = await adminClient.mutation({
        addModel: [
          {
            body: {
              name: definition.name,
              kind: definition.kind,
              fields: definition.fields.map((f) => ({
                "@type": "@builder.io/core:Field" as const,
                name: f.name,
                type: f.type,
                required: f.required ?? false,
                ...(f.defaultValue !== undefined ? { defaultValue: f.defaultValue } : {}),
                ...(f.enum ? { enum: f.enum } : {}),
                ...(f.subFields
                  ? {
                      subFields: f.subFields.map((sf) => ({
                        "@type": "@builder.io/core:Field" as const,
                        ...sf,
                      })),
                    }
                  : {}),
              })),
            },
          },
          { id: true, name: true },
        ],
      });
      return result.data?.addModel;
    }
    throw err;
  }
}

// ============================================================
// Main
// ============================================================
async function main() {
  // Phase 1: Update model schemas
  if (updateModels) {
    const models = modelFilter
      ? modelDefinitions.filter((m) => m.name === modelFilter)
      : modelDefinitions;

    console.log(`\nUpdating ${models.length} model schemas...\n`);

    for (const model of models) {
      try {
        const result = await updateModelSchema(model);
        console.log(`  [OK] "${model.name}" updated (${model.fields.length} fields)`);
      } catch (err) {
        console.error(`  [FAIL] "${model.name}": ${err instanceof Error ? err.message : err}`);
      }
    }
    console.log();
  }

  // Phase 2: List/delete entries
  console.log(
    `\n${doDelete ? "Deleting" : "Listing"} entries for ${modelNames.length} models...\n`
  );

  let totalEntries = 0;
  let totalDeleted = 0;
  let totalFailed = 0;

  for (const modelName of modelNames) {
    const entries = await listEntries(modelName);
    totalEntries += entries.length;

    if (entries.length === 0) {
      console.log(`  ${modelName}: (empty)`);
      continue;
    }

    console.log(`  ${modelName}: ${entries.length} entries`);

    for (const entry of entries) {
      if (doDelete) {
        try {
          await deleteEntry(modelName, entry.id);
          console.log(`    [DEL] ${entry.name} (${entry.id})`);
          totalDeleted++;
        } catch (err) {
          console.error(`    [FAIL] ${entry.name}: ${err instanceof Error ? err.message : err}`);
          totalFailed++;
        }
      } else {
        console.log(`    ${entry.name} (${entry.id})`);
      }
    }
  }

  console.log(
    `\nTotal: ${totalEntries} entries found${doDelete ? `, ${totalDeleted} deleted, ${totalFailed} failed` : ""}`
  );

  if (!doDelete && totalEntries > 0) {
    console.log("\nRun with --delete to remove all entries.");
    console.log("Then run: npx tsx scripts/seed-builder-data.ts --data-only");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
