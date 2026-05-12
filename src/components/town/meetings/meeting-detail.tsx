import {
	ArrowLeft,
	Building,
	Calendar,
	Clock,
	Download,
	FileText,
	Headphones,
	MapPin,
	Users,
	Video,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";
import { MeetingDocuments } from "./meeting-documents";

interface MeetingDetailProps {
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
		createdAt: Date;
		updatedAt: Date | null;
	};
}

export function MeetingDetail({ meeting }: MeetingDetailProps) {
	const meetingDate = new Date(meeting.meetingDate);
	const isPastMeeting = meetingDate < new Date();
	const hasRecordings = meeting.videoUrl || meeting.audioUrl;
	const hasDocuments =
		meeting.agendaUrl || meeting.minutesUrl || (meeting.documents && meeting.documents.length > 0);

	return (
		<div className="container py-8">
			{/* Back Button */}
			<div className="mb-6">
				<Button variant="ghost" asChild>
					<Link href="/meetings" className="flex items-center gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Meetings
					</Link>
				</Button>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_300px]">
				<div className="space-y-6">
					{/* Meeting Header */}
					<div>
						<div className="flex items-start justify-between mb-4">
							<div className="flex-1">
								<h1 className="text-4xl font-bold mb-4">{meeting.title}</h1>
								<div className="flex gap-2 flex-wrap">
									{meeting.type && (
										<Badge variant="secondary" className="text-sm">
											{meeting.type}
										</Badge>
									)}
									{!meeting.isPublic && (
										<Badge variant="outline" className="text-sm">
											Private Meeting
										</Badge>
									)}
									{isPastMeeting ? (
										<Badge variant="default" className="text-sm">
											Completed
										</Badge>
									) : (
										<Badge variant="outline" className="text-sm">
											Upcoming
										</Badge>
									)}
								</div>
							</div>
						</div>

						{/* Meeting Details */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Meeting Information
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4 sm:grid-cols-2">
								<div className="flex items-center gap-3">
									<Calendar className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Date</p>
										<p className="font-medium">{formatDate(meetingDate)}</p>
									</div>
								</div>

								{meeting.meetingTime && (
									<div className="flex items-center gap-3">
										<Clock className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Time</p>
											<p className="font-medium">{formatTime(meeting.meetingTime)}</p>
										</div>
									</div>
								)}

								{meeting.location && (
									<div className="flex items-center gap-3">
										<MapPin className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Location</p>
											<p className="font-medium">{meeting.location}</p>
										</div>
									</div>
								)}

								{meeting.type && (
									<div className="flex items-center gap-3">
										<Building className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Type</p>
											<p className="font-medium">{meeting.type}</p>
										</div>
									</div>
								)}

								{meeting.attendees &&
									Array.isArray(meeting.attendees) &&
									meeting.attendees.length > 0 && (
										<div className="flex items-center gap-3 sm:col-span-2">
											<Users className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Expected Attendees</p>
												<p className="font-medium">{meeting.attendees.length} people</p>
											</div>
										</div>
									)}
							</CardContent>
						</Card>

						{/* Quick Access to Media */}
						{hasRecordings && (
							<Card>
								<CardHeader>
									<CardTitle>Recordings Available</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex gap-4">
										{meeting.videoUrl && (
											<Button asChild>
												<a
													href={meeting.videoUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2"
												>
													<Video className="h-4 w-4" />
													Watch Video
												</a>
											</Button>
										)}
										{meeting.audioUrl && (
											<Button asChild variant="outline">
												<a
													href={meeting.audioUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2"
												>
													<Headphones className="h-4 w-4" />
													Listen to Audio
												</a>
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Attendee List */}
						{meeting.attendees &&
							Array.isArray(meeting.attendees) &&
							meeting.attendees.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Users className="h-5 w-5" />
											Attendees
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
											{meeting.attendees.map((attendee: any, index: number) => (
												<div key={index} className="p-2 bg-muted rounded-lg">
													{typeof attendee === "string" ? (
														<p className="font-medium">{attendee}</p>
													) : (
														<div>
															<p className="font-medium">{attendee.name}</p>
															{attendee.role && (
																<p className="text-sm text-muted-foreground">{attendee.role}</p>
															)}
														</div>
													)}
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

						{/* Meeting Documents */}
						<MeetingDocuments meeting={meeting} />
					</div>
				</div>

				{/* Sidebar */}
				<aside className="space-y-6">
					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{meeting.agendaUrl && (
								<Button asChild variant="outline" size="sm" className="w-full justify-start">
									<a href={meeting.agendaUrl} download className="flex items-center gap-2">
										<Download className="h-4 w-4" />
										Download Agenda
									</a>
								</Button>
							)}

							{meeting.minutesUrl && (
								<Button asChild variant="outline" size="sm" className="w-full justify-start">
									<a href={meeting.minutesUrl} download className="flex items-center gap-2">
										<Download className="h-4 w-4" />
										Download Minutes
									</a>
								</Button>
							)}

							{meeting.videoUrl && (
								<Button asChild variant="outline" size="sm" className="w-full justify-start">
									<a
										href={meeting.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2"
									>
										<Video className="h-4 w-4" />
										Watch Recording
									</a>
								</Button>
							)}

							{meeting.audioUrl && (
								<Button asChild variant="outline" size="sm" className="w-full justify-start">
									<a
										href={meeting.audioUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2"
									>
										<Headphones className="h-4 w-4" />
										Audio Recording
									</a>
								</Button>
							)}

							<Button asChild variant="outline" size="sm" className="w-full justify-start">
								<Link href="/meetings" className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									View All Meetings
								</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Meeting Status */}
					<Card>
						<CardHeader>
							<CardTitle>Meeting Status</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Status:</span>
								<span className="text-sm font-medium">
									{isPastMeeting ? "Completed" : "Upcoming"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Public:</span>
								<span className="text-sm font-medium">{meeting.isPublic ? "Yes" : "No"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Recordings:</span>
								<span className="text-sm font-medium">
									{hasRecordings ? "Available" : "Not Available"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Documents:</span>
								<span className="text-sm font-medium">
									{hasDocuments ? "Available" : "Not Available"}
								</span>
							</div>
							{meeting.updatedAt && (
								<div className="pt-2 border-t">
									<span className="text-xs text-muted-foreground">
										Last updated: {new Date(meeting.updatedAt).toLocaleDateString()}
									</span>
								</div>
							)}
						</CardContent>
					</Card>
				</aside>
			</div>
		</div>
	);
}
