"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { news as staticNews } from "@/data/town/news";
import type { TownNews } from "@/data/town/types";
import { useBuilderPaginatedData } from "@/lib/builder-data";
import { sanitizeHtml } from "@/lib/sanitize-html";

/**
 * Well-known categories shown first in the filter bar, in this order.
 * Categories entered in Builder.io that aren't listed here still appear,
 * sorted alphabetically after these — editors can add new categories
 * without a code change.
 */
const PREFERRED_CATEGORY_ORDER = [
  "announcements",
  "public-safety",
  "community",
  "government",
  "events",
  "public-works",
] as const;

interface TownNewsGridProps {
  itemsPerPage?: number;
  showFilters?: boolean;
  showSearch?: boolean;
}

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-stone bg-white px-3 py-2 text-sm font-medium text-sage-dark transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            p === page
              ? "bg-sage-dark text-white"
              : "border border-stone bg-white text-sage-dark hover:bg-cream"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-stone bg-white px-3 py-2 text-sm font-medium text-sage-dark transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

export const TownNewsGrid = ({
  itemsPerPage = 9,
  showFilters = true,
  showSearch = true,
}: TownNewsGridProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams?.get("page")) || 1;
  const category = searchParams?.get("category") || undefined;
  const search = searchParams?.get("search") || undefined;

  const {
    docs,
    allData: allNews,
    totalPages,
  } = useBuilderPaginatedData<TownNews>("town-news", {
    page,
    limit: itemsPerPage,
    fallbackData: staticNews,
    search,
    searchFields: ["title", "excerpt", "content"],
    filter: category
      ? (item) => Array.isArray(item.categories) && item.categories.includes(category)
      : undefined,
    clientSort: (a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return (Number.isNaN(db) ? 0 : db) - (Number.isNaN(da) ? 0 : da);
    },
  });

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    for (const article of allNews) {
      if (Array.isArray(article.categories)) {
        for (const cat of article.categories) {
          const trimmed = cat?.trim();
          if (trimmed) catSet.add(trimmed);
        }
      }
    }
    const preferred = PREFERRED_CATEGORY_ORDER.filter((cat) => catSet.has(cat));
    const preferredSet = new Set<string>(PREFERRED_CATEGORY_ORDER);
    const extras = [...catSet]
      .filter((cat) => !preferredSet.has(cat))
      .sort((a, b) => a.localeCompare(b));
    return [...preferred, ...extras];
  }, [allNews]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    // Reset to page 1 when filters change
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="mb-8 space-y-4">
            {showSearch && (
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Search news..."
                  defaultValue={search}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateParams({
                        search: (e.target as HTMLInputElement).value || undefined,
                      });
                    }
                  }}
                  className="w-full rounded-lg border border-stone bg-white px-4 py-2.5 text-[#2D2A24] placeholder:text-[#635E56] focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParams({ category: undefined })}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    !category
                      ? "bg-sage-dark text-white"
                      : "border border-stone bg-white text-[#4A4640] hover:bg-stone"
                  }`}
                >
                  All
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateParams({ category: cat })}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      category === cat
                        ? "bg-sage-dark text-white"
                        : "border border-stone bg-white text-[#4A4640] hover:bg-stone"
                    }`}
                  >
                    {cat.replace("-", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* News Grid */}
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group overflow-hidden rounded-lg border border-stone bg-white transition-shadow hover:shadow-lg"
              >
                {article.featuredImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      width={800}
                      height={600}
                    />
                  </div>
                )}
                <div className="p-5">
                  {Array.isArray(article.categories) && article.categories.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {article.categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-stone px-2 py-0.5 text-xs capitalize text-sage-dark"
                        >
                          {cat.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                    {article.title}
                  </h2>
                  <div
                    className="prose prose-sm mb-3 line-clamp-3 max-w-none text-base text-[#4A4640]"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(article.excerpt || "", { stripLinks: true }),
                    }}
                  />
                  <time className="text-sm text-[#635E56]">
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-[#635E56]">No news articles found.</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => updateParams({ page: String(p) })}
        />
      </div>
    </section>
  );
};
