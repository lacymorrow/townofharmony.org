import { describe, expect, it } from "vitest";

import { defaultMetadata } from "../../../src/config/metadata";

/**
 * Regression tests for LAC-3516 (Ahrefs site audit).
 *
 * The default metadata emitted <link rel="archives" href=".../blog"> and
 * <link rel="assets" href=".../assets"> on every page, but neither /blog nor
 * /assets exists on this site — crawlers followed them into soft-404 pages.
 * The site has no blog or public assets index, so these must not be emitted.
 */
describe("defaultMetadata head links (LAC-3516)", () => {
  it("does not advertise an archives (/blog) link", () => {
    expect(defaultMetadata.archives ?? []).toEqual([]);
  });

  it("does not advertise an assets (/assets) link", () => {
    expect(defaultMetadata.assets ?? []).toEqual([]);
  });

  it("has no head link pointing at a non-existent path", () => {
    const linkValues = [defaultMetadata.archives, defaultMetadata.assets, defaultMetadata.bookmarks]
      .flat()
      .filter((value): value is string => typeof value === "string");

    for (const value of linkValues) {
      expect(value).not.toMatch(/\/(blog|assets)$/);
    }
  });
});
