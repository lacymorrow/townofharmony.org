"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBuilderData } from "@/lib/builder-data";
import { meetings as staticMeetings } from "@/data/town/meetings";
import type { TownMeeting } from "@/data/town/types";

interface UpcomingMeetingsProps {
	limit?: number;
	className?: string;
}

const formatDate = (date: Date) =>
	date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});

const formatTime = (time: string) => time;

export function UpcomingMeetings({ limit = 5, className }: UpcomingMeetingsProps) {
	const today = new Date().toISOString().split("T")[0];

	const { data: allMeetings } = useBuilderData<TownMeeting>("town-meeting", {
		limit: 50,
		fallback: staticMeetings,
	});

	const upcomingMeetings = allMeetings
		.filter((m) => m.meetingDate.split("T")[0]! >= today!)
		.sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())
		.slice(0, limit);

	if (upcomingMeetings.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Upcoming Meetings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No upcoming meetings scheduled at this time.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Upcoming Meetings
					</CardTitle>
					<Link
						href="/meetings?status=upcoming"
						className="text-sm text-sage hover:text-sage-dark"
					>
						View all →
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{upcomingMeetings.map((meeting) => {
						const meetingDate = new Date(meeting.meetingDate);
						return (
							<Link
								key={meeting.slug}
								href={`/meetings/${meeting.slug}`}
								className="block p-4 border rounded-lg hover:shadow-md transition-all hover:border-[#DDD7CC]"
							>
								<div className="flex justify-between items-start gap-4">
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold truncate">{meeting.title}</h4>

										{meeting.type && (
											<Badge variant="secondary" className="mt-1 mb-2">
												{meeting.type}
											</Badge>
										)}

										<div className="space-y-1 text-sm text-muted-foreground">
											<div className="flex items-center gap-2">
												<Calendar className="h-3 w-3" />
												<span>{formatDate(meetingDate)}</span>
											</div>

											{meeting.meetingTime && (
												<div className="flex items-center gap-2">
													<Clock className="h-3 w-3" />
													<span>{formatTime(meeting.meetingTime)}</span>
												</div>
											)}

											{meeting.location && (
												<div className="flex items-center gap-2">
													<MapPin className="h-3 w-3" />
													<span className="truncate">{meeting.location}</span>
												</div>
											)}

											{Array.isArray(meeting.attendees) && meeting.attendees.length > 0 && (
												<div className="flex items-center gap-2">
													<Users className="h-3 w-3" />
													<span>{meeting.attendees.length.toString()} attendees expected</span>
												</div>
											)}
										</div>
									</div>

									<div className="text-sm text-muted-foreground text-right">
										{meeting.agenda && <div className="mb-1">Agenda available</div>}
										{(meeting.videoUrl || meeting.audioUrl) && <div>Recording planned</div>}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
