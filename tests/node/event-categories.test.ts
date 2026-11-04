import { describe, expect, it } from "vitest";
import { normalizeEventCategories } from "@/lib/event-categories";

const make = (title: string, categories: string[], tags: string[] = []) => ({
  title,
  categories,
  tags,
});

describe("normalizeEventCategories", () => {
  it("drops event and community", () => {
    const r = normalizeEventCategories(make("Spring Fling", ["Community", "event", "festival"]));
    expect(r.categories).toEqual(["festival"]);
  });

  it("adds farmers market to any farmers market event", () => {
    const r = normalizeEventCategories(make("June Farmers Market 2026", ["recreation"]));
    expect(r.categories).toEqual(["recreation", "farmers market"]);
  });

  it("gives an uncategorized event a category", () => {
    expect(normalizeEventCategories(make("Town Picnic", [])).categories).toEqual(["other"]);
    expect(normalizeEventCategories(make("Fall Festival", ["community"])).categories).toEqual([
      "festival",
    ]);
  });
});
