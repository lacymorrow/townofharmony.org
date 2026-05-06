import { getEvents } from "@/lib/town-data";
import { EventCard } from "./event-card";
import { EventsPagination } from "./events-pagination";

interface EventsListProps {
	category?: string;
	month?: string;
	page?: string;
}

export async function EventsList({ category, month, page = "1" }: EventsListProps) {
	const pageNum = Number.parseInt(page);

	// Parse month filter into separate month/year values for the Payload query
	let monthParam: string | undefined;
	let yearParam: string | undefined;
	if (month) {
		const [year, monthNum] = month.split("-");
		yearParam = year;
		monthParam = monthNum;
	}

	const result = await getEvents({
		category,
		month: monthParam,
		year: yearParam,
		page: pageNum,
		limit: 10,
	});

	const items = result.docs;
	const totalPages = result.totalPages;

	if (items.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">No events found.</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3">
				{items.map((event: any) => (
					<EventCard key={event.id} event={event} />
				))}
			</div>

			{totalPages > 1 && (
				<EventsPagination
					currentPage={pageNum}
					totalPages={totalPages}
					baseUrl="/events"
					searchParams={{ category, month }}
				/>
			)}
		</>
	);
}
