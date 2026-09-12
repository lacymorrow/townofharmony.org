import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for LAC-3861 (and LAC-2434 before it).
 *
 * A `loading.tsx` at `src/app/(app)/` or `src/app/(app)/(town)/` wraps every
 * town page in a Suspense boundary. Next.js then streams the shell and commits
 * HTTP 200 before `(town)/[...slug]/page.tsx` can call `notFound()`, so every
 * unknown URL and every flag-disabled route (/map, /sewer, /business) becomes
 * a soft 404, and the not-found render intermittently throws React #419.
 *
 * PR #201 removed the file for this reason; PR #204 restored it on a wrong
 * diagnosis. Do not add it back. If a route really needs a loading state, add
 * `loading.tsx` inside that route's own folder, below the catch-all.
 */
const APP_DIR = join(process.cwd(), "src", "app", "(app)");

describe("no streaming boundary above the town catch-all (LAC-3861)", () => {
  it.each(["", "(town)"])("has no loading.tsx at (app)/%s", (segment) => {
    expect(existsSync(join(APP_DIR, segment, "loading.tsx"))).toBe(false);
  });
});
