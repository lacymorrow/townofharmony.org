"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBuilderData } from "@/lib/builder-data";
import { htmlToPlainText } from "@/lib/html-to-text";
import { news as staticNews } from "@/data/town/news";
import type { TownNews } from "@/data/town/types";

interface TownLatestNewsProps {
  limit?: number;
}

export const TownLatestNews = ({ limit = 3 }: TownLatestNewsProps) => {
  const { data: allNews, loading } = useBuilderData<TownNews>("town-news", {
    limit: 50,
    fallback: staticNews,
  });

  const articles = [...allNews]
    .filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  // While Builder.io data is loading, reserve the section's vertical space with
  // a skeleton so the page doesn't shift when articles arrive (or stay hidden).
  if (loading) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-stone/40" />
            <div className="mx-auto h-4 w-64 animate-pulse rounded bg-stone/20" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-[#DDD7CC] bg-warm-white"
              >
                <div className="h-14 animate-pulse bg-sage-dark/30" />
                <div className="space-y-2 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-stone/40" />
                  <div className="h-4 w-full animate-pulse rounded bg-stone/20" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-stone/20" />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 text-center">
            <div className="mx-auto h-5 w-32 animate-pulse rounded bg-stone/20" />
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-warm-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-serif text-[32px] font-bold text-sage-dark">Latest News</h2>
          <p className="text-base text-[#635E56]">Stay up to date with Harmony</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const date = article.publishedAt ? new Date(article.publishedAt) : new Date();
            const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
            const day = date.getDate();
            const year = date.getFullYear();

            return (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group cursor-pointer overflow-hidden rounded-xl border border-[#DDD7CC] bg-warm-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Date header */}
                <div className="flex items-center gap-3 bg-sage-dark px-5 py-3 text-white">
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#E8D5A3]">
                      {month}
                    </div>
                    <div className="text-[22px] font-bold leading-tight">{day}</div>
                  </div>
                  <div className="text-sm text-white/80">{year}</div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="mb-2 line-clamp-2 text-[17px] font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                    {article.title}
                  </h3>
                  <p className="line-clamp-3 text-base leading-relaxed text-[#4A4640]">
                    {htmlToPlainText(article.excerpt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-8 text-center">
          <Link
            href="/news"
            className="inline-flex cursor-pointer items-center gap-2 text-[15px] font-semibold text-sage transition-colors hover:text-sage-dark"
          >
            View All News
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
