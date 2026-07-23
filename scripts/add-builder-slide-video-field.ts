/**
 * One-off: add the optional `video` field to the live Builder.io
 * `town-homepage-slide` model without touching any pre-existing field.
 *
 * `sync-builder-models.ts` would also correct pre-existing drift on `image`
 * (url → file), which is out of scope for LAC-2909. This script preserves the
 * live schema verbatim and only appends `video`.
 *
 * Usage:
 *   bun run scripts/add-builder-slide-video-field.ts            # apply
 *   bun run scripts/add-builder-slide-video-field.ts --dry-run  # diff only
 */

import { config } from "dotenv";
config();

import { createAdminApiClient } from "@builder.io/admin-sdk";

const PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("Missing BUILDER_PRIVATE_KEY env var");
  process.exit(1);
}

const adminClient = createAdminApiClient(PRIVATE_KEY);

const dryRun = process.argv.includes("--dry-run");
const MODEL_NAME = "town-homepage-slide";
const FIELD_NAME = "video";

const videoField = {
  "@type": "@builder.io/core:Field",
  name: FIELD_NAME,
  type: "file",
  required: false,
  allowedFileTypes: ["mp4", "webm", "mov", "m4v"],
  helperText:
    "Optional background video (muted, autoplay, playsInline). Image field is used as the poster and as the fallback when video is missing or the browser can't play it, or when the visitor prefers reduced motion.",
};

async function main() {
  const result = await adminClient.query({
    models: {
      id: true,
      name: true,
      fields: true,
    },
  });
  const models = (result.data?.models ?? []) as Array<{
    id: string;
    name: string;
    fields: Array<Record<string, unknown>>;
  }>;

  const model = models.find((m) => m.name === MODEL_NAME);
  if (!model) {
    console.error(`Model "${MODEL_NAME}" not found on live Builder.io space`);
    process.exit(1);
  }

  const already = model.fields.find((f) => (f.name as string) === FIELD_NAME);
  if (already) {
    console.log(`Field "${FIELD_NAME}" already exists on ${MODEL_NAME} — nothing to do.`);
    return;
  }

  console.log(`Will append field "${FIELD_NAME}" to ${MODEL_NAME} (id=${model.id})`);
  console.log("  payload:", JSON.stringify(videoField, null, 2));

  if (dryRun) {
    console.log("[dry run] no changes applied");
    return;
  }

  const nextFields = [...model.fields, videoField];
  const update = await adminClient.mutation({
    updateModel: [
      { body: { id: model.id, data: { fields: nextFields } } },
      { id: true, name: true },
    ],
  });
  if (!update.data?.updateModel) {
    throw new Error("updateModel returned no data");
  }
  console.log(`✓ ${MODEL_NAME} updated (${update.data.updateModel.id})`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
