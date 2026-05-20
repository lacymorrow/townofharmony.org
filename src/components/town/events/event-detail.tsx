import {
	Calendar,
	Clock,
	Download,
	ExternalLink,
	MapPin,
	Repeat,
	Share2,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PayloadRichText, extractTextFromRichText } from "@/components/town/payload-rich-text";
import { formatDate, formatTime } from "@/lib/utils";
import { getMediaUrl } from "@/lib/utils/get-media-url";

interface EventDetailProps {
	event: {
		id: number | string;
		title: string;
		slug: string;
		description: string | null;
		content: any;
		eventDate: string;
		eventTime: string | null;
		endTime: string | null;
		location: string | null;
		locationAddress: string | null;
		organizer: string | null;
		contactEmail: string | null;
		contactPhone: string | null;
		registrationUrl: string | null;
		registrationDeadline: string | null;
		cost: string | null;
		categories: string[] | null;
		tags: string[] | null;
		featuredImage: any;
		maxAttendees: number | null;
		currentAttendees: number | null;
		isRecurring: boolean | null;
		recurrenceRule: string | null;
		createdAt: Date;
		updatedAt: Date;
	};
}

export function EventDetail({ event }: EventDetailProps) {
	const eventDate = new Date(event.eventDate);
	const now = new Date();
	const isPast = eventDate < now;
	const registrationDeadline = event.registrationDeadline
		? new Date(event.registrationDeadline)
		: null;
	const isRegistrationOpen = registrationDeadline ? now < registrationDeadline : true;
	const spotsAvailable = event.maxAttendees
		? event.maxAttendees - (event.currentAttendees || 0)
		: null;

	// Extract plain text description from rich text content if description is not a plain string
	const descriptionText = typeof event.description === "string"
		? event.description
		: event.description
			? extractTextFromRichText(event.description as any)
			: null;

	return (
		<article>
			<header className="mb-8">
				<h1 className="text-4xl font-bold mb-4">{event.title}</h1>

				<div className="flex flex-wrap gap-2 mb-6">
					{event.categories?.map((cat) => (
						<Badge key={cat} variant="secondary">
							{cat}
						</Badge>
					))}
					{isPast && (
						<Badge variant="secondary" className="bg-muted text-muted-foreground">
							Past Event
						</Badge>
					)}
					{event.isRecurring && (
						<Badge variant="outline" className="flex items-center gap-1">
							<Repeat className="h-3 w-3" />
							Recurring Event
						</Badge>
					)}
				</div>

				{getMediaUrl(event.featuredImage) && (
					<img
						src={getMediaUrl(event.featuredImage)!}
						alt={event.title}
						className="w-full h-96 object-cover rounded-lg mb-6"
					/>
				)}
			</header>

			<div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
				<div className="space-y-6">
					{descriptionText && (
						<div className="prose max-w-none">
							<p className="text-lg text-muted-foreground">{descriptionText}</p>
						</div>
					)}

					{event.content && (
						<PayloadRichText content={event.content as any} className="prose max-w-none" />
					)}

					{event.organizer && (
						<Card>
							<CardContent className="pt-6">
								<h3 className="font-semibold mb-3">Event Organizer</h3>
								<p className="font-medium">{event.organizer}</p>
								{event.contactEmail && (
									<p className="text-sm text-muted-foreground">Email: {event.contactEmail}</p>
								)}
								{event.contactPhone && (
									<p className="text-sm text-muted-foreground">Phone: {event.contactPhone}</p>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-6">
					<Card>
						<CardContent className="pt-6 space-y-4">
							<div className="flex items-start gap-3">
								<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="font-medium">{formatDate(eventDate)}</p>
									{event.isRecurring && event.recurrenceRule && (
										<p className="text-sm text-muted-foreground">{event.recurrenceRule}</p>
									)}
								</div>
							</div>

							{event.eventTime && (
								<div className="flex items-start gap-3">
									<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="font-medium">
											{formatTime(event.eventTime)}
											{event.endTime && ` - ${formatTime(event.endTime)}`}
										</p>
									</div>
								</div>
							)}

							{event.location && (
								<div className="flex items-start gap-3">
									<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="font-medium">{event.location}</p>
										{event.locationAddress && (
											<p className="text-sm text-muted-foreground">{event.locationAddress}</p>
										)}
									</div>
								</div>
							)}

							{event.cost && (
								<div className="pt-3 border-t">
									<p className="text-sm text-muted-foreground">Cost</p>
									<p className="font-medium">{event.cost}</p>
								</div>
							)}

							{event.maxAttendees && (
								<div className="pt-3 border-t">
									<div className="flex items-center gap-2 mb-2">
										<Users className="h-5 w-5 text-muted-foreground" />
										<span className="font-medium">Attendance</span>
									</div>
									<p className="text-sm">
										{event.currentAttendees || 0} / {event.maxAttendees} registered
									</p>
									{spotsAvailable !== null && spotsAvailable > 0 && (
										<p className="text-sm text-green-600 font-medium">
											{spotsAvailable} spots available
										</p>
									)}
									{spotsAvailable === 0 && (
										<p className="text-sm text-red-600 font-medium">Event full</p>
									)}
								</div>
							)}

							{registrationDeadline && (
								<div className="pt-3 border-t">
									<p className="text-sm text-muted-foreground">Registration deadline</p>
									<p className="font-medium">{formatDate(registrationDeadline)}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{event.registrationUrl && isRegistrationOpen && spotsAvailable !== 0 && (
						<Button className="w-full" asChild>
							<a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
								Register for Event
								<ExternalLink className="ml-2 h-4 w-4" />
							</a>
						</Button>
					)}

					<div className="flex gap-2">
						<Button variant="outline" className="flex-1">
							<Share2 className="h-4 w-4 mr-2" />
							Share
						</Button>
						<Button variant="outline" className="flex-1">
							<Download className="h-4 w-4 mr-2" />
							Add to Calendar
						</Button>
					</div>

					{event.tags && event.tags.length > 0 && (
						<Card>
							<CardContent className="pt-6">
								<h3 className="font-semibold mb-3">Tags</h3>
								<div className="flex flex-wrap gap-2">
									{event.tags.map((tag) => (
										<Badge key={tag} variant="outline">
											{tag}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</article>
	);
}
