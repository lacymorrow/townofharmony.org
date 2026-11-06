/**
 * Canonical slugs for town events.
 *
 * Editors type the slug by hand in Builder, so an entry can carry a slug
 * that is not URL-shaped — the Christmas Festival entry held a literal
 * space, `"christmas-festival-tree-lighting 2026"` (LAC-7168). That made
 * every list link render as `/events/...lighting%202026`, and the detail
 * lookup dropped the space entirely instead of hyphenating it, so the page
 * served a dead "Event not found" to visitors.
 *
 * Two rules keep that from recurring:
 *   - links always carry the canonical (slugified) form, so a stray
 *     character in Builder can never reach the URL bar;
 *   - lookups compare canonical forms, so an entry whose stored slug is
 *     malformed still resolves, and a legacy `%20` link still works.
 *
 * Same shape as `meeting-slug.ts`, which does this for `town-meeting`
 * (LAC-3549).
 */

import { slugify } from "@/lib/utils/extract-headings";

interface EventSlugFields {
  slug?: string;
  title?: string;
}

/**
 * The URL slug for an event: the editor's slug run through `slugify`, or the
 * title when the slug is cleared (Builder clears fields to `""`, not
 * `undefined`). Never contains a character that needs percent-encoding.
 */
export function getCanonicalEventSlug(event: EventSlugFields): string {
  return slugify(event.slug || event.title || "event");
}

/**
 * Canonical form of a slug taken from a URL path segment. Percent-decodes
 * first so a legacy `%20` link normalizes to the same value as its
 * hyphenated replacement.
 */
export function normalizeEventSlugParam(raw: string): string {
  try {
    return slugify(decodeURIComponent(raw));
  } catch {
    // Malformed percent-encoding (`%E0%A4%A`) throws; fall back to the raw
    // segment rather than losing the lookup entirely.
    return slugify(raw);
  }
}

/**
 * Resolve a URL slug to an event. The canonical comparison matches whatever
 * the editor typed, so it covers both directions of the LAC-7168 defect: a
 * hyphenated link against a malformed stored slug, and a `%20` link against
 * a repaired one. The exact raw match is kept as a last resort for a stored
 * slug that `slugify` would alter in a way a link never would.
 */
export function findEventBySlug<T extends EventSlugFields>(
  events: readonly T[],
  slug: string
): T | null {
  const normalized = normalizeEventSlugParam(slug);
  return (
    events.find((event) => getCanonicalEventSlug(event) === normalized) ??
    events.find((event) => event.slug === slug) ??
    null
  );
}
