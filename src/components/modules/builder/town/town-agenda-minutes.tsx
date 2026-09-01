"use client";

import { Calendar, Clock, ExternalLink, FileText, MapPin, Video, Volume2 } from "lucide-react";
import { useState } from "react";
import { meetings as staticMeetings } from "@/data/town/meetings";
import type { TownMeeting } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";
import { getTodayString, toDateOnly } from "@/lib/date-only";
import { getCanonicalMeetingSlug } from "@/lib/meeting-slug";
import { cn } from "@/lib/utils";

type Tab = "agenda" | "minutes";

interface TownAgendaMinutesProps {
  defaultTab?: Tab;
}

export const TownAgendaMinutes = ({ defaultTab = "agenda" }: TownAgendaMinutesProps = {}) => {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const today = getTodayString();
  // Unparseable dates classify as upcoming (Agenda tab), matching the
  // events page — better to over-show an agenda than bury it in Minutes.
  const isPastMeeting = (m: TownMeeting) => {
    const dateStr = toDateOnly(m.meetingDate);
    return dateStr ? dateStr < today : false;
  };

  const { data: allMeetings } = useBuilderData<TownMeeting>("town-meeting", {
    limit: 50,
    fallback: staticMeetings,
  });

  const upcomingMeetings = allMeetings
    .filter((m) => !isPastMeeting(m))
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());

  const pastMeetings = allMeetings
    .filter((m) => isPastMeeting(m))
    .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <section className="py-16 bg-warm-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
            Agendas &amp; Minutes
          </h2>
          <p className="text-[#635E56] text-base">Town meeting agendas and official minutes</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("agenda")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              activeTab === "agenda"
                ? "bg-sage-dark text-white"
                : "bg-cream text-[#4A4640] hover:bg-stone"
            )}
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agenda
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("minutes")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              activeTab === "minutes"
                ? "bg-sage-dark text-white"
                : "bg-cream text-[#4A4640] hover:bg-stone"
            )}
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Minutes
            </span>
          </button>
        </div>

        {/* Agenda Tab */}
        {activeTab === "agenda" && (
          <div className="space-y-4">
            {upcomingMeetings.length === 0 ? (
              <div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
                No upcoming meetings scheduled at this time.
              </div>
            ) : (
              upcomingMeetings.map((meeting) => (
                <div
                  key={getCanonicalMeetingSlug(meeting)}
                  className="bg-warm-white rounded-xl border border-[#DDD7CC] overflow-hidden"
                >
                  {/* Meeting header */}
                  <div className="bg-sage-dark text-white px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <h3 className="font-semibold text-[17px]">{meeting.title}</h3>
                    {meeting.type?.trim() && (
                      <span className="bg-wheat/20 text-[#E8D5A3] text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {meeting.type}
                      </span>
                    )}
                  </div>

                  {/* Meeting details */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-base text-[#4A4640] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-sage" />
                        {formatDate(meeting.meetingDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sage" />
                        {meeting.meetingTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-sage" />
                        {meeting.location}
                      </span>
                    </div>

                    {meeting.agenda && (
                      <div className="bg-cream rounded-lg p-4">
                        <p className="text-xs font-semibold text-[#4A4640] uppercase tracking-wider mb-2">
                          Agenda
                        </p>
                        <pre className="text-base text-[#4A4640] whitespace-pre-wrap font-sans leading-relaxed">
                          {meeting.agenda}
                        </pre>
                      </div>
                    )}

                    {Array.isArray(meeting.attendees) && meeting.attendees.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#DDD7CC]">
                        <p className="text-xs font-semibold text-[#4A4640] uppercase tracking-wider mb-1">
                          Expected Attendees
                        </p>
                        <p className="text-base text-[#4A4640]">{meeting.attendees.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Minutes Tab */}
        {activeTab === "minutes" && (
          <div className="space-y-4">
            {pastMeetings.length === 0 ? (
              <div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
                No meeting minutes available at this time.
              </div>
            ) : (
              pastMeetings.map((meeting) => (
                <div
                  key={getCanonicalMeetingSlug(meeting)}
                  className="bg-warm-white rounded-xl border border-[#DDD7CC] overflow-hidden"
                >
                  {/* Meeting header */}
                  <div className="bg-sage/10 px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#DDD7CC]">
                    <h3 className="font-semibold text-[17px] text-[#2D2A24]">{meeting.title}</h3>
                    {meeting.type?.trim() && (
                      <span className="bg-sage-dark/10 text-sage-dark text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {meeting.type}
                      </span>
                    )}
                  </div>

                  {/* Meeting details */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-base text-[#4A4640] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-sage" />
                        {formatDate(meeting.meetingDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-sage" />
                        {meeting.location}
                      </span>
                    </div>

                    {/* Minutes content or link */}
                    {meeting.minutes && (
                      <div className="bg-cream rounded-lg p-4 mb-3">
                        <p className="text-xs font-semibold text-[#4A4640] uppercase tracking-wider mb-2">
                          Minutes
                        </p>
                        <pre className="text-base text-[#4A4640] whitespace-pre-wrap font-sans leading-relaxed">
                          {meeting.minutes}
                        </pre>
                      </div>
                    )}

                    {/* Document links */}
                    <div className="flex flex-wrap gap-3">
                      {meeting.minutesUrl && (
                        <a
                          href={meeting.minutesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-sage-dark text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sage-deep transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Minutes
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {meeting.videoUrl && (
                        <a
                          href={meeting.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-cream text-[#2D2A24] px-4 py-2 rounded-lg text-sm font-semibold border border-[#DDD7CC] hover:shadow-md transition-shadow"
                        >
                          <Video className="h-3.5 w-3.5 text-sage" />
                          Video Recording
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {meeting.audioUrl && (
                        <a
                          href={meeting.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-cream text-[#2D2A24] px-4 py-2 rounded-lg text-sm font-semibold border border-[#DDD7CC] hover:shadow-md transition-shadow"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-sage" />
                          Audio Recording
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {!meeting.minutes && !meeting.minutesUrl && (
                        <p className="text-sm text-[#9E9A92] italic">
                          Minutes not yet available for this meeting.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
