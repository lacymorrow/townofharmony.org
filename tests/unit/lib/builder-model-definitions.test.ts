import { describe, expect, it } from "vitest";
import { teamMembers } from "@/data/town/team-members";
import { modelDefinitions } from "@/lib/builder-model-definitions";

/**
 * The Builder.io editor only shows fields that exist in the model schema, and
 * the category dropdown only offers values in the enum. LAC-3551: the live
 * model drifted (no `image` field) so editors couldn't change team photos.
 * These tests pin the definition that `scripts/sync-builder-models.ts` pushes.
 */
describe("town-team-member model definition", () => {
  const model = modelDefinitions.find((m) => m.name === "town-team-member");

  it("exists as a data model", () => {
    expect(model).toBeDefined();
    expect(model?.kind).toBe("data");
  });

  it("has a file-type image field so photos are editable in the CMS", () => {
    const image = model?.fields.find((f) => f.name === "image");
    expect(image?.type).toBe("file");
  });

  it("has a mayorSince field so the mayor card is fully editable", () => {
    expect(model?.fields.some((f) => f.name === "mayorSince")).toBe(true);
  });

  it("category enum covers every category used by team data", () => {
    const category = model?.fields.find((f) => f.name === "category");
    const staticCategories = [...new Set(teamMembers.map((m) => m.category))];
    // "Department Heads" is used by live CMS entries (e.g. Public Works
    // Director) even though no static fallback member uses it yet.
    for (const used of [...staticCategories, "Department Heads"]) {
      expect(category?.enum).toContain(used);
    }
  });
});
