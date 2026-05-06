import { Calendar, Clock, MapPin, Repeat, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";

interface EventCardProps {
	event: {
		id: number;
		title: string;
		slug: string;
		description: string | null;
		featuredImage: string | null;
		eventDate: string;
		eventTime: string | null;
		endTime: string | null;
		location: string | null;
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

	return (
		<Card className="hover:shadow-md transition-shadow">
			<div className="flex">
				{event.featuredImage && (
					<div className="hidden sm:block w-32 shrink-0 overflow-hidden rounded-l-lg">
						<img
							src={event.featuredImage}
							alt={event.title}
							className="w-full h-full object-cover"
						/>
					</div>
				)}
				<div className="flex-1 p-4">
					<div className="flex justify-between items-start gap-3">
						<div className="flex-1 min-w-0">
							<Link href={`/events/${event.slug}`} className="hover:text-sage-dark transition-colors">
								<h3 className="text-base font-semibold leading-tight">{event.title}</h3>
							</Link>

							{event.categories && event.categories.length > 0 && (
								<div className="flex gap-1.5 flex-wrap mt-1.5">
									{event.categories.map((cat) => (
										<Badge key={cat} variant="secondary" className="text-xs px-1.5 py-0">
											{cat}
										</Badge>
									))}
								</div>
							)}
						</div>

						{event.isRecurring && (
							<Badge variant="outline" className="flex items-center gap-1 text-xs shrink-0">
								<Repeat className="h-3 w-3" />
								Recurring
							</Badge>
						)}
					</div>

					{event.description && (
						<p className="text-muted-foreground text-sm mt-2 line-clamp-1">{event.description}</p>
					)}

					<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Calendar className="h-3.5 w-3.5" />
							{formatDate(eventDate)}
						</span>

						{event.eventTime && (
							<span className="flex items-center gap-1">
								<Clock className="h-3.5 w-3.5" />
								{formatTime(event.eventTime)}
								{event.endTime && ` - ${formatTime(event.endTime)}`}
							</span>
						)}

						{event.location && (
							<span className="flex items-center gap-1">
								<MapPin className="h-3.5 w-3.5" />
								{event.location}
							</span>
						)}

						{event.maxAttendees && (
							<span className="flex items-center gap-1">
								<Users className="h-3.5 w-3.5" />
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
								className="text-sage hover:text-sage-dark text-xs font-medium"
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
