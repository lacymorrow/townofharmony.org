"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { LightboxImage } from "@/components/ui/lightbox-image";
import type { TownEvent } from "@/data/town/types";
import { resolveBuilderRef } from "@/data/town/types";
import { useBuilderEntry } from "@/lib/builder-data";
import { deriveEventStatus, type EventDisplayStatus } from "@/lib/event-status";
import { getMapUrl } from "@/lib/map-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { formatTime } from "@/lib/utils";

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

const statusColors: Record<EventDisplayStatus, string> = {
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

  const { data: event, loading } = useBuilderEntry<TownEvent>("town-event", { "data.slug": slug });

  if (loading) {
    return (
      <section className="bg-warm-white py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-stone/40" />
            <div className="h-8 w-3/4 rounded bg-stone/40" />
            <div className="h-48 rounded-xl bg-stone/20" />
            <div className="h-4 w-full rounded bg-stone/20" />
          </div>
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-sage-dark">Event not found</h1>
          <p className="mb-8 text-sage-dark/70">
            The event you are looking for could not be found.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            &larr; Back to Events
          </Link>
        </div>
      </section>
    );
  }

  const displayStatus = deriveEventStatus(event);
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
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back link */}
        <Link
          href="/events"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sage transition-colors hover:text-sage-dark"
        >
          &larr; Back to Events
        </Link>

        {/* Status badge and categories */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColors[displayStatus]}`}
          >
            {displayStatus}
          </span>
          {safeCategories(event).map((category) => (
            <span
              key={category}
              className="inline-block rounded-full bg-wheat/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-dark"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-sage-dark md:text-4xl">
          {event.title}
        </h1>

        {/* Featured image */}
        {event.featuredImage && (
          <LightboxImage
            src={event.featuredImage}
            alt={event.title}
            wrapperClassName="mb-8 rounded-xl w-full"
            className="h-auto max-h-[400px] w-full object-cover"
            width={800}
            height={600}
          />
        )}

        {/* Event details card */}
        <div className="mb-8 rounded-xl border border-stone bg-cream p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
            Event Details
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                Date
              </dt>
              <dd className="font-medium text-sage-dark">{eventDate}</dd>
            </div>
            <div>
              <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                Time
              </dt>
              <dd className="font-medium text-sage-dark">
                {event.eventTime ? formatTime(event.eventTime) : ""}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </dd>
            </div>
            {event.locationAddress && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Location
                </dt>
                <dd className="font-medium text-sage-dark">
                  <span className="inline-flex items-center gap-1">
                    <a
                      href={getMapUrl(event.locationAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {event.locationAddress}
                    </a>
                    <AddressCopyButton
                      address={event.locationAddress}
                      label={event.title}
                      tone="default"
                    />
                  </span>
                </dd>
              </div>
            )}
            {(() => {
              const organizerName = resolveBuilderRef(event.organizer);
              return organizerName ? (
                <div>
                  <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                    Organizer
                  </dt>
                  <dd className="font-medium text-sage-dark">{organizerName}</dd>
                </div>
              ) : null;
            })()}
            {event.contactEmail && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="font-medium text-sage transition-colors hover:text-sage-dark"
                  >
                    {event.contactEmail}
                  </a>
                </dd>
              </div>
            )}
            {event.contactPhone && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Phone
                </dt>
                <dd>
                  <span className="inline-flex items-center gap-1">
                    <a
                      href={`tel:${event.contactPhone}`}
                      className="font-medium text-sage transition-colors hover:text-sage-dark"
                    >
                      {event.contactPhone}
                    </a>
                    <PhoneCopyButton
                      phone={event.contactPhone}
                      label={event.title}
                      tone="default"
                    />
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Description */}
        {event.description && (
          <div
            className="prose prose-lg mb-6 max-w-none leading-relaxed text-sage-dark/80"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
          />
        )}

        {/* Content */}
        {event.content && (
          <div
            className="prose prose-lg max-w-none leading-relaxed text-sage-dark/85 prose-headings:font-serif prose-headings:text-sage-dark prose-a:text-sage prose-a:hover:text-sage-dark prose-strong:text-sage-dark"
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
      <h1 className="mb-4 font-serif text-3xl font-bold text-sage-dark">Something went wrong</h1>
      <p className="mb-8 text-sage-dark/70">
        We couldn&apos;t load this event. Please try refreshing the page.
      </p>
      <Link
        href="/events"
        className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
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
