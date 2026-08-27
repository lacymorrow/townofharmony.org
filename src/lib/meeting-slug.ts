/**
 * Canonical, collision-proof slugs for town meetings.
 *
 * Editors create Builder `town-meeting` entries with recurring names
 * ("Town Council Meeting"), so raw slugs collide across months and every
 * list link resolves to the same arbitrary entry (LAC-3549). The canonical
 * slug appends the meeting date, which is unique per meeting in practice —
 * links derive it, and lookups resolve it back to the entry regardless of
 * what slug an editor typed.
 */

import { toDateOnly } from "@/lib/date-only";
import { slugify } from "@/lib/utils/extract-headings";

interface MeetingSlugFields {
  slug?: string;
  title?: string;
  meetingDate?: string;
}

/**
 * Unique slug for a meeting: the entry's slug (or title, when the slug is
 * cleared — Builder clears fields to "" not undefined) suffixed with the
 * meeting date unless it already ends with it. Meetings without a parseable
 * date keep their base slug.
 */
export function getCanonicalMeetingSlug(meeting: MeetingSlugFields): string {
  const base = slugify(meeting.slug || meeting.title || "meeting");
  const date = toDateOnly(meeting.meetingDate);
  if (!date || base.endsWith(date)) return base;
  return `${base}-${date}`;
}

/**
 * The slug without its trailing date suffix — what an editor originally
 * typed. Lets lookups query Builder for both the canonical and the raw slug.
 */
export function getMeetingSlugBase(slug: string): string {
  return slug.replace(/-\d{4}-\d{2}-\d{2}$/, "");
}

/**
 * Resolve a URL slug to a meeting. Canonical matches win so date-suffixed
 * links always land on the right meeting even when raw slugs collide; the
 * exact raw match keeps legacy links working.
 */
export function findMeetingBySlug<T extends MeetingSlugFields>(
  meetings: readonly T[],
  slug: string
): T | null {
  return (
    meetings.find((m) => getCanonicalMeetingSlug(m) === slug) ??
    meetings.find((m) => m.slug === slug) ??
    null
  );
}
