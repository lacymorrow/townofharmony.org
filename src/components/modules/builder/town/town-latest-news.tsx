"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBuilderData } from "@/lib/builder-data";
import { news as staticNews } from "@/data/town/news";
import type { TownNews } from "@/data/town/types";

interface TownLatestNewsProps {
	limit?: number;
}

export const TownLatestNews = ({ limit = 3 }: TownLatestNewsProps) => {
	const { data: allNews } = useBuilderData<TownNews>("town-news", {
		limit: 50,
		fallback: staticNews,
	});

	const articles = [...allNews]
		.filter((a) => a.status === "published")
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, limit);

	if (articles.length === 0) {
		return (
			<section className="py-16 bg-warm-white">
				<div className="container mx-auto px-4">
					<div className="bg-cream rounded-xl p-8 text-center text-[#4A4640]">
						No news articles available at this time.
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-warm-white">
			<div className="container mx-auto px-4">
				<div className="text-center mb-10">
					<h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
						Latest News
					</h2>
					<p className="text-[#635E56] text-base">
						Stay up to date with Harmony
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{articles.map((article) => {
						const date = article.publishedAt
							? new Date(article.publishedAt)
							: new Date();
						const month = date
							.toLocaleDateString("en-US", { month: "short" })
							.toUpperCase();
						const day = date.getDate();
						const year = date.getFullYear();

						return (
							<Link
								key={article.slug}
								href={`/news/${article.slug}`}
								className="group bg-warm-white rounded-xl border border-[#DDD7CC] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
							>
								{/* Date header */}
								<div className="bg-sage-dark text-white px-5 py-3 flex items-center gap-3">
									<div className="text-center">
										<div className="text-xs uppercase tracking-wider text-[#E8D5A3] font-bold">
											{month}
										</div>
										<div className="text-[22px] font-bold leading-tight">
											{day}
										</div>
									</div>
									<div className="text-sm text-white/80">
										{year}
									</div>
								</div>

								{/* Content */}
								<div className="p-5">
									<h3 className="font-semibold text-[17px] text-[#2D2A24] mb-2 group-hover:text-sage-dark transition-colors line-clamp-2">
										{article.title}
									</h3>
									<p className="text-base text-[#4A4640] leading-relaxed line-clamp-3">
										{article.excerpt}
									</p>
								</div>
							</Link>
						);
					})}
				</div>

				<div className="pt-8 text-center">
					<Link
						href="/news"
						className="inline-flex items-center gap-2 text-sage font-semibold text-[15px] hover:text-sage-dark transition-colors cursor-pointer"
					>
						View All News
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	);
};
