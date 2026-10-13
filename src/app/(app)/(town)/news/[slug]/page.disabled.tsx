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
    description:
      htmlToPlainText(article.excerpt) || `${article.title} — News from the Town of Harmony, NC.`,
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
    <div className="bg-cream py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sage transition-colors hover:text-sage-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <article>
            <h1 className="mb-3 font-serif text-3xl font-bold text-sage-dark md:text-4xl">
              {article.title}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[#635E56]">
              {publishedDate && <span>{publishedDate}</span>}
              {article.author && (
                <span>
                  By{" "}
                  {typeof article.author === "object"
                    ? (article.author as any).name || "Staff"
                    : article.author}
                </span>
              )}
            </div>

            {article.categories.length > 0 && (
              <div className="mb-6 flex gap-2">
                {article.categories.map((cat) => (
                  <span key={cat} className="rounded bg-stone px-2 py-1 text-xs text-[#4A4640]">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {featuredImage && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <img src={featuredImage} alt={article.title} className="h-72 w-full object-cover" />
              </div>
            )}

            <PayloadRichText
              content={article.content}
              className="prose-sage prose max-w-none text-[#2D2A24]"
            />
          </article>

          <aside className="hidden lg:block">
            <RelatedNews currentArticleId={article.id} categories={article.categories} />
          </aside>
        </div>
      </div>
    </div>
  );
}
