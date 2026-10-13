"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import type { TownEvent } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";
import { formatTime } from "@/lib/utils";

interface TownUpcomingEventsProps {
  limit?: number;
}

const safeDate = (dateStr: unknown): Date | null => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const TownUpcomingEventsInner = ({ limit = 5 }: TownUpcomingEventsProps) => {
  const { data: allEvents } = useBuilderData<TownEvent>("town-event", {
    limit: 50,
  });

  const now = new Date();
  const upcomingEvents = allEvents
    .filter((e) => {
      const d = safeDate(e.eventDate);
      return d && d >= now && e.status !== "cancelled";
    })
    .sort((a, b) => {
      const da = safeDate(a.eventDate);
      const db = safeDate(b.eventDate);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime();
    })
    .slice(0, limit);

  if (upcomingEvents.length === 0) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-cream p-8 text-center text-[#4A4640]">
            No upcoming events scheduled.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-warm-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-serif text-[32px] font-bold text-sage-dark">Upcoming Events</h2>
          <p className="text-base text-[#4A4640]">Join us at community gatherings and activities</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-2.5">
          {upcomingEvents.map((event) => {
            const date = safeDate(event.eventDate);
            if (!date || !event.slug) return null;
            const dateStr = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="group flex cursor-pointer items-center gap-4 rounded-[10px] border border-transparent bg-cream p-4 transition-colors hover:border-[#DDD7CC]"
              >
                <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-wheat" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-sage">
                    {dateStr}
                    {event.eventTime && <> &middot; {formatTime(event.eventTime)}</>}
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                    {event.title}
                  </h3>
                  {event.locationAddress && (
                    <p className="text-sm text-[#4A4640]">{event.locationAddress}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-8 text-center">
          <Link
            href="/events"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#DDD7CC] px-8 py-3 text-sm font-semibold text-sage-dark transition-colors hover:bg-stone"
          >
            <Calendar className="h-4 w-4" />
            View Full Calendar
          </Link>
        </div>
      </div>
    </section>
  );
};

const UpcomingEventsErrorFallback = () => (
  <section className="bg-warm-white py-16">
    <div className="container mx-auto px-4">
      <div className="rounded-xl bg-cream p-8 text-center text-[#4A4640]">
        Unable to load upcoming events.
      </div>
    </div>
  </section>
);

export const TownUpcomingEvents = (props: TownUpcomingEventsProps) => (
  <ErrorBoundary fallback={UpcomingEventsErrorFallback}>
    <TownUpcomingEventsInner {...props} />
  </ErrorBoundary>
);
