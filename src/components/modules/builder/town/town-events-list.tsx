"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useMemo } from "react";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import type { TownEvent } from "@/data/town/types";
import { useBuilderPaginatedData } from "@/lib/builder-data";

interface TownEventsListProps {
  itemsPerPage?: number;
  showFilters?: boolean;
}

const safeCategories = (event: TownEvent): string[] =>
  Array.isArray(event.categories) ? event.categories : [];

const safeDate = (dateStr: unknown): Date | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Events on or after today count as upcoming. Comparison is date-string
 * only (like the agenda/minutes split) so a date-only eventDate parsed as
 * UTC midnight is never shifted into yesterday by the viewer's timezone;
 * "today" comes from local date parts for the same reason.
 */
const getTodayString = (): string => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const isPastEvent = (event: TownEvent, todayStr: string): boolean => {
  const dateStr = typeof event.eventDate === "string" ? event.eventDate.split("T")[0] : undefined;
  return dateStr ? dateStr < todayStr : false;
};

const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 pt-2 first:pt-0">
    <h2 className="text-sm font-bold uppercase tracking-wider text-[#635E56]">{label}</h2>
    <div className="h-px flex-1 bg-stone" />
  </div>
);

const EVENT_CATEGORIES = ["community", "recreation", "government", "education", "holiday"] as const;

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-stone bg-white px-3 py-2 text-sm font-medium text-sage-dark transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            p === page
              ? "bg-sage-dark text-white"
              : "border border-stone bg-white text-sage-dark hover:bg-cream"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-stone bg-white px-3 py-2 text-sm font-medium text-sage-dark transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

