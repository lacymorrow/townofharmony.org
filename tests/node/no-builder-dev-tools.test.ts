import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for LAC-4994.
 *
 * `@builder.io/dev-tools` wires a webpack plugin that builds its own dev-tools
 * server. Somewhere between 1.60.0 and 1.75.0 that server stopped reading
 * TypeScript itself and started expecting a `ts` option from its caller, but
 * upstream never updated their own next/webpack/vite entries to pass one, and
 * still had not by 1.94.0. So `createDevTools()` rejects with
 *
 *   createDevTools() requires a TypeScript instance passed to the 'ts' option
 *
 * The rejection happens inside the plugin's `processAssets` hook, which then
 * never calls its webpack callback: `bun dev` prints "Compiling /instrumentation"
 * and wedges at 0% CPU forever, serving nothing. Production builds were spared
 * only because the plugin disables itself when NODE_ENV is "production".
 *
 * The package is dev-only overlay tooling and no published version of it can
 * start, so it was dropped along with `src/config/nextjs/with-builder.ts`, which
 * existed solely to apply it. Builder.io content editing happens in the Builder
 * dashboard and is unaffected.
 *
 * Do not reintroduce it. An upstream Shipkit sync will try. If Builder ever
 * ships a release whose webpack entry passes `ts`, re-adding is one import.
 */
const ROOT = process.cwd();
const PACKAGE = "@builder.io/dev-tools";

const readJson = (relativePath: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(ROOT, relativePath), "utf8"));

const collectSources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectSources(path);
    return /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(entry.name) ? [path] : [];
  });

describe("@builder.io/dev-tools stays out of the build (LAC-4994)", () => {
  it("is not a dependency", () => {
    const pkg = readJson("package.json") as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    // Keys, not toHaveProperty: the package name contains a dot, which
    // toHaveProperty would read as a nested path and always pass.
    expect(Object.keys(pkg.dependencies ?? {})).not.toContain(PACKAGE);
    expect(Object.keys(pkg.devDependencies ?? {})).not.toContain(PACKAGE);
  });

  it("is not handed to registry consumers", () => {
    const registry = readJson("registry.json") as {
      items: { name: string; dependencies?: string[] }[];
    };

    for (const item of registry.items) {
      expect(item.dependencies ?? []).not.toContain(PACKAGE);
    }
  });

  it("is not imported anywhere in src/", () => {
    // Every file in src/config/nextjs/ is loaded and applied by withPlugins, so
    // an import of the package anywhere under src/ is enough to wedge dev again.
    const sources = collectSources(join(ROOT, "src"));
    sources.push(join(ROOT, "next.config.ts"));

    const importers = sources
      .filter((file) => readFileSync(file, "utf8").includes(PACKAGE))
      .map((file) => relative(ROOT, file));

    expect(importers).toEqual([]);
  });
});
