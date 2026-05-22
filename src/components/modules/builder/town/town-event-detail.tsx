"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import type { TownEvent } from "@/data/town/types";
import { resolveBuilderRef } from "@/data/town/types";
import { useBuilderEntry } from "@/lib/builder-data";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface TownEventDetailProps {
  slug?: string;
}

const safeCategories = (event: TownEvent): string[] =>
  Array.isArray(event.categories) ? event.categories : [];

const safeDate = (dateStr: unknown): Date | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const statusColors: Record<string, string> = {
  upcoming: "bg-sage/15 text-sage-dark border-sage/30",
  past: "bg-stone/50 text-sage-dark/60 border-stone",
  cancelled: "bg-barn-red/15 text-barn-red border-barn-red/30",
};

const TownEventDetailInner = ({ slug: slugProp }: TownEventDetailProps) => {
  const pathname = usePathname();
  const rawSlug = slugProp || pathname?.split("/").filter(Boolean).pop() || "";
  const slug = (() => {
    try {
      return decodeURIComponent(rawSlug)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
    } catch {
      return rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    }
  })();

  const { data: event, loading } = useBuilderEntry<TownEvent>(
    "town-event",
    { "data.slug": slug },
  );

  if (loading) {
    return (
      <section className="bg-warm-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-stone/40 rounded" />
            <div className="h-8 w-3/4 bg-stone/40 rounded" />
            <div className="h-48 bg-stone/20 rounded-xl" />
            <div className="h-4 w-full bg-stone/20 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">Event not found</h1>
          <p className="text-sage-dark/70 mb-8">
            The event you are looking for could not be found.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
          >
            &larr; Back to Events
          </Link>
        </div>
      </section>
    );
  }

  const parsedDate = safeDate(event.eventDate);
  const eventDate = parsedDate
    ? parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date to be announced";

  return (
    <section className="bg-warm-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sage hover:text-sage-dark text-sm font-medium mb-8 transition-colors"
        >
          &larr; Back to Events
        </Link>

        {/* Status badge and categories */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusColors[event.status] || statusColors.upcoming}`}
          >
            {event.status}
          </span>
          {safeCategories(event).map((category) => (
            <span
              key={category}
              className="inline-block bg-wheat/30 text-sage-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark leading-tight mb-6">
          {event.title}
        </h1>

        {/* Featured image */}
        {event.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={event.featuredImage}
              alt={event.title}
              className="w-full h-auto object-cover max-h-[400px]"
              width={800}
              height={600}
            />
          </div>
        )}

        {/* Event details card */}
        <div className="bg-cream border border-stone rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-4">
            Event Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                Date
              </dt>
              <dd className="text-sage-dark font-medium">{eventDate}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                Time
              </dt>
              <dd className="text-sage-dark font-medium">
                {event.eventTime}
                {event.endTime && ` - ${event.endTime}`}
              </dd>
            </div>
            {event.locationAddress && (
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                  Location
                </dt>
                <dd className="text-sage-dark font-medium">{event.locationAddress}</dd>
              </div>
            )}
            {(() => {
              const organizerName = resolveBuilderRef(event.organizer);
              return organizerName ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                    Organizer
                  </dt>
                  <dd className="text-sage-dark font-medium">{organizerName}</dd>
                </div>
              ) : null;
            })()}
            {event.contactEmail && (
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="text-sage hover:text-sage-dark font-medium transition-colors"
                  >
                    {event.contactEmail}
                  </a>
                </dd>
              </div>
            )}
            {event.contactPhone && (
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                  Phone
                </dt>
                <dd>
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="text-sage hover:text-sage-dark font-medium transition-colors"
                  >
                    {event.contactPhone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Description */}
        {event.description && (
          <div
            className="prose prose-lg max-w-none text-sage-dark/80 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
          />
        )}

        {/* Content */}
        {event.content && (
          <div
            className="prose prose-lg max-w-none text-sage-dark/85 leading-relaxed
							prose-headings:text-sage-dark prose-headings:font-serif
							prose-a:text-sage prose-a:hover:text-sage-dark
							prose-strong:text-sage-dark"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }}
          />
        )}
      </div>
    </section>
  );
};

const EventDetailErrorFallback = () => (
  <section className="bg-warm-white py-16">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">Something went wrong</h1>
      <p className="text-sage-dark/70 mb-8">
        We couldn&apos;t load this event. Please try refreshing the page.
      </p>
      <Link
        href="/events"
        className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
      >
        &larr; Back to Events
      </Link>
    </div>
  </section>
);

export const TownEventDetail = (props: TownEventDetailProps) => (
  <ErrorBoundary fallback={EventDetailErrorFallback}>
    <TownEventDetailInner {...props} />
  </ErrorBoundary>
);
