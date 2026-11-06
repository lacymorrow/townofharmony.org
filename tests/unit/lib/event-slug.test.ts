import { describe, expect, it } from "vitest";

import { findEventBySlug, getCanonicalEventSlug, normalizeEventSlugParam } from "@/lib/event-slug";

// The entry that shipped the defect: an editor typed a space into the slug
// field, so the list link rendered `%20` and the detail page served a dead
// "Event not found" at HTTP 200 (LAC-7168).
const CHRISTMAS = {
  slug: "christmas-festival-tree-lighting 2026",
  title: "Christmas Festival & Tree Lighting 2026",
};
const PARADE = { slug: "harmony-christmas-parade-2026", title: "Harmony Christmas Parade 2026" };

describe("getCanonicalEventSlug", () => {
  it("hyphenates a space in a hand-typed slug instead of dropping it", () => {
    expect(getCanonicalEventSlug(CHRISTMAS)).toBe("christmas-festival-tree-lighting-2026");
  });

  it("leaves an already-canonical slug untouched", () => {
    expect(getCanonicalEventSlug(PARADE)).toBe("harmony-christmas-parade-2026");
  });

  it("derives from the title when Builder has cleared the slug to an empty string", () => {
    expect(getCanonicalEventSlug({ slug: "", title: "Fall Festival 2026" })).toBe(
      "fall-festival-2026"
    );
  });

  it("falls through to the title when the slug is truthy but slugifies to nothing", () => {
    // `"!!!"` is truthy, so picking the first truthy field and slugifying once
    // emitted `/events/` — an empty slug, the same dead link one layer down.
    expect(getCanonicalEventSlug({ slug: "!!!", title: "Fall Festival 2026" })).toBe(
      "fall-festival-2026"
    );
    expect(getCanonicalEventSlug({ slug: "---", title: "Fall Festival 2026" })).toBe(
      "fall-festival-2026"
    );
  });

  it("never returns an empty slug, even when nothing slugifies", () => {
    // An all-non-ASCII title strips to nothing: `slugify` is ASCII-only.
    expect(getCanonicalEventSlug({ title: "日本語" })).toBe("event");
    expect(getCanonicalEventSlug({ slug: "★", title: "★" })).toBe("event");
    expect(getCanonicalEventSlug({})).toBe("event");
  });

  it("never emits a character that would need percent-encoding", () => {
    expect(getCanonicalEventSlug({ title: "HWY 21 — 3-Day Road Market 2026" })).toBe(
      encodeURIComponent(getCanonicalEventSlug({ title: "HWY 21 — 3-Day Road Market 2026" }))
    );
  });
});

describe("normalizeEventSlugParam", () => {
  it("normalizes a legacy percent-encoded link to the canonical slug", () => {
    expect(normalizeEventSlugParam("christmas-festival-tree-lighting%202026")).toBe(
      "christmas-festival-tree-lighting-2026"
    );
  });

  it("is idempotent on a canonical slug", () => {
    expect(normalizeEventSlugParam("harmony-christmas-parade-2026")).toBe(
      "harmony-christmas-parade-2026"
    );
  });

  it("falls back to the raw segment when the percent-encoding is malformed", () => {
    expect(normalizeEventSlugParam("fall-festival-2026%E0%A4%A")).toBe("fall-festival-2026e0a4a");
  });
});

describe("findEventBySlug", () => {
  const events = [CHRISTMAS, PARADE];

  it("resolves a canonical link against an entry whose stored slug has a space", () => {
    // The live failure: the link is repaired but the Builder data is not.
    expect(findEventBySlug(events, "christmas-festival-tree-lighting-2026")).toBe(CHRISTMAS);
  });

  it("keeps the legacy percent-encoded link working", () => {
    expect(findEventBySlug(events, "christmas-festival-tree-lighting%202026")).toBe(CHRISTMAS);
  });

  it("resolves a canonical link against repaired Builder data", () => {
    const repaired = [{ slug: "christmas-festival-tree-lighting-2026", title: CHRISTMAS.title }];
    expect(findEventBySlug(repaired, "christmas-festival-tree-lighting-2026")).toBe(repaired[0]);
    expect(findEventBySlug(repaired, "christmas-festival-tree-lighting%202026")).toBe(repaired[0]);
  });

  it("does not resolve a slug belonging to no event", () => {
    expect(findEventBySlug(events, "easter-egg-hunt-2026")).toBeNull();
  });

  it("falls back to an exact raw match when canonicalizing the two sides diverges", () => {
    // The last-resort branch. A stored slug holding a literal percent-escape
    // canonicalizes to `cafc3a9-night` (slugify strips `%`), while the same
    // string read as a URL segment decodes to `café-night` and canonicalizes
    // to `caf-night`. The two never meet, so only the exact match resolves it.
    const escaped = { slug: "caf%C3%A9-night", title: "Café Night" };
    expect(getCanonicalEventSlug(escaped)).toBe("cafc3a9-night");
    expect(normalizeEventSlugParam("caf%C3%A9-night")).toBe("caf-night");
    expect(findEventBySlug([escaped], "caf%C3%A9-night")).toBe(escaped);
  });

  it("does not resolve an empty slug onto the title-derived fallback", () => {
    expect(findEventBySlug([{ title: "Untitled" }], "")).toBeNull();
  });

  it("picks the first entry when two canonical slugs collide", () => {
    const first = { slug: "fall festival 2026", title: "Fall Festival 2026" };
    const second = { slug: "fall-festival-2026", title: "Fall Festival 2026" };
    expect(findEventBySlug([first, second], "fall-festival-2026")).toBe(second);
  });
});
