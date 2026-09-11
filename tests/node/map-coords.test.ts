import { describe, expect, it } from "vitest";
import { hasValidCoords, partitionByCoords } from "@/lib/map-coords";

// A Builder town-map-business entry published without lat/lng crashed the
// live map (Leaflet: "Invalid LatLng object: (undefined, undefined)").
describe("hasValidCoords", () => {
  it("accepts finite numbers in range", () => {
    expect(hasValidCoords({ lat: 35.9578, lng: -80.7717 })).toBe(true);
  });

  it("rejects missing, empty, NaN and out-of-range values", () => {
    expect(hasValidCoords({})).toBe(false);
    expect(hasValidCoords({ lat: undefined, lng: undefined })).toBe(false);
    expect(hasValidCoords({ lat: "", lng: "" })).toBe(false);
    expect(hasValidCoords({ lat: Number.NaN, lng: 0 })).toBe(false);
    expect(hasValidCoords({ lat: 91, lng: 0 })).toBe(false);
    expect(hasValidCoords({ lat: 0, lng: -181 })).toBe(false);
  });

  it("accepts numeric strings from a text field", () => {
    expect(hasValidCoords({ lat: "35.9", lng: "-80.7" })).toBe(true);
  });
});

describe("partitionByCoords", () => {
  it("separates mappable entries from ones to skip", () => {
    const ok = { id: "a", lat: 35.9, lng: -80.7 };
    const bad = { id: "b" };
    const { mappable, dropped } = partitionByCoords([ok, bad]);
    expect(mappable).toEqual([ok]);
    expect(dropped).toEqual([bad]);
  });
});
