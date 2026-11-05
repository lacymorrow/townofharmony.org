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

  it("replaces a lone 'event' category", () => {
    expect(normalizeEventCategories(make("Town Picnic", ["event"])).categories).toEqual(["other"]);
  });

  it("does not duplicate an existing farmers market category", () => {
    const r = normalizeEventCategories(make("May Farmers Market", ["Farmers Market", "event"]));
    expect(r.categories).toEqual(["farmers market"]);
  });

  it("lowercases and trims, and ignores blank entries", () => {
    const r = normalizeEventCategories(make("Concert", ["  Recreation ", " "]));
    expect(r.categories).toEqual(["recreation"]);
  });

  it("infers market, festival and other from title", () => {
    expect(normalizeEventCategories(make("HWY 21 Road Market", [])).categories).toEqual(["market"]);
    expect(normalizeEventCategories(make("Christmas Parade", [])).categories).toEqual(["festival"]);
  });
});
