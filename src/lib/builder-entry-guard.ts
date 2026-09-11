/**
 * Last line of defence between Builder.io editors and the rendered page.
 *
 * Editors can publish an entry with the title blank, the data object missing,
 * or (for the map) no coordinates. Nothing downstream should have to care:
 * every Builder fetch, server and client, runs its entries through this guard
 * and drops the ones that cannot render, logging the entry id so staff can
 * fix them in Builder.
 */
import { logger } from "@/lib/logger";
import { hasValidCoords } from "@/lib/map-coords";

interface EntryLike {
  id: string;
  name?: string;
  data: unknown;
}

type Validator = (data: Record<string, unknown>) => string | null;

/**
 * List models and the field that gives an entry its identity. An entry with
 * none of these filled in has nothing to show and gets dropped. Single-entry
 * models (town-settings, town-navigation) are not listed and only get the
 * "data must be an object" check.
 */
const IDENTITY_FIELDS: Record<string, string[]> = {
  "town-announcement": ["title"],
  "town-business": ["name"],
  "town-contact-inquiry-type": ["label"],
  "town-election": ["title"],
  "town-emergency-service": ["title"],
  "town-event": ["title"],
  "town-history-article": ["title"],
  "town-homepage-slide": ["title"],
  "town-map-business": ["name"],
  "town-meeting": ["title"],
  "town-news": ["title"],
  "town-point-of-interest": ["name"],
  "town-resource": ["title"],
  "town-sewer-rate": ["name"],
  "town-static-page": ["title", "slug"],
  "town-team-member": ["name"],
};

/** Model-specific checks for fields that crash a renderer when malformed. */
const VALIDATORS: Record<string, Validator> = {
  "town-map-business": (data) => (hasValidCoords(data) ? null : "missing or invalid lat/lng"),
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFilled(value: unknown): boolean {
  return typeof value === "string" ? value.trim() !== "" : value !== undefined && value !== null;
}

/** Why an entry cannot render, or null when it is fine. */
export function rejectReason(model: string, data: unknown): string | null {
  if (!isPlainObject(data)) return "data is not an object";
  const identity = IDENTITY_FIELDS[model];
  if (identity && !identity.some((field) => isFilled(data[field]))) {
    return `missing ${identity.join(" or ")}`;
  }
  return VALIDATORS[model]?.(data) ?? null;
}

/** Drop entries that cannot render and log each one with its Builder id. */
export function guardBuilderEntries<E extends EntryLike>(model: string, entries: E[]): E[] {
  const kept: E[] = [];
  for (const entry of entries) {
    const reason = rejectReason(model, entry.data);
    if (reason === null) {
      kept.push(entry);
      continue;
    }
    logger.warn(`Builder ${model} entry skipped: ${reason}`, {
      entryId: entry.id,
      entryName: entry.name,
    });
  }
  return kept;
}
