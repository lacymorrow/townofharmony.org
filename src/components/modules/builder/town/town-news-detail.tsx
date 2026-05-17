"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { news as staticNews } from "@/data/town/news";
import type { TownNews } from "@/data/town/types";
import { useBuilderEntry } from "@/lib/builder-data";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface TownNewsDetailProps {
  slug?: string;
}

const safeArray = (arr: unknown): string[] => (Array.isArray(arr) ? arr : []);

const TownNewsDetailInner = ({ slug: slugProp }: TownNewsDetailProps) => {
  const pathname = usePathname();
  const rawSlug = slugProp || pathname?.split("/").filter(Boolean).pop() || "";
  const slug = (() => {
    try {
      return decodeURIComponent(rawSlug)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
    } catch {
      return rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    }
  })();

  const staticFallback = staticNews.find((n) => n.slug === slug) ?? null;
  const { data: article, loading } = useBuilderEntry<TownNews>(
    "town-news",
    { "data.slug": slug },
    { fallback: staticFallback }
  );

  if (loading) {
    return (
      <section className="bg-warm-white py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-stone/40 rounded" />
            <div className="h-8 w-3/4 bg-stone/40 rounded" />
            <div className="h-64 bg-stone/20 rounded-xl" />
            <div className="h-4 w-full bg-stone/20 rounded" />
            <div className="h-4 w-full bg-stone/20 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">Article not found</h1>
          <p className="text-sage-dark/70 mb-8">
            The news article you are looking for could not be found.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
          >
            &larr; Back to News
          </Link>
        </div>
      </section>
    );
  }

  const publishedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="bg-warm-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sage hover:text-sage-dark text-sm font-medium mb-8 transition-colors"
        >
          &larr; Back to News
        </Link>

        {/* Categories */}
        {safeArray(article.categories).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {safeArray(article.categories).map((category) => (
              <span
                key={category}
                className="inline-block bg-wheat/30 text-sage-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-base text-sage-dark/60 mb-8 border-b border-stone pb-6">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          {article.author && (
            <>
              <span className="text-stone">&middot;</span>
              <span>By {article.author}</span>
            </>
          )}
        </div>

        {/* Featured image */}
        {article.featuredImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-auto object-cover max-h-[400px]"
              width={800}
              height={600}
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-sage-dark/85 leading-relaxed
						prose-headings:text-sage-dark prose-headings:font-serif
						prose-a:text-sage prose-a:hover:text-sage-dark
						prose-strong:text-sage-dark"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || "") }}
        />

        {/* Tags */}
        {safeArray(article.tags).length > 0 && (
          <div className="mt-10 pt-6 border-t border-stone">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-sage-dark/50 mb-3">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {safeArray(article.tags).map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-cream text-sage-dark/70 border border-stone px-3 py-1 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const NewsDetailErrorFallback = () => (
  <section className="bg-warm-white py-16">
    <div className="container mx-auto px-4 text-center">
      <p className="text-sage-dark/70 mb-8">
        Unable to load this article. Please try refreshing the page.
      </p>
      <Link
        href="/news"
        className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
      >
        &larr; Back to News
      </Link>
    </div>
  </section>
);

export const TownNewsDetail = (props: TownNewsDetailProps) => (
  <ErrorBoundary fallback={NewsDetailErrorFallback}>
    <TownNewsDetailInner {...props} />
  </ErrorBoundary>
);
