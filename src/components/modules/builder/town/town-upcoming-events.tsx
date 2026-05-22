"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import type { TownEvent } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";

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
      <section className="py-16 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
            No upcoming events scheduled.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-warm-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">Upcoming Events</h2>
          <p className="text-[#4A4640] text-base">Join us at community gatherings and activities</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-2.5">
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
                className="flex items-center gap-4 p-4 bg-cream rounded-[10px] border border-transparent hover:border-[#DDD7CC] transition-colors cursor-pointer group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-wheat flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-sage font-semibold">
                    {dateStr}
                    {event.eventTime && <> &middot; {event.eventTime}</>}
                  </div>
                  <h3 className="font-semibold text-[15px] text-[#2D2A24] group-hover:text-sage-dark transition-colors">
                    {event.title}
                  </h3>
                  {event.location && <p className="text-sm text-[#4A4640]">{event.location}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-8 text-center">
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-lg border border-[#DDD7CC] text-sage-dark font-semibold text-sm hover:bg-stone transition-colors cursor-pointer"
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
  <section className="py-16 bg-warm-white">
    <div className="container mx-auto px-4">
      <div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
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
