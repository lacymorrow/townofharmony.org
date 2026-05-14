import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventsList } from "@/components/town/events/events-list";
import { EventsFilters } from "@/components/town/events/events-filters";
import { getEventFilterOptions } from "@/lib/town-data";
import { isFeatureEnabled } from "@/lib/preview-flags";

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
	if (!await isFeatureEnabled("events")) {
		notFound();
	}
	const [params, filterOptions] = await Promise.all([
		searchParams,
		getEventFilterOptions(),
	]);
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

			<div className="flex flex-col lg:flex-row gap-8">
				<aside className="lg:w-64 shrink-0">
					<div className="lg:sticky lg:top-24">
						<Suspense>
							<EventsFilters
								availableCategories={filterOptions.categories}
								availableMonths={filterOptions.months}
							/>
						</Suspense>
					</div>
				</aside>
				<main className="flex-1 min-w-0">
					<EventsList category={category} month={month} page={page} />
				</main>
			</div>
		</div>
	);
}
