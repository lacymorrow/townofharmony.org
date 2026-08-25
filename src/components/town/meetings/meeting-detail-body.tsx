import Link from "next/link";
import { DocumentViewer } from "@/components/town/document-viewer";
import type { TownMeeting } from "@/data/town/types";
import { sanitizeHtml } from "@/lib/sanitize-html";

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
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-2 text-sage hover:text-sage-dark text-sm font-medium mb-8 transition-colors"
        >
          &larr; Back to Meetings
        </Link>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${typeColors[meeting.type] || typeColors.Council}`}
          >
            {meeting.type}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark leading-tight mb-6">
          {meeting.title}
        </h1>

        <div className="bg-cream border border-stone rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-4">
            Meeting Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                Date
              </dt>
              <dd className="text-sage-dark font-medium">{meetingDate}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                Time
              </dt>
              <dd className="text-sage-dark font-medium">{meeting.meetingTime}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                Location
              </dt>
              <dd className="text-sage-dark font-medium">{meeting.location}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
                Open to Public
              </dt>
              <dd className="text-sage-dark font-medium">{meeting.isPublic ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>

        {safeArray(meeting.attendees).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-serif font-bold text-sage-dark mb-3">Attendees</h2>
            <ul className="bg-cream border border-stone rounded-xl divide-y divide-stone">
              {safeArray(meeting.attendees).map((attendee) => (
                <li key={attendee} className="px-5 py-3 text-sage-dark/85 text-base">
                  {attendee}
                </li>
              ))}
            </ul>
          </div>
        )}

        {meeting.agenda && (
          <div className="mb-8">
            <h2 className="text-lg font-serif font-bold text-sage-dark mb-3">Agenda</h2>
            <div
              className="prose prose-lg max-w-none bg-cream border border-stone rounded-xl p-6 text-sage-dark/85"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(meeting.agenda) }}
            />
          </div>
        )}

        {(meeting.minutes || meeting.minutesUrl) && (
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-lg font-serif font-bold text-sage-dark">Meeting Minutes</h2>
              {meeting.minutesUrl && (
                <a
                  href={meeting.minutesUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium"
                >
                  Download
                </a>
              )}
            </div>
            {meeting.minutes && (
              <div
                className="prose prose-lg max-w-none bg-cream border border-stone rounded-xl p-6 mb-3 text-sage-dark/85"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(meeting.minutes) }}
              />
            )}
            {meeting.minutesUrl && (
              <div className="border border-stone rounded-xl overflow-hidden bg-white h-[75svh] min-h-[480px]">
                <DocumentViewer url={meeting.minutesUrl} title={`Minutes - ${meeting.title}`} />
              </div>
            )}
          </div>
        )}

        {(meeting.videoUrl || meeting.audioUrl) && (
          <div className="mb-8">
            <h2 className="text-lg font-serif font-bold text-sage-dark mb-3">Recordings</h2>
            <div className="flex flex-wrap gap-3">
              {meeting.videoUrl && (
                <a
                  href={meeting.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-sage text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
                >
                  Watch Video Recording
                </a>
              )}
              {meeting.audioUrl && (
                <a
                  href={meeting.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-wheat text-sage-deep px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-wheat-light transition-colors"
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
