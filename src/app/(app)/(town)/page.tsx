import { Suspense } from "react";
import type { Metadata } from "next";
import { CommunitySpotlight } from "@/components/town/community-spotlight";
import { HeroSection } from "@/components/town/hero-section";
import { LatestNews } from "@/components/town/latest-news";
import { QuickLinks } from "@/components/town/quick-links";
import { UpcomingEvents } from "@/components/town/upcoming-events";
import { routeMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site-config";
import { getNews } from "@/lib/town-data";

export const metadata: Metadata = {
	title: routeMetadata.home.title,
	description: routeMetadata.home.description,
	alternates: {
		canonical: siteConfig.url,
	},
};

// Builder.io homepage lookup intentionally disabled until Builder.io content
// is reviewed and approved by the Town Clerk. The static homepage below uses
// only data verified against townofharmony.org.

export default async function HomePage() {
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
