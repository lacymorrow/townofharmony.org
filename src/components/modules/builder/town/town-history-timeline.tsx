"use client";

import { useBuilderData } from "@/lib/builder-data";
import { historyArticles as staticHistory } from "@/data/town/history";
import type { TownHistoryArticle } from "@/data/town/types";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface TownHistoryTimelineProps {
	type?: "period" | "landmark" | "all";
}

export const TownHistoryTimeline = ({
	type = "all",
}: TownHistoryTimelineProps) => {
	const fallback = (() => {
		let filtered = [...staticHistory];
		if (type !== "all") filtered = filtered.filter((a) => a.type === type);
		return filtered;
	})();

	const query = type !== "all" ? { "data.type": type } : undefined;
	const { data: articles, loading } = useBuilderData<TownHistoryArticle>(
		"town-history-article",
		{ sort: { priority: -1 }, limit: 50, query, fallback },
	);

	if (loading) {
		return (
			<section className="py-12 bg-cream">
				<div className="container mx-auto px-4">
					<div className="space-y-12">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="bg-white rounded-lg border border-stone p-5 animate-pulse">
								<div className="h-48 bg-stone/20 rounded mb-4" />
								<div className="h-5 w-48 bg-stone/40 rounded mb-2" />
								<div className="h-3 w-full bg-stone/20 rounded" />
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (articles.length === 0) {
		return null;
	}

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				{/* Timeline */}
				<div className="relative">
					{/* Vertical Line */}
					<div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-sage/30" />

					<div className="space-y-12">
						{articles.map((article, index) => {
							const isEven = index % 2 === 0;

							return (
								<div
									key={article.slug}
									className="relative flex flex-col md:flex-row items-start"
								>
									{/* Timeline Dot */}
									<div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-sage-dark border-[3px] border-cream z-10" />

									{/* Content Card - alternating sides on desktop */}
									<div
										className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
											isEven
												? "md:mr-auto md:pr-8"
												: "md:ml-auto md:pl-8"
										}`}
									>
										<div className="block bg-white rounded-lg border border-stone overflow-hidden">
											{/* Image */}
											{article.image && (
												<div className="h-48 overflow-hidden">
													<img
														src={article.image}
														alt={article.title}
														className="w-full h-full object-cover"
														width={800}
														height={600}
													/>
												</div>
											)}

											<div className="p-5">
												{/* Era / Year Badge */}
												<div className="flex items-center gap-2 mb-2">
													{article.era && (
														<span className="bg-sage-dark text-white px-2.5 py-0.5 rounded-full text-sm font-medium">
															{article.era}
														</span>
													)}
													{article.year && (
														<span className="bg-wheat/30 text-[#5C4E1A] px-2.5 py-0.5 rounded-full text-sm font-medium">
															{article.year}
														</span>
													)}
													<span className="bg-stone text-[#4A4640] px-2 py-0.5 rounded-full text-xs capitalize">
														{article.type}
													</span>
												</div>

												<h2 className="text-lg font-semibold text-[#2D2A24] mb-2">
													{article.title}
												</h2>

												<div
													className="text-base text-[#4A4640] mb-3 prose prose-sm max-w-none"
													dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.description || "") }}
												/>

												{/* Highlights */}
												{article.highlights &&
													article.highlights.length > 0 && (
														<ul className="space-y-1">
															{article.highlights
																.slice(0, 3)
																.map((highlight, idx) => (
																	<li
																		key={idx}
																		className="flex items-start gap-1.5 text-sm text-[#635E56]"
																	>
																		<svg
																			className="w-3 h-3 mt-0.5 text-sage flex-shrink-0"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path
																				fillRule="evenodd"
																				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																				clipRule="evenodd"
																			/>
																		</svg>
																		<span>{highlight}</span>
																	</li>
																))}
														</ul>
													)}

												{/* Address for landmarks */}
												{article.address && (
													<p className="text-sm text-[#635E56] mt-3 pt-3 border-t border-stone">
														{article.address}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
};
