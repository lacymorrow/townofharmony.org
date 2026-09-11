/**
 * Coordinate guard for town-map-business entries.
 *
 * Builder editors can publish a business without lat/lng (the fields are not
 * required in the model). Leaflet throws `Invalid LatLng object` on the first
 * `circleMarker([undefined, undefined])`, which unmounts the whole map page.
 * Drop such entries before they reach the map instead of crashing.
 */
export interface Coords {
  lat?: unknown;
  lng?: unknown;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return undefined;
}

export function hasValidCoords(item: Coords): item is Coords & { lat: number; lng: number } {
  // Builder sends cleared fields as "" (not undefined); Number("") is 0, so
  // empty strings must be rejected before coercion.
  const lat = toNumber(item.lat);
  const lng = toNumber(item.lng);
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/** Split a list into entries the map can plot and entries it must skip. */
export function partitionByCoords<T extends Coords>(items: T[]): { mappable: T[]; dropped: T[] } {
  const mappable: T[] = [];
  const dropped: T[] = [];
  for (const item of items) {
    (hasValidCoords(item) ? mappable : dropped).push(item);
  }
  return { mappable, dropped };
}
