"use client";

import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";

interface Meeting {
  id: number;
  title: string;
  slug: string;
  type: string | null;
  meetingDate: string;
  meetingTime: string | null;
  location: string | null;
  isPublic: boolean | null;
}

interface MeetingsCalendarProps {
  meetings: Meeting[];
  initialMonth?: number;
  initialYear?: number;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MeetingsCalendar({ meetings, initialMonth, initialYear }: MeetingsCalendarProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(initialMonth || now.getMonth());
  const [currentYear, setCurrentYear] = useState(initialYear || now.getFullYear());

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get meetings for the current month
  const monthMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.meetingDate);
    return (
      meetingDate.getUTCMonth() === currentMonth && meetingDate.getUTCFullYear() === currentYear
    );
  });

  // Group meetings by date
  const meetingsByDate = monthMeetings.reduce(
    (acc, meeting) => {
      const date = new Date(meeting.meetingDate).getUTCDate();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(meeting);
      return acc;
    },
    {} as Record<number, Meeting[]>
  );

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-[#DDD7CC] p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayMeetings = meetingsByDate[day] || [];
      const isToday =
        day === now.getDate() &&
        currentMonth === now.getMonth() &&
        currentYear === now.getFullYear();

      days.push(
        <div
          key={day}
          className={`h-24 overflow-hidden border border-[#DDD7CC] p-2 ${
            isToday ? "border-[#DDD7CC] bg-cream" : "hover:bg-cream"
          }`}
        >
          <div className={`mb-1 text-sm font-medium ${isToday ? "text-sage" : ""}`}>
            {day}
            {isToday && <span className="ml-1 text-xs">(Today)</span>}
          </div>
          <div className="space-y-1">
            {dayMeetings.slice(0, 2).map((meeting) => (
              <Link key={meeting.id} href={`/meetings/${meeting.slug}`} className="block">
                <div className="truncate rounded bg-stone p-1 text-xs text-[#2D2A24] transition-colors hover:bg-[#DDD7CC]">
                  {meeting.meetingTime && (
                    <div className="font-medium">{formatTime(meeting.meetingTime)}</div>
                  )}
                  <div className="truncate">{meeting.title}</div>
                </div>
              </Link>
            ))}
            {dayMeetings.length > 2 && (
              <div className="text-xs font-medium text-[#635E56]">
                +{dayMeetings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meetings Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-xl font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-7 gap-0">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="border border-[#DDD7CC] bg-cream p-2 text-center text-sm font-medium text-[#4A4640]"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border-l border-t border-[#DDD7CC]">
          {renderCalendarDays()}
        </div>

        {/* Meeting Summary */}
        {monthMeetings.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-3 font-semibold">This Month's Meetings ({monthMeetings.length})</h4>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {monthMeetings
                .sort(
                  (a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
                )
                .map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meetings/${meeting.slug}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-cream"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h5 className="truncate font-medium">{meeting.title}</h5>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {new Date(meeting.meetingDate).toLocaleDateString("en-US", {
                              timeZone: "UTC",
                            })}
                          </span>
                          {meeting.meetingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(meeting.meetingTime)}
                            </span>
                          )}
                          {meeting.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3" />
                              {meeting.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {meeting.type && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          {meeting.type}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
