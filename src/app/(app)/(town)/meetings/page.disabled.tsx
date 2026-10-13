import type { Metadata } from "next";
import { Suspense } from "react";
import { MeetingsList } from "@/components/town/meetings/meetings-list";
import { MeetingsFilters } from "@/components/town/meetings/meetings-filters";
import { getMeetingFilterOptions } from "@/lib/town-data";

export const metadata: Metadata = {
  title: "Town Meetings & Agendas",
  description:
    "View upcoming Board of Aldermen meetings, agendas, and minutes for the Town of Harmony, NC. Attend public meetings in Harmony, North Carolina.",
};

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, filterOptions] = await Promise.all([searchParams, getMeetingFilterOptions()]);
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

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-24">
            <Suspense>
              <MeetingsFilters
                availableTypes={filterOptions.types}
                availableYears={filterOptions.years}
                availableStatuses={filterOptions.statuses}
              />
            </Suspense>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <MeetingsList type={type} month={month} year={year} status={status} page={page} />
        </main>
      </div>
    </div>
  );
}
