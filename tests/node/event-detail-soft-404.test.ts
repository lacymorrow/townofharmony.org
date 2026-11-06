import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isBuilderTemplatePage } from "@/lib/builder-page-kind";

/**
 * LAC-7336: `/events/<anything>` returned 200 because the Builder
 * `/events/:slug` template matched every slug and the page returned it before
 * the `notFound()` check ran. Pins the ordering and the template detection.
 */
describe("isBuilderTemplatePage", () => {
  it("treats a :param url as a template", () => {
    expect(isBuilderTemplatePage({ data: { url: "/events/:slug" } })).toBe(true);
  });
  it("treats an exact url as a real page", () => {
    expect(isBuilderTemplatePage({ data: { url: "/events/spring-fling" } })).toBe(false);
  });
  it("treats a missing url as not a template", () => {
    expect(isBuilderTemplatePage({})).toBe(false);
  });
});

describe("event detail page", () => {
  const src = readFileSync(
    join(process.cwd(), "src/app/(app)/(town)/events/[slug]/page.tsx"),
    "utf8"
  );
  const body = src.slice(src.indexOf("export default async function"));

  it("only short-circuits to Builder for non-template pages", () => {
    expect(body).toMatch(/builderContent && !isBuilderTemplatePage\(builderContent\)/);
  });
  it("runs notFound() before rendering a template page", () => {
    const check = body.indexOf("if (!event) notFound()");
    const tpl = body.lastIndexOf("<RenderBuilderContent");
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(tpl);
  });
});
