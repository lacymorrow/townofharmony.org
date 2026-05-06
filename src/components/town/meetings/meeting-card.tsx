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
		<Card className="hover:shadow-md transition-shadow">
			<div className="p-4">
				<div className="flex justify-between items-start gap-3">
					<div className="flex-1 min-w-0">
						<Link
							href={`/meetings/${meeting.slug}`}
							className="hover:text-sage-dark transition-colors"
						>
							<h3 className="text-base font-semibold leading-tight">{meeting.title}</h3>
						</Link>

						<div className="flex gap-1.5 flex-wrap mt-1.5">
							{meeting.type && <Badge variant="secondary" className="text-xs px-1.5 py-0">{meeting.type}</Badge>}
							{!meeting.isPublic && <Badge variant="outline" className="text-xs px-1.5 py-0">Private</Badge>}
							{isPastMeeting ? (
								<Badge variant="default" className="text-xs px-1.5 py-0">Completed</Badge>
							) : (
								<Badge variant="outline" className="text-xs px-1.5 py-0">Upcoming</Badge>
							)}
						</div>
					</div>

					{hasRecordings && (
						<div className="flex gap-1 shrink-0">
							{meeting.videoUrl && (
								<Badge variant="outline" className="flex items-center gap-1 text-xs px-1.5 py-0">
									<Video className="h-3 w-3" />
									Video
								</Badge>
							)}
							{meeting.audioUrl && (
								<Badge variant="outline" className="flex items-center gap-1 text-xs px-1.5 py-0">
									<Headphones className="h-3 w-3" />
									Audio
								</Badge>
							)}
						</div>
					)}
				</div>

				<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<Calendar className="h-3.5 w-3.5" />
						{formatDate(meetingDate)}
					</span>

					{meeting.meetingTime && (
						<span className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							{formatTime(meeting.meetingTime)}
						</span>
					)}

					{meeting.location && (
						<span className="flex items-center gap-1">
							<MapPin className="h-3.5 w-3.5" />
							{meeting.location}
						</span>
					)}

					{meeting.attendees &&
						Array.isArray(meeting.attendees) &&
						meeting.attendees.length > 0 && (
							<span className="flex items-center gap-1">
								<Users className="h-3.5 w-3.5" />
								{meeting.attendees.length} attendees
							</span>
						)}
				</div>

				{(hasDocuments || hasRecordings) && (
					<div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t text-xs">
						{meeting.agendaUrl && (
							<a
								href={meeting.agendaUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-sage hover:text-sage-dark font-medium"
							>
								<FileText className="h-3 w-3" />
								Agenda
							</a>
						)}
						{meeting.minutesUrl && (
							<a
								href={meeting.minutesUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-sage hover:text-sage-dark font-medium"
							>
								<FileText className="h-3 w-3" />
								Minutes
							</a>
						)}
						{meeting.documents &&
							meeting.documents.map((doc, index) => (
								<a
									key={index}
									href={doc}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-sage hover:text-sage-dark font-medium"
								>
									<FileText className="h-3 w-3" />
									Doc {index + 1}
								</a>
							))}
						{meeting.videoUrl && (
							<a
								href={meeting.videoUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-sage hover:text-sage-dark font-medium"
							>
								<Video className="h-3 w-3" />
								Video
							</a>
						)}
						{meeting.audioUrl && (
							<a
								href={meeting.audioUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-sage hover:text-sage-dark font-medium"
							>
								<Headphones className="h-3 w-3" />
								Audio
							</a>
						)}
					</div>
				)}
			</div>
		</Card>
	);
}
