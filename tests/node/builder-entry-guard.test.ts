import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

import { logger } from "@/lib/logger";
import { guardBuilderEntries, rejectReason } from "@/lib/builder-entry-guard";

const entry = (id: string, data: unknown) => ({ id, name: id, data });

describe("rejectReason", () => {
  it("accepts a complete list entry", () => {
    expect(rejectReason("town-news", { title: "Council recap" })).toBeNull();
  });

  it("rejects non-object data", () => {
    expect(rejectReason("town-news", undefined)).toBe("data is not an object");
    expect(rejectReason("town-news", [])).toBe("data is not an object");
  });

  it("rejects an entry whose identity field is blank", () => {
    expect(rejectReason("town-news", { title: "   " })).toBe("missing title");
    expect(rejectReason("town-static-page", { body: "x" })).toBe("missing title or slug");
    expect(rejectReason("town-static-page", { slug: "faq" })).toBeNull();
  });

  it("only checks the object shape for single-entry models", () => {
    expect(rejectReason("town-settings", { siteTitle: "" })).toBeNull();
    expect(rejectReason("some-new-model", {})).toBeNull();
  });

  it("rejects a map business without coordinates", () => {
    expect(rejectReason("town-map-business", { name: "Clinic" })).toBe(
      "missing or invalid lat/lng"
    );
    expect(rejectReason("town-map-business", { name: "Clinic", lat: "", lng: "" })).toBe(
      "missing or invalid lat/lng"
    );
    expect(rejectReason("town-map-business", { name: "Clinic", lat: 35.9, lng: -80.7 })).toBeNull();
  });
});

describe("guardBuilderEntries", () => {
  it("keeps good entries, drops bad ones, and logs each drop with its id", () => {
    const kept = guardBuilderEntries("town-map-business", [
      entry("ok", { name: "Bank", lat: 35.9, lng: -80.7 }),
      entry("no-coords", { name: "Clinic" }),
      entry("no-name", { lat: 35.9, lng: -80.7 }),
      entry("no-data", null),
    ]);
    expect(kept.map((e) => e.id)).toEqual(["ok"]);
    expect(logger.warn).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledWith(
      "Builder town-map-business entry skipped: missing or invalid lat/lng",
      expect.objectContaining({ entryId: "no-coords" })
    );
  });
});
