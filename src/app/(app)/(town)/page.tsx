import { Suspense } from "react";
import type { Metadata } from "next";
import { type BuilderContent } from "@builder.io/sdk";
import { CommunitySpotlight } from "@/components/town/community-spotlight";
import { HeroSection } from "@/components/town/hero-section";
import { LatestNews } from "@/components/town/latest-news";
import { QuickLinks } from "@/components/town/quick-links";
import { UpcomingEvents } from "@/components/town/upcoming-events";
import { routeMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import "@/styles/builder-io.css";
import { getNews } from "@/lib/town-data";

export const metadata: Metadata = {
	title: routeMetadata.home.title,
	description: routeMetadata.home.description,
	alternates: {
		canonical: siteConfig.url,
	},
};

interface HomePageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getBuilderHomepage(): Promise<BuilderContent | null> {
	if (!env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED || !env.NEXT_PUBLIC_BUILDER_API_KEY) {
		return null;
	}
	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/page");
		url.searchParams.set("apiKey", env.NEXT_PUBLIC_BUILDER_API_KEY);
		url.searchParams.set("userAttributes.urlPath", "/");
		url.searchParams.set("limit", "1");
		url.searchParams.set("noCache", "true");
		const res = await fetch(url.toString(), { next: { revalidate: 0 } });
		if (!res.ok) return null;
		const data = (await res.json()) as { results?: BuilderContent[] };
		const page = data?.results?.[0];
		if (!page) return null;
		const pageUrl = page.data?.url as string | undefined;
		if (pageUrl && pageUrl !== "/") return null;
		return page;
	} catch {
		return null;
	}
}

export default async function HomePage({ searchParams }: HomePageProps) {
	const sp = await searchParams;
	const isPreview = "builder.preview" in sp;
	const content = await getBuilderHomepage();

	if (content || isPreview) {
		return <RenderBuilderContent content={content ?? null} model="page" />;
	}

	const { docs: newsArticles } = await getNews({ limit: 1 });
	const hasNews = newsArticles.length > 0;

	return (
		<>
			<HeroSection />
			<QuickLinks />

			<section className="py-16 bg-warm-white">
				<div className="container mx-auto px-4">
					<div className={`grid grid-cols-1 ${hasNews ? "lg:grid-cols-[5fr_3fr]" : ""} gap-12`}>
						{hasNews && (
							<div>
								<h2 className="text-2xl font-serif font-bold text-sage-dark mb-6 pb-3 border-b-2 border-wheat">
									Latest News
								</h2>
								<Suspense fallback={<div className="text-[#635E56]">Loading news...</div>}>
									<LatestNews />
								</Suspense>
							</div>
						)}

						<div>
							<h2 className="text-2xl font-serif font-bold text-sage-dark mb-6 pb-3 border-b-2 border-wheat">
								Upcoming Events
							</h2>
							<Suspense fallback={<div className="text-[#635E56]">Loading events...</div>}>
								<UpcomingEvents />
							</Suspense>
						</div>
					</div>
				</div>
			</section>

			<CommunitySpotlight />
		</>
	);
}
