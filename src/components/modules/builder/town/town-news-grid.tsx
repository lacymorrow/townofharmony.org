"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { news as staticNews } from "@/data/town/news";
import type { TownNews } from "@/data/town/types";
import { useBuilderPaginatedData } from "@/lib/builder-data";
import { sanitizeHtml } from "@/lib/sanitize-html";

const NEWS_CATEGORIES = [
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
    <nav className="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
        className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

  const { docs, allData: allNews, totalPages } = useBuilderPaginatedData<TownNews>("town-news", {
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
          catSet.add(cat);
        }
      }
    }
    return NEWS_CATEGORIES.filter((cat) => catSet.has(cat));
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
    <section className="py-12 bg-cream">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-stone bg-white text-[#2D2A24] placeholder:text-[#635E56] focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParams({ category: undefined })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !category
                      ? "bg-sage-dark text-white"
                      : "bg-white border border-stone text-[#4A4640] hover:bg-stone"
                  }`}
                >
                  All
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateParams({ category: cat })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      category === cat
                        ? "bg-sage-dark text-white"
                        : "bg-white border border-stone text-[#4A4640] hover:bg-stone"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group bg-white rounded-lg border border-stone overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.featuredImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      width={800}
                      height={600}
                    />
                  </div>
                )}
                <div className="p-5">
                  {Array.isArray(article.categories) && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {article.categories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-stone text-sage-dark px-2 py-0.5 rounded-full text-xs capitalize"
                        >
                          {cat.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-lg font-semibold text-[#2D2A24] mb-2 group-hover:text-sage-dark transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <div
                    className="text-base text-[#4A4640] mb-3 line-clamp-3 prose prose-sm max-w-none"
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
          <div className="text-center py-12">
            <p className="text-[#635E56] text-lg">No news articles found.</p>
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
