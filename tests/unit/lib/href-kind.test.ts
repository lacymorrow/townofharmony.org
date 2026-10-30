import { describe, expect, it } from "vitest";
import { getHrefKind } from "@/lib/href-kind";

// LAC-6284: the notice banner handed `/docs/2026-christmas-parade-application.pdf`
// to `next/link`, so a client-side nav hit the catch-all 404 and only a reload
// served the file. Static files must never be classified as routes.
describe("getHrefKind", () => {
  it("classifies a static file under public/ as a file, not a route", () => {
    expect(getHrefKind("/docs/2026-christmas-parade-application.pdf")).toBe("file");
    expect(getHrefKind("/town-ordinance.pdf")).toBe("file");
    expect(getHrefKind("/docs/meetings/February_3_2025_Minutes.pdf")).toBe("file");
  });

  it("ignores a query or fragment when looking for the extension", () => {
    expect(getHrefKind("/docs/parade.pdf?v=2")).toBe("file");
    expect(getHrefKind("/docs/parade.pdf#page=2")).toBe("file");
  });

  it("classifies in-app paths as routes", () => {
    expect(getHrefKind("/")).toBe("route");
    expect(getHrefKind("/about")).toBe("route");
    expect(getHrefKind("/meetings/february-3-2025")).toBe("route");
    expect(getHrefKind("/business/harmony-hardware?page=2")).toBe("route");
    expect(getHrefKind("#section")).toBe("route");
  });

  it("classifies other origins as external", () => {
    expect(getHrefKind("https://example.com/doc.pdf")).toBe("external");
    expect(getHrefKind("http://example.com")).toBe("external");
    expect(getHrefKind("//example.com/x")).toBe("external");
  });

  it("classifies handler schemes as actions so they stay in the same tab", () => {
    expect(getHrefKind("mailto:clerk@townofharmony.org")).toBe("action");
    expect(getHrefKind("tel:+13365551234")).toBe("action");
  });

  it("rejects script-bearing and relative hrefs an editor may paste", () => {
    expect(getHrefKind("javascript:alert(1)")).toBe("unsafe");
    expect(getHrefKind("data:text/html,<script>alert(1)</script>")).toBe("unsafe");
    expect(getHrefKind("www.example.com")).toBe("unsafe");
    expect(getHrefKind("about")).toBe("unsafe");
  });

  it("treats a missing or blank href as unsafe", () => {
    expect(getHrefKind(undefined)).toBe("unsafe");
    expect(getHrefKind(null)).toBe("unsafe");
    expect(getHrefKind("   ")).toBe("unsafe");
  });

  it("trims surrounding whitespace before classifying", () => {
    expect(getHrefKind("  /docs/parade.pdf  ")).toBe("file");
    expect(getHrefKind("  /about  ")).toBe("route");
  });
});
