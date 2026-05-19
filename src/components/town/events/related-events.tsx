import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";
import { getEvents } from "@/lib/town-data";

interface RelatedEventsProps {
	currentEventId: number | string;
	categories?: string[] | null;
}

export async function RelatedEvents({ currentEventId, categories }: RelatedEventsProps) {
	// Fetch upcoming events, optionally filtered by category
	const category = categories && categories.length > 0 ? categories[0] : undefined;

	const result = await getEvents({
		category,
		status: "upcoming",
		limit: 6, // Fetch one extra so we can filter out the current event
	});

	// Filter out the current event from the results
	const related = result.docs
		.filter((event: any) => event.id !== currentEventId)
		.slice(0, 5);

	if (related.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Related Events</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{related.map((event: any) => (
						<div key={event.id} className="pb-4 border-b last:border-0">
							<Link
								href={`/events/${event.slug}`}
								className="block hover:text-sage-dark transition-colors"
							>
								<h4 className="font-medium mb-2 line-clamp-2">{event.title}</h4>
								<div className="space-y-1 text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{formatDate(new Date(event.eventDate))}
									</div>
									{event.eventTime && (
										<div className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{formatTime(event.eventTime)}
										</div>
									)}
								</div>
							</Link>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
