import { Calendar } from "lucide-react";
import Link from "next/link";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { getEvents } from "@/lib/town-data";

export async function UpcomingEvents() {
	const { docs: upcomingEvents } = await getEvents({ limit: 5, status: "upcoming" });

	if (upcomingEvents.length === 0) {
		return (
			<div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
				No upcoming events scheduled.
			</div>
		);
	}

	return (
		<div className="space-y-2.5">
			{upcomingEvents.map((event) => {
				const date = new Date(event.eventDate);
				const dateStr = date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				});

				return (
					<Link
						key={event.id}
						href={`/events/${event.slug}`}
						className="flex items-center gap-4 p-4 bg-cream rounded-[10px] border border-transparent hover:border-[#DDD7CC] transition-colors cursor-pointer group"
					>
						<div className="w-2.5 h-2.5 rounded-full bg-wheat flex-shrink-0" />
						<div className="flex-1">
							<div className="text-xs text-sage font-semibold">
								{dateStr}
								{event.eventTime && <> &middot; {event.eventTime}</>}
							</div>
							<h3 className="font-semibold text-[15px] text-[#2D2A24] group-hover:text-sage-dark transition-colors">
								{event.title}
							</h3>
							{event.locationAddress && (
								<p className="text-[13px] text-[#4A4640]">
									{event.locationAddress}
									<AddressCopyButton
										address={event.locationAddress}
										label={event.title}
										tone="default"
										className="h-6 w-6 ml-0.5 align-middle"
										iconClassName="h-3.5 w-3.5"
									/>
								</p>
							)}
						</div>
					</Link>
				);
			})}

			<div className="pt-4">
				<Link
					href="/events"
					className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#DDD7CC] text-sage-dark font-semibold text-sm hover:bg-stone transition-colors cursor-pointer"
				>
					<Calendar className="h-4 w-4" />
					View Full Calendar
				</Link>
			</div>
		</div>
	);
}
