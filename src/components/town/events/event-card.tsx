import { Calendar, Clock, MapPin, Repeat, Users } from "lucide-react";
import Link from "next/link";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { htmlToPlainText } from "@/lib/html-to-text";
import { formatDate, formatTime } from "@/lib/utils";

interface EventCardProps {
	event: {
		id: number | string;
		title: string;
		slug: string;
		description: string | null;
		featuredImage: string | null;
		eventDate: string;
		eventTime: string | null;
		endTime: string | null;
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
	const isPast = eventDate < new Date();
	// Builder rich text descriptions arrive as HTML strings — show plain text in previews
	const description = htmlToPlainText(event.description);

	return (
		<Card className="hover:shadow-md transition-shadow">
			<div className="flex">
				{event.featuredImage && (
					<LightboxImage
						src={event.featuredImage}
						alt={event.title}
						wrapperClassName="hidden sm:block w-32 min-h-[64px] shrink-0 rounded-l-lg"
						className="w-full h-full object-cover"
					/>
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

						<div className="flex gap-1.5 shrink-0">
							{isPast && (
								<Badge variant="secondary" className="inline-block align-middle text-xs bg-muted text-muted-foreground">
									Past Event
								</Badge>
							)}
							{event.isRecurring && (
								<Badge variant="outline" className="inline-block align-middle text-xs">
									<Repeat className="h-3 w-3 inline-block align-middle mr-1" aria-hidden="true" />
									Recurring
								</Badge>
							)}
						</div>
					</div>

					{description && (
						<p className="text-muted-foreground text-sm mt-2 line-clamp-1">{description}</p>
					)}

					<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
						<span className="align-middle">
							<Calendar className="h-3.5 w-3.5 inline-block align-middle mr-1" aria-hidden="true" />
							{formatDate(eventDate)}
						</span>

						{event.eventTime && (
							<span className="align-middle">
								<Clock className="h-3.5 w-3.5 inline-block align-middle mr-1" aria-hidden="true" />
								{formatTime(event.eventTime)}
								{event.endTime && ` - ${formatTime(event.endTime)}`}
							</span>
						)}

						{event.locationAddress && (
							<span className="align-middle">
								<MapPin className="h-3.5 w-3.5 inline-block align-middle mr-1" aria-hidden="true" />
								{event.locationAddress}
								<AddressCopyButton
									address={event.locationAddress}
									label={event.title}
									tone="default"
									className="h-6 w-6 ml-0.5 align-middle"
									iconClassName="h-3.5 w-3.5"
								/>
							</span>
						)}

						{event.maxAttendees && (
							<span className="align-middle">
								<Users className="h-3.5 w-3.5 inline-block align-middle mr-1" aria-hidden="true" />
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
