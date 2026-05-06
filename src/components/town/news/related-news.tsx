import { Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNews } from "@/lib/town-data";

interface RelatedNewsProps {
	currentArticleId: number;
	categories?: string[] | null;
}

export async function RelatedNews({ currentArticleId, categories }: RelatedNewsProps) {
	// Fetch recent published news; if a category is available, filter by the first one
	const result = await getNews({
		limit: 6,
		category: categories?.[0] || undefined,
	});

	// Filter out the current article from results
	const related = result.docs.filter((article) => article.id !== currentArticleId).slice(0, 5);

	if (related.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Related Articles</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{related.map((article) => (
						<div key={article.id} className="pb-4 border-b last:border-0">
							<Link
								href={`/news/${article.slug}`}
								className="block hover:text-sage-dark transition-colors"
							>
								<h4 className="font-medium mb-1 line-clamp-2">{article.title}</h4>
								{article.publishedAt && (
									<div className="flex items-center gap-1 text-sm text-[#635E56]">
										<Calendar className="h-3 w-3" />
										{new Date(article.publishedAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</div>
								)}
							</Link>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
