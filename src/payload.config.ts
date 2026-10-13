// ! Don't use @/env here, it will break the build
// Minimal Payload CMS config for Town of Harmony.
// Payload is disabled by default (NEXT_PUBLIC_FEATURE_PAYLOAD_ENABLED=false).
// This file must exist for the build to succeed even when Payload is unused.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "change-me-in-production",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? "",
    },
    schemaName: "payload",
  }),
  editor: lexicalEditor(),
  routes: {
    admin: "/cms",
    api: "/cms-api",
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [],
  globals: [],
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
