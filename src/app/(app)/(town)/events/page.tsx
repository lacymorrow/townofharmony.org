import { siteConfig } from "@/config/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventsList } from "@/components/town/events/events-list";
import { EventsFilters } from "@/components/town/events/events-filters";
import { getEventFilterOptions } from "@/lib/town-data";
import { getBuilderPageContent } from "@/lib/builder-data-server";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { isFeatureEnabled } from "@/lib/preview-flags";

export const metadata: Metadata = {
  title: "Community Events & Activities",
  description:
    "Discover upcoming community events, festivals, and activities in Harmony, NC. Find things to do in the Town of Harmony, North Carolina.",
  alternates: {
    canonical: `${siteConfig.url}/events`,
  },
  openGraph: {
    title: "Community Events — Town of Harmony, NC",
    description:
      "Discover upcoming community events, festivals, and activities in Harmony, NC. Find things to do in the Town of Harmony, North Carolina.",
    url: `${siteConfig.url}/events`,
  },
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isFeatureEnabled("events"))) {
    notFound();
  }

  const builderContent = await getBuilderPageContent("/events");
  if (builderContent) {
    return <RenderBuilderContent content={builderContent} model="page" />;
  }

  const [params, filterOptions] = await Promise.all([searchParams, getEventFilterOptions()]);
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

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-24">
            <Suspense>
              <EventsFilters
                availableCategories={filterOptions.categories}
                availableMonths={filterOptions.months}
              />
            </Suspense>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <EventsList category={category} month={month} page={page} />
        </main>
      </div>
    </div>
  );
}
