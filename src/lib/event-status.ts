import { getTodayString, toDateOnly } from "@/lib/date-only";

export type EventDisplayStatus = "upcoming" | "past" | "cancelled";

/**
 * Derive the display status for an event from its date instead of the
 * stored Builder `status` field. Stored statuses go stale (a past event
 * keeps "upcoming") or arrive blank (cleared fields come back as ""), so
 * only "cancelled" is trusted from the stored value; upcoming vs past is
 * computed from eventDate, matching the list filtering in town-data.ts.
 */
export const deriveEventStatus = (event: {
  status?: string | null;
  eventDate?: unknown;
}): EventDisplayStatus => {
  if (event.status === "cancelled") return "cancelled";
  const dateOnly = toDateOnly(event.eventDate);
  if (!dateOnly) return event.status === "past" ? "past" : "upcoming";
  return dateOnly >= getTodayString() ? "upcoming" : "past";
};
