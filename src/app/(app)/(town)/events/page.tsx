import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsList } from "@/components/town/events/events-list";
import { EventsFilters } from "@/components/town/events/events-filters";

export const metadata: Metadata = {
	title: "Events | Town of Harmony, NC",
	description:
		"Discover community events, festivals, and activities happening in the Town of Harmony, North Carolina.",
};

export default async function EventsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const category = typeof params.category === "string" ? params.category : undefined;
	const month = typeof params.month === "string" ? params.month : undefined;
	const page = typeof params.page === "string" ? params.page : "1";

	return (
		<div className="container mx-auto max-w-6xl px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Events</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					Community events, festivals, and activities in the Town of Harmony.
				</p>
			</div>

			<div className="mb-6">
				<Suspense>
					<EventsFilters />
				</Suspense>
			</div>
			<EventsList category={category} month={month} page={page} />
		</div>
	);
}
