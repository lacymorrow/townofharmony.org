import { Calendar, Clock, MapPin, Repeat, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
	const isMultiDay = event.endTime && event.eventTime;

	return (
		<Card className="hover:shadow-lg transition-shadow">
			{event.featuredImage && (
				<div className="h-48 overflow-hidden rounded-t-lg">
					<img
						src={event.featuredImage}
						alt={event.title}
						className="w-full h-full object-cover"
					/>
				</div>
			)}
			<CardHeader>
				<div className="flex justify-between items-start gap-4">
					<div className="flex-1">
						<Link href={`/events/${event.slug}`} className="hover:text-sage-dark transition-colors">
							<h3 className="text-xl font-semibold mb-2">{event.title}</h3>
						</Link>

						{event.categories && event.categories.length > 0 && (
							<div className="flex gap-2 flex-wrap mb-3">
								{event.categories.map((cat) => (
									<Badge key={cat} variant="secondary">
										{cat}
									</Badge>
								))}
							</div>
						)}
					</div>

					{event.isRecurring && (
						<Badge variant="outline" className="flex items-center gap-1">
							<Repeat className="h-3 w-3" />
							Recurring
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent>
				{event.description && (
					<p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
				)}

				<div className="space-y-2 text-sm">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span>{formatDate(eventDate)}</span>
					</div>

					{event.eventTime && (
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span>
								{formatTime(event.eventTime)}
								{event.endTime && ` - ${formatTime(event.endTime)}`}
							</span>
						</div>
					)}

					{event.location && (
						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							<span>{event.location}</span>
						</div>
					)}

					{event.maxAttendees && (
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span>
								{event.currentAttendees || 0} / {event.maxAttendees} attending
							</span>
						</div>
					)}
				</div>

				{event.registrationUrl && (
					<div className="mt-4">
						<a
							href={event.registrationUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sage font-semibold hover:text-sage-dark text-sm font-medium"
						>
							Register for this event →
						</a>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
