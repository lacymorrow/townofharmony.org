import { ArrowRight, Calendar, Eye, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNews } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { getMediaUrl } from "@/lib/utils/get-media-url";

const ITEMS_PER_PAGE = 9;

interface NewsGridProps {
	page: number;
	category?: string;
	search?: string;
}

export async function NewsGrid({ page, category, search }: NewsGridProps) {
	const result = await getNews({
		page,
		limit: ITEMS_PER_PAGE,
		category: category || undefined,
		search: search || undefined,
	});

	const articles = result.docs;
	const total = result.totalDocs;

	if (articles.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<p className="text-[#635E56]">No articles found matching your criteria.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="mb-4 flex items-center justify-between">
				<p className="text-sm text-[#4A4640]">
					Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} of{" "}
					{total} articles
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{articles.map((article) => {
					const featuredImage = getMediaUrl(article.featuredImage);

					const excerptText =
						(article.excerpt as string) ||
						extractTextFromRichText(article.content as any)?.substring(0, 150) + "...";

					return (
						<Card key={article.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
							{featuredImage && (
								<div className="h-48 overflow-hidden rounded-t-lg">
									<img
										src={featuredImage}
										alt={article.title}
										className="w-full h-full object-cover"
									/>
								</div>
							)}

							<CardHeader className="flex-1">
								<CardTitle className="text-lg line-clamp-2">
									<Link
										href={`/news/${article.slug}`}
										className="hover:text-sage-dark transition-colors"
									>
										{article.title}
									</Link>
								</CardTitle>

								<div className="flex items-center gap-4 text-sm text-[#635E56] mt-2">
									{article.publishedAt && (
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{new Date(article.publishedAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</div>
									)}

									{article.author && (
										<div className="flex items-center gap-1">
											<User className="h-3 w-3" />
											{typeof article.author === "object" ? (article.author as any).name || "Staff" : String(article.author)}
										</div>
									)}

									{(article.viewCount as number) > 0 && (
										<div className="flex items-center gap-1">
											<Eye className="h-3 w-3" />
											{article.viewCount as number}
										</div>
									)}
								</div>
							</CardHeader>

							<CardContent>
								<p className="text-base text-[#4A4640] line-clamp-3 mb-4">
									{excerptText}
								</p>

								{article.categories && (article.categories as string[]).length > 0 && (
									<div className="flex gap-1 mb-3">
										{(article.categories as string[]).slice(0, 2).map((cat) => (
											<span key={cat} className="bg-stone text-[#4A4640] px-2 py-1 rounded text-xs">
												{cat}
											</span>
										))}
									</div>
								)}

								<Link
									href={`/news/${article.slug}`}
									className="inline-flex items-center gap-1 text-sage font-semibold hover:text-sage-dark text-sm font-medium"
									aria-label={`Read more about ${article.title}`}
								>
									Read more
									<ArrowRight className="h-3 w-3" />
								</Link>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</>
	);
}
