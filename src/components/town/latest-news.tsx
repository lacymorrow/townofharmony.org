import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getNews } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { htmlToPlainText } from "@/lib/html-to-text";

export async function LatestNews() {
	const { docs: articles } = await getNews({ limit: 3 });

	if (articles.length === 0) {
		return null;
	}

	return (
		<div>
			{articles.map((article) => {
				const date = article.publishedAt ? new Date(article.publishedAt) : new Date();
				const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
				const day = date.getDate();

				return (
					<Link
						key={article.id}
						href={`/news/${article.slug}`}
						className="flex gap-5 items-start py-5 border-b border-[#DDD7CC] last:border-b-0 group cursor-pointer"
					>
						{/* Date block */}
						<div className="bg-sage-dark text-white py-2 px-3 rounded-lg text-center flex-shrink-0 min-w-[56px]">
							<div className="text-[11px] uppercase tracking-wider text-[#E8D5A3] font-bold">{month}</div>
							<div className="text-[22px] font-bold leading-tight">{day}</div>
						</div>
						{/* Content */}
						<div className="flex-1">
							<h3 className="font-semibold text-[17px] text-[#2D2A24] mb-1.5 group-hover:text-sage-dark transition-colors">
								{article.title}
							</h3>
							<p className="text-sm text-[#4A4640] leading-relaxed line-clamp-2">
								{htmlToPlainText(article.excerpt) || extractTextFromRichText(article.content as any).substring(0, 150) + "..."}
							</p>
						</div>
					</Link>
				);
			})}

			<div className="pt-6">
				<Link
					href="/news"
					className="inline-flex items-center gap-2 text-sage font-semibold text-[15px] hover:text-sage-dark transition-colors cursor-pointer"
				>
					View All News
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</div>
	);
}
