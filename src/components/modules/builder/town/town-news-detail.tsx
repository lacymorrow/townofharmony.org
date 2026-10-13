"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { news as staticNews } from "@/data/town/news";
import type { TownNews } from "@/data/town/types";
import { resolveBuilderRef } from "@/data/town/types";
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
        <div className="container mx-auto max-w-3xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-stone/40" />
            <div className="h-8 w-3/4 rounded bg-stone/40" />
            <div className="h-64 rounded-xl bg-stone/20" />
            <div className="h-4 w-full rounded bg-stone/20" />
            <div className="h-4 w-full rounded bg-stone/20" />
          </div>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-sage-dark">Article not found</h1>
          <p className="mb-8 text-sage-dark/70">
            The news article you are looking for could not be found.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
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
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back link */}
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sage transition-colors hover:text-sage-dark"
        >
          &larr; Back to News
        </Link>

        {/* Categories */}
        {safeArray(article.categories).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {safeArray(article.categories).map((category) => (
              <span
                key={category}
                className="inline-block rounded-full bg-wheat/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-dark"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 font-serif text-3xl font-bold leading-tight text-sage-dark md:text-4xl">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-stone pb-6 text-base text-sage-dark/60">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          {(() => {
            const authorName = resolveBuilderRef(article.author);
            return authorName ? (
              <>
                <span className="text-stone">&middot;</span>
                <span>By {authorName}</span>
              </>
            ) : null;
          })()}
        </div>

        {/* Featured image */}
        {article.featuredImage && (
          <LightboxImage
            src={article.featuredImage}
            alt={article.title}
            wrapperClassName="mb-8 rounded-xl w-full"
            className="h-auto max-h-[400px] w-full object-cover"
            width={800}
            height={600}
          />
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none leading-relaxed text-sage-dark/85 prose-headings:font-serif prose-headings:text-sage-dark prose-a:text-sage prose-a:hover:text-sage-dark prose-strong:text-sage-dark"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || "") }}
        />

        {/* Tags */}
        {safeArray(article.tags).length > 0 && (
          <div className="mt-10 border-t border-stone pt-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-sage-dark/50">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {safeArray(article.tags).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-md border border-stone bg-cream px-3 py-1 text-xs text-sage-dark/70"
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
      <p className="mb-8 text-sage-dark/70">
        Unable to load this article. Please try refreshing the page.
      </p>
      <Link
        href="/news"
        className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
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
