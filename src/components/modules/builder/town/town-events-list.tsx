"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { events as staticEvents } from "@/data/town/events";
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
    <nav className="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
        className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

  const { docs, totalPages } = useBuilderPaginatedData<TownEvent>("town-event", {
    page,
    limit: itemsPerPage,
    fallbackData: staticEvents,
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
    clientSort: (a, b) => {
      const da = safeDate(a.eventDate);
      const db = safeDate(b.eventDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    },
  });

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
    <section className="py-12 bg-cream">
      <div className="container mx-auto px-4">
        {/* Filters */}
        {showFilters && (
          <div className="mb-8 flex flex-wrap gap-4">
            <select
              value={category || ""}
              onChange={(e) => updateParams({ category: e.target.value || undefined })}
              className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map((cat) => (
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
              className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
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
                className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
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
            {docs.map((event) => {
              const eventDate = safeDate(event.eventDate);
              if (!event.slug) return null;
              return (
                <Link
                  key={event.slug}
                  href={`/events/${encodeURIComponent(event.slug)}`}
                  className="group flex flex-col md:flex-row gap-4 bg-white rounded-lg border border-stone overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-full md:w-28 bg-sage-dark text-white flex flex-col items-center justify-center py-4 md:py-0">
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
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {safeCategories(event).map((cat) => (
                        <span
                          key={cat}
                          className="bg-stone text-sage-dark px-2 py-0.5 rounded-full text-xs capitalize"
                        >
                          {cat}
                        </span>
                      ))}
                      {event.status === "cancelled" && (
                        <span className="bg-barn-red/10 text-barn-red px-2 py-0.5 rounded-full text-xs font-medium">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-[#2D2A24] group-hover:text-sage-dark transition-colors mb-1">
                      {event.title || "Untitled Event"}
                    </h2>
                    {event.description && (
                      <p className="text-base text-[#4A4640] mb-2 line-clamp-2">
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
                      {event.location && <span>{event.location}</span>}
                      {event.locationAddress && <span>{event.locationAddress}</span>}
                    </div>
                  </div>

                  {/* Featured Image */}
                  {event.featuredImage && (
                    <div className="hidden lg:block flex-shrink-0 w-48">
                      <img
                        src={event.featuredImage}
                        alt={event.title || "Event"}
                        className="w-full h-full object-cover"
                        width={800}
                        height={600}
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#635E56] text-lg">No events found.</p>
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
  <section className="py-12 bg-cream">
    <div className="container mx-auto px-4 text-center py-12">
      <p className="text-[#635E56] text-lg">
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
