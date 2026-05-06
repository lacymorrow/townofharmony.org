import type { Metadata } from "next";
import { Suspense } from "react";
import { MeetingsList } from "@/components/town/meetings/meetings-list";
import { MeetingsFilters } from "@/components/town/meetings/meetings-filters";

export const metadata: Metadata = {
	title: "Town Meetings | Town of Harmony, NC",
	description:
		"View upcoming and past Board of Aldermen meetings for the Town of Harmony, North Carolina.",
};

export default async function MeetingsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const type = typeof params.type === "string" ? params.type : undefined;
	const month = typeof params.month === "string" ? params.month : undefined;
	const year = typeof params.year === "string" ? params.year : undefined;
	const status = typeof params.status === "string" ? params.status : undefined;
	const page = typeof params.page === "string" ? params.page : "1";

	return (
		<div className="container mx-auto max-w-6xl px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Town Meetings</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					Stay informed about Board of Aldermen and Public Hearing meetings.
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				<aside className="lg:w-64 shrink-0">
					<div className="lg:sticky lg:top-24">
						<Suspense>
							<MeetingsFilters />
						</Suspense>
					</div>
				</aside>
				<main className="flex-1 min-w-0">
					<MeetingsList type={type} month={month} year={year} status={status} page={page} />
				</main>
			</div>
		</div>
	);
}
