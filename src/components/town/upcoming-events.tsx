import { Calendar } from "lucide-react";
import Link from "next/link";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { getEvents } from "@/lib/town-data";
import { formatTime } from "@/lib/utils";

export async function UpcomingEvents() {
  const { docs: upcomingEvents } = await getEvents({ limit: 5, status: "upcoming" });

  if (upcomingEvents.length === 0) {
    return (
      <div className="rounded-xl bg-cream p-8 text-center text-[#4A4640]">
        No upcoming events scheduled.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {upcomingEvents.map((event) => {
        const date = new Date(event.eventDate);
        const dateStr = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group flex cursor-pointer items-center gap-4 rounded-[10px] border border-transparent bg-cream p-4 transition-colors hover:border-[#DDD7CC]"
          >
            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-wheat" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-sage">
                {dateStr}
                {event.eventTime && <> &middot; {formatTime(event.eventTime)}</>}
              </div>
              <h3 className="text-[15px] font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                {event.title}
              </h3>
              {event.locationAddress && (
                <p className="text-[13px] text-[#4A4640]">
                  {event.locationAddress}
                  <AddressCopyButton
                    address={event.locationAddress}
                    label={event.title}
                    tone="default"
                    className="ml-0.5 h-6 w-6 align-middle"
                    iconClassName="h-3.5 w-3.5"
                  />
                </p>
              )}
            </div>
          </Link>
        );
      })}

      <div className="pt-4">
        <Link
          href="/events"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#DDD7CC] py-3 text-sm font-semibold text-sage-dark transition-colors hover:bg-stone"
        >
          <Calendar className="h-4 w-4" />
          View Full Calendar
        </Link>
      </div>
    </div>
  );
}