const TownEventsListInner = ({ itemsPerPage = 10, showFilters = true }: TownEventsListProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawPage = Number(searchParams?.get("page"));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const category = searchParams?.get("category") || undefined;
  const rawMonth = searchParams?.get("month") || undefined;
  const rawYear = searchParams?.get("year") || undefined;
  const month = rawMonth && /^\d{1,2}$/.test(rawMonth) ? rawMonth : undefined;
  const year = rawYear && /^\d{4}$/.test(rawYear) ? rawYear : undefined;

  const todayStr = getTodayString();

  const {
    docs,
    allData: allEvents,
    totalPages,
  } = useBuilderPaginatedData<TownEvent>("town-event", {
    page,
    limit: itemsPerPage,
    filter: (event) => {
      if (category && !safeCategories(event).includes(category)) return false;
      if (month || year) {
        const d = safeDate(event.eventDate);
        if (!d) return false;
        if (month && String(d.getMonth() + 1) !== month) return false;
        if (year && String(d.getFullYear()) !== year) return false;
      }
      return true;
    },
    // Upcoming events first (soonest first), then past events (most recent
    // first) — mirrors the agenda/minutes split. Undated (TBD) events sort
    // after upcoming but before past.
    clientSort: (a, b) => {
      const da = safeDate(a.eventDate);
      const db = safeDate(b.eventDate);
      const rank = (event: TownEvent, d: Date | null): number =>
        d ? (isPastEvent(event, todayStr) ? 2 : 0) : 1;
      const ra = rank(a, da);
      const rb = rank(b, db);
      if (ra !== rb) return ra - rb;
      if (!da || !db) return 0;
      return ra === 2 ? db.getTime() - da.getTime() : da.getTime() - db.getTime();
    },
  });

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    for (const event of allEvents) {
      for (const cat of safeCategories(event)) {
        catSet.add(cat);
      }
    }
    return EVENT_CATEGORIES.filter((cat) => catSet.has(cat));
  }, [allEvents]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentYear = new Date().getFullYear();
  const years = [String(currentYear), String(currentYear + 1)];

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        {/* Filters */}
        {showFilters && (
          <div className="mb-8 flex flex-wrap gap-4">
            <select
              value={category || ""}
              onChange={(e) => updateParams({ category: e.target.value || undefined })}
              className="town-select rounded-lg border border-stone bg-white py-2 pl-3 pr-9 text-sm text-[#2D2A24] focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
            >
              <option value="">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={month || ""}
              onChange={(e) =>
                updateParams({
                  month: e.target.value || undefined,
                  year: e.target.value ? year || String(currentYear) : undefined,
                })
              }
              className="town-select rounded-lg border border-stone bg-white py-2 pl-3 pr-9 text-sm text-[#2D2A24] focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
            >
              <option value="">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {month && (
              <select
                value={year || String(currentYear)}
                onChange={(e) => updateParams({ year: e.target.value })}
                className="town-select rounded-lg border border-stone bg-white py-2 pl-3 pr-9 text-sm text-[#2D2A24] focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Events List */}
        {docs.length > 0 ? (
          <div className="space-y-4">
            {docs.map((event, index) => {
              const eventDate = safeDate(event.eventDate);
              if (!event.slug) return null;
              const isPast = isPastEvent(event, todayStr);
              const prevIsPast = index > 0 && isPastEvent(docs[index - 1]!, todayStr);
              const showUpcomingHeader = index === 0 && !isPast;
              const showPastHeader = isPast && (index === 0 || !prevIsPast);
              return (
                <Fragment key={event.slug}>
                  {showUpcomingHeader && <SectionDivider label="Upcoming Events" />}
                  {showPastHeader && <SectionDivider label="Past Events" />}
                  <Link
                    href={`/events/${encodeURIComponent(event.slug)}`}
                    className={`group flex flex-col gap-4 overflow-hidden rounded-lg border border-stone bg-white transition-shadow hover:shadow-lg md:flex-row ${
                      isPast ? "opacity-80 hover:opacity-100" : ""
                    }`}
                  >
                    {/* Date Badge */}
                    <div
                      className={`flex w-full flex-shrink-0 flex-col items-center justify-center py-4 md:w-28 md:py-0 ${
                        isPast ? "bg-sage/10 text-sage-dark" : "bg-sage-dark text-white"
                      }`}
                    >
                      {eventDate ? (
                        <>
                          <span className="text-sm font-medium uppercase">
                            {eventDate.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </span>
                          <span className="text-3xl font-bold leading-tight">
                            {eventDate.getDate()}
                          </span>
                          <span className="text-sm opacity-80">
                            {eventDate.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium">TBD</span>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 p-5 md:py-4">
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        {safeCategories(event).map((cat) => (
                          <span
                            key={cat}
                            className="rounded-full bg-stone px-2 py-0.5 text-xs capitalize text-sage-dark"
                          >
                            {cat}
                          </span>
                        ))}
                        {event.status === "cancelled" && (
                          <span className="rounded-full bg-barn-red/10 px-2 py-0.5 text-xs font-medium text-barn-red">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <h2 className="mb-1 text-lg font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                        {event.title || "Untitled Event"}
                      </h2>
                      {event.description && (
                        <p className="mb-2 line-clamp-2 text-base text-[#4A4640]">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-[#635E56]">
                        {event.eventTime && (
                          <span>
                            {event.eventTime}
                            {event.endTime ? ` - ${event.endTime}` : ""}
                          </span>
                        )}
                        {event.locationAddress && <span>{event.locationAddress}</span>}
                      </div>
                    </div>

                    {/* Featured Image */}
                    {event.featuredImage && (
                      <div className="hidden w-48 flex-shrink-0 lg:block">
                        <img
                          src={event.featuredImage}
                          alt={event.title || "Event"}
                          className="h-full w-full object-cover"
                          width={800}
                          height={600}
                        />
                      </div>
                    )}
                  </Link>
                </Fragment>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-[#635E56]">No events found.</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => updateParams({ page: String(p) })}
        />
      </div>
    </section>
  );
};

const EventsErrorFallback = () => (
  <section className="bg-cream py-12">
    <div className="container mx-auto px-4 py-12 text-center">
      <p className="text-lg text-[#635E56]">
        Unable to load events. Please try refreshing the page.
      </p>
    </div>
  </section>
);

export const TownEventsList = (props: TownEventsListProps) => (
  <ErrorBoundary fallback={EventsErrorFallback}>
    <TownEventsListInner {...props} />
  </ErrorBoundary>
);
