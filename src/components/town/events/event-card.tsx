import { Calendar, Clock, MapPin, Repeat, Users } from "lucide-react";
import Link from "next/link";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { htmlToPlainText } from "@/lib/html-to-text";
import { formatDate, formatTime } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: number | string;
    title: string;
    slug: string;
    description: string | null;
    featuredImage: string | null;
    eventDate: string;
    eventTime: string | null;
    endTime: string | null;
    locationAddress: string | null;
    categories: string[] | null;
    isRecurring: boolean | null;
    registrationUrl: string | null;
    maxAttendees: number | null;
    currentAttendees: number | null;
  };
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();
  // Builder rich text descriptions arrive as HTML strings — show plain text in previews
  const description = htmlToPlainText(event.description);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex">
        {event.featuredImage && (
          <LightboxImage
            src={event.featuredImage}
            alt={event.title}
            wrapperClassName="hidden sm:block w-32 min-h-[64px] shrink-0 rounded-l-lg"
            className="h-full w-full object-cover"
          />
        )}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/events/${event.slug}`}
                className="transition-colors hover:text-sage-dark"
              >
                <h3 className="text-base font-semibold leading-tight">{event.title}</h3>
              </Link>

              {event.categories && event.categories.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {event.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="px-1.5 py-0 text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-1.5">
              {isPast && (
                <Badge
                  variant="secondary"
                  className="inline-block bg-muted align-middle text-xs text-muted-foreground"
                >
                  Past Event
                </Badge>
              )}
              {event.isRecurring && (
                <Badge variant="outline" className="inline-block align-middle text-xs">
                  <Repeat className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                  Recurring
                </Badge>
              )}
            </div>
          </div>

          {description && (
            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{description}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="align-middle">
              <Calendar className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
              {formatDate(eventDate)}
            </span>

            {event.eventTime && (
              <span className="align-middle">
                <Clock className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
                {formatTime(event.eventTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </span>
            )}

            {event.locationAddress && (
              <span className="align-middle">
                <MapPin className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
                {event.locationAddress}
                <AddressCopyButton
                  address={event.locationAddress}
                  label={event.title}
                  tone="default"
                  className="ml-0.5 h-6 w-6 align-middle"
                  iconClassName="h-3.5 w-3.5"
                />
              </span>
            )}

            {event.maxAttendees && (
              <span className="align-middle">
                <Users className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
                {event.currentAttendees || 0} / {event.maxAttendees}
              </span>
            )}
          </div>

          {event.registrationUrl && (
            <div className="mt-2">
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-sage hover:text-sage-dark"
              >
                Register →
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
