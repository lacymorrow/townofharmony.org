import type { TownEvent } from "@/data/town/types";

// "event" and "community" describe every item on the events page, so they
// don't help anyone filter. Dropped from all data, whatever Builder holds.
const REMOVED_CATEGORIES = new Set(["event", "community"]);

export const FARMERS_MARKET_CATEGORY = "farmers market";
const FALLBACK_CATEGORY = "other";

const normalize = (category: string) => category.trim().toLowerCase();

function inferCategory(event: Pick<TownEvent, "title" | "tags">): string {
  const text = [event.title, ...(event.tags ?? [])].join(" ").toLowerCase();
  if (/farmers?[\s-]*market/.test(text)) return FARMERS_MARKET_CATEGORY;
  if (/\bmarket\b/.test(text)) return "market";
  if (/festival|celebration|parade/.test(text)) return "festival";
  return FALLBACK_CATEGORY;
}

/**
 * Strip the removed categories, guarantee farmers market events carry the
 * farmers market category, and guarantee every event has at least one category.
 */
export function normalizeEventCategories<
  T extends Pick<TownEvent, "title" | "tags" | "categories">,
>(event: T): T {
  const kept = (event.categories ?? [])
    .map(normalize)
    .filter((c) => c !== "" && !REMOVED_CATEGORIES.has(c));
  const categories = new Set(kept);

  const inferred = inferCategory(event);
  if (inferred === FARMERS_MARKET_CATEGORY || categories.size === 0) {
    categories.add(inferred);
  }
  return { ...event, categories: [...categories] };
}
