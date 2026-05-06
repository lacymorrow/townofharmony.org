"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { useBuilderData } from "@/lib/builder-data";
import { events as staticEvents } from "@/data/town/events";
import type { TownEvent } from "@/data/town/types";

interface TownUpcomingEventsProps {
	limit?: number;
}

export const TownUpcomingEvents = ({ limit = 5 }: TownUpcomingEventsProps) => {
	const { data: allEvents } = useBuilderData<TownEvent>("town-event", {
		limit: 50,
		fallback: staticEvents,
	});

	const now = new Date();
	const upcomingEvents = allEvents
		.filter((e) => new Date(e.eventDate) >= now && e.status !== "cancelled")
		.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
		.slice(0, limit);

	if (upcomingEvents.length === 0) {
		return (
			<section className="py-16 bg-warm-white">
				<div className="container mx-auto px-4">
					<div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
						No upcoming events scheduled.
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-warm-white">
			<div className="container mx-auto px-4">
				<div className="text-center mb-10">
					<h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
						Upcoming Events
					</h2>
					<p className="text-[#4A4640] text-base">
						Join us at community gatherings and activities
					</p>
				</div>

				<div className="max-w-2xl mx-auto space-y-2.5">
					{upcomingEvents.map((event) => {
						const date = new Date(event.eventDate);
						const dateStr = date.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						});

						return (
							<Link
								key={event.slug}
								href={`/events/${event.slug}`}
								className="flex items-center gap-4 p-4 bg-cream rounded-[10px] border border-transparent hover:border-[#DDD7CC] transition-colors cursor-pointer group"
							>
								<div className="w-2.5 h-2.5 rounded-full bg-wheat flex-shrink-0" />
								<div className="flex-1">
									<div className="text-sm text-sage font-semibold">
										{dateStr}
										{event.eventTime && (
											<> &middot; {event.eventTime}</>
										)}
									</div>
									<h3 className="font-semibold text-[15px] text-[#2D2A24] group-hover:text-sage-dark transition-colors">
										{event.title}
									</h3>
									{event.location && (
										<p className="text-sm text-[#4A4640]">
											{event.location}
										</p>
									)}
								</div>
							</Link>
						);
					})}
				</div>

				<div className="pt-8 text-center">
					<Link
						href="/events"
						className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-lg border border-[#DDD7CC] text-sage-dark font-semibold text-sm hover:bg-stone transition-colors cursor-pointer"
					>
						<Calendar className="h-4 w-4" />
						View Full Calendar
					</Link>
				</div>
			</div>
		</section>
	);
};
