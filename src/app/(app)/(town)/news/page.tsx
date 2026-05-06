import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsGrid } from "@/components/town/news/news-grid";
import { NewsFilters } from "@/components/town/news/news-filters";

export const metadata: Metadata = {
	title: "News | Town of Harmony, NC",
	description:
		"Read the latest news and announcements from the Town of Harmony, North Carolina.",
};

export default async function NewsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	if (process.env.NEXT_PUBLIC_FEATURE_NEWS_ENABLED !== "true") {
		notFound();
	}
	const params = await searchParams;
	const page = typeof params.page === "string" ? Number(params.page) : 1;
	const category = typeof params.category === "string" ? params.category : "";
	const search = typeof params.search === "string" ? params.search : "";

	return (
		<div className="container mx-auto max-w-6xl px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">News</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					The latest news and announcements from the Town of Harmony.
				</p>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_280px]">
				<div>
					<NewsGrid page={page} category={category || undefined} search={search || undefined} />
				</div>
				<aside>
					<NewsFilters currentCategory={category} currentSearch={search} />
				</aside>
			</div>
		</div>
	);
}
