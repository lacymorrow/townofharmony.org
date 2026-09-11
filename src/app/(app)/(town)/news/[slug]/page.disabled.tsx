import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsBySlug, getNews } from "@/lib/town-data";
import { isFeatureEnabled } from "@/lib/preview-flags";
import { PayloadRichText } from "@/components/town/payload-rich-text";
import { RelatedNews } from "@/components/town/news/related-news";
import { getMediaUrl } from "@/lib/utils/get-media-url";
import { htmlToPlainText } from "@/lib/html-to-text";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	const { docs } = await getNews({ limit: 100 });
	return docs.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const article = await getNewsBySlug(slug);
	if (!article) return { title: "Article Not Found" };
	return {
		title: `${article.title} | Town of Harmony`,
		description: htmlToPlainText(article.excerpt) || `${article.title} — News from the Town of Harmony, NC.`,
	};
}

export default async function NewsArticlePage({ params }: PageProps) {
	if (!(await isFeatureEnabled("news"))) {
		notFound();
	}

	const { slug } = await params;
	const article = await getNewsBySlug(slug);
	if (!article) notFound();

	const featuredImage = getMediaUrl(article.featuredImage);
	const publishedDate = article.publishedAt
		? new Date(article.publishedAt).toLocaleDateString("en-US", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: null;

	return (
		<div className="py-12 bg-cream">
			<div className="container mx-auto px-4 max-w-5xl">
				<div className="mb-6">
					<Link
						href="/news"
						className="inline-flex items-center gap-1 text-sage font-semibold text-sm hover:text-sage-dark transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to News
					</Link>
				</div>

				<div className="grid gap-8 lg:grid-cols-[1fr_280px]">
					<article>
						<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark mb-3">
							{article.title}
						</h1>

						<div className="flex flex-wrap items-center gap-4 text-sm text-[#635E56] mb-6">
							{publishedDate && <span>{publishedDate}</span>}
							{article.author && (
								<span>
									By {typeof article.author === "object"
										? (article.author as any).name || "Staff"
										: article.author}
								</span>
							)}
						</div>

						{article.categories.length > 0 && (
							<div className="flex gap-2 mb-6">
								{article.categories.map((cat) => (
									<span
										key={cat}
										className="bg-stone text-[#4A4640] px-2 py-1 rounded text-xs"
									>
										{cat}
									</span>
								))}
							</div>
						)}

						{featuredImage && (
							<div className="mb-8 overflow-hidden rounded-lg">
								<img
									src={featuredImage}
									alt={article.title}
									className="w-full h-72 object-cover"
								/>
							</div>
						)}

						<PayloadRichText
							content={article.content}
							className="prose prose-sage max-w-none text-[#2D2A24]"
						/>
					</article>

					<aside className="hidden lg:block">
						<RelatedNews
							currentArticleId={article.id}
							categories={article.categories}
						/>
					</aside>
				</div>
			</div>
		</div>
	);
}
