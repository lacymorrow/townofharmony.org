import { Calendar, Clock, FileText, Headphones, MapPin, Users, Video } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";

interface MeetingCardProps {
  meeting: {
    id: number;
    title: string;
    slug: string;
    type: string | null;
    meetingDate: string;
    meetingTime: string | null;
    location: string | null;
    agenda: string | null;
    agendaUrl: string | null;
    minutes: string | null;
    minutesUrl: string | null;
    videoUrl: string | null;
    audioUrl: string | null;
    documents: string[] | null;
    attendees: any;
    isPublic: boolean | null;
  };
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const meetingDate = new Date(meeting.meetingDate);
  const isPastMeeting = meetingDate < new Date();
  const hasRecordings = meeting.videoUrl || meeting.audioUrl;
  const hasDocuments =
    meeting.agendaUrl || meeting.minutesUrl || (meeting.documents && meeting.documents.length > 0);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/meetings/${meeting.slug}`}
              className="transition-colors hover:text-sage-dark"
            >
              <h3 className="text-base font-semibold leading-tight">{meeting.title}</h3>
            </Link>

            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {meeting.type && (
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  {meeting.type}
                </Badge>
              )}
              {!meeting.isPublic && (
                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                  Private
                </Badge>
              )}
              {isPastMeeting ? (
                <Badge variant="default" className="px-1.5 py-0 text-xs">
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                  Upcoming
                </Badge>
              )}
            </div>
          </div>

          {hasRecordings && (
            <div className="flex shrink-0 gap-1">
              {meeting.videoUrl && (
                <Badge variant="outline" className="inline-block px-1.5 py-0 align-middle text-xs">
                  <Video className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                  Video
                </Badge>
              )}
              {meeting.audioUrl && (
                <Badge variant="outline" className="inline-block px-1.5 py-0 align-middle text-xs">
                  <Headphones
                    className="mr-1 inline-block h-3 w-3 align-middle"
                    aria-hidden="true"
                  />
                  Audio
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="align-middle">
            <Calendar className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
            {formatDate(meetingDate)}
          </span>

          {meeting.meetingTime && (
            <span className="align-middle">
              <Clock className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
              {formatTime(meeting.meetingTime)}
            </span>
          )}

          {meeting.location && (
            <span className="align-middle">
              <MapPin className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
              {meeting.location}
            </span>
          )}

          {meeting.attendees &&
            Array.isArray(meeting.attendees) &&
            meeting.attendees.length > 0 && (
              <span className="align-middle">
                <Users className="mr-1 inline-block h-3.5 w-3.5 align-middle" aria-hidden="true" />
                {meeting.attendees.length} attendees
              </span>
            )}
        </div>

        {(hasDocuments || hasRecordings) && (
          <div className="mt-2 flex flex-wrap items-center gap-3 border-t pt-2 text-xs">
            {meeting.agendaUrl && (
              <Link
                href={`/meetings/${meeting.slug}#agenda`}
                className="align-middle font-medium text-sage hover:text-sage-dark"
              >
                <FileText className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                Agenda
              </Link>
            )}
            {meeting.minutesUrl && (
              <Link
                href={`/meetings/${meeting.slug}#minutes`}
                className="align-middle font-medium text-sage hover:text-sage-dark"
              >
                <FileText className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                Minutes
              </Link>
            )}
            {meeting.documents &&
              meeting.documents.map((doc, index) => (
                <Link
                  key={index}
                  href={`/meetings/${meeting.slug}#doc-${index}`}
                  className="align-middle font-medium text-sage hover:text-sage-dark"
                >
                  <FileText className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                  Doc {index + 1}
                </Link>
              ))}
            {meeting.videoUrl && (
              <a
                href={meeting.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="align-middle font-medium text-sage hover:text-sage-dark"
              >
                <Video className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                Video
              </a>
            )}
            {meeting.audioUrl && (
              <a
                href={meeting.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="align-middle font-medium text-sage hover:text-sage-dark"
              >
                <Headphones className="mr-1 inline-block h-3 w-3 align-middle" aria-hidden="true" />
                Audio
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
