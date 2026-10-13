import Link from "next/link";
import { DocumentViewer } from "@/components/town/document-viewer";
import type { TownMeeting } from "@/data/town/types";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { formatTime } from "@/lib/utils";

interface MeetingDetailBodyProps {
  meeting: TownMeeting;
}

const typeColors: Record<string, string> = {
  Council: "bg-sage/15 text-sage-dark border-sage/30",
  Planning: "bg-wheat/30 text-sage-dark border-wheat/50",
  "Public Hearing": "bg-barn-red/10 text-barn-red border-barn-red/20",
};

const safeArray = (arr: unknown): string[] => (Array.isArray(arr) ? arr : []);

export const MeetingDetailBody = ({ meeting }: MeetingDetailBodyProps) => {
  const parsedDate = meeting.meetingDate ? new Date(meeting.meetingDate) : null;
  const meetingDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : "Date to be announced";

  return (
    <section className="bg-warm-white py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <Link
          href="/meetings"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sage transition-colors hover:text-sage-dark"
        >
          &larr; Back to Meetings
        </Link>

        {meeting.type?.trim() && (
          <div className="mb-4">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeColors[meeting.type] || typeColors.Council}`}
            >
              {meeting.type}
            </span>
          </div>
        )}

        <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-sage-dark md:text-4xl">
          {meeting.title}
        </h1>

        <div className="mb-8 rounded-xl border border-stone bg-cream p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
            Meeting Details
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                Date
              </dt>
              <dd className="font-medium text-sage-dark">{meetingDate}</dd>
            </div>
            <div>
              <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                Time
              </dt>
              <dd className="font-medium text-sage-dark">
                {meeting.meetingTime ? formatTime(meeting.meetingTime) : ""}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                Location
              </dt>
              <dd className="font-medium text-sage-dark">{meeting.location}</dd>
            </div>
            <div>
              <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                Open to Public
              </dt>
              <dd className="font-medium text-sage-dark">{meeting.isPublic ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>

        {safeArray(meeting.attendees).length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-serif text-lg font-bold text-sage-dark">Attendees</h2>
            <ul className="divide-y divide-stone rounded-xl border border-stone bg-cream">
              {safeArray(meeting.attendees).map((attendee) => (
                <li key={attendee} className="px-5 py-3 text-base text-sage-dark/85">
                  {attendee}
                </li>
              ))}
            </ul>
          </div>
        )}

        {meeting.agenda && (
          <div className="mb-8">
            <h2 className="mb-3 font-serif text-lg font-bold text-sage-dark">Agenda</h2>
            <div
              className="prose prose-lg max-w-none rounded-xl border border-stone bg-cream p-6 text-sage-dark/85"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(meeting.agenda) }}
            />
          </div>
        )}

        {(meeting.minutes || meeting.minutesUrl) && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-serif text-lg font-bold text-sage-dark">Meeting Minutes</h2>
              {meeting.minutesUrl && (
                <a
                  href={meeting.minutesUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark"
                >
                  Download
                </a>
              )}
            </div>
            {meeting.minutes && (
              <div
                className="prose prose-lg mb-3 max-w-none rounded-xl border border-stone bg-cream p-6 text-sage-dark/85"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(meeting.minutes) }}
              />
            )}
            {meeting.minutesUrl && (
              <div className="h-[75svh] min-h-[480px] overflow-hidden rounded-xl border border-stone bg-white">
                <DocumentViewer url={meeting.minutesUrl} title={`Minutes - ${meeting.title}`} />
              </div>
            )}
          </div>
        )}

        {(meeting.videoUrl || meeting.audioUrl) && (
          <div className="mb-8">
            <h2 className="mb-3 font-serif text-lg font-bold text-sage-dark">Recordings</h2>
            <div className="flex flex-wrap gap-3">
              {meeting.videoUrl && (
                <a
                  href={meeting.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-sage px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
                >
                  Watch Video Recording
                </a>
              )}
              {meeting.audioUrl && (
                <a
                  href={meeting.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-wheat px-5 py-2.5 text-sm font-semibold text-sage-deep transition-colors hover:bg-wheat-light"
                >
                  Listen to Audio Recording
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
