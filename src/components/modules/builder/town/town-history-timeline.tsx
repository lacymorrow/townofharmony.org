"use client";

import { LightboxImage } from "@/components/ui/lightbox-image";
import { historyArticles as staticHistory } from "@/data/town/history";
import type { TownHistoryArticle } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";
import { getMapUrl } from "@/lib/map-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface TownHistoryTimelineProps {
  type?: "period" | "landmark" | "all";
}

const HistoryCard = ({ article }: { article: TownHistoryArticle }) => (
  <div className="bg-white rounded-xl border border-stone shadow-sm overflow-hidden">
    <div className="flex flex-col sm:flex-row">
      {article.image && (
        <div className="sm:w-2/5 lg:w-[280px] shrink-0">
          <LightboxImage
            src={article.image}
            alt={article.title}
            wrapperClassName="w-full h-52 sm:h-full sm:min-h-[200px]"
            className="w-full h-full object-cover"
            width={800}
            height={600}
          />
        </div>
      )}

      <div className="p-5 sm:p-6 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {article.era && (
            <span className="bg-sage-dark text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              {article.era}
            </span>
          )}
          {article.year && (
            <span className="bg-wheat/40 text-[#5C4E1A] px-3 py-1 rounded-full text-xs font-semibold">
              {article.year}
            </span>
          )}
          <span className="bg-stone/60 text-[#4A4640] px-2.5 py-0.5 rounded-full text-xs capitalize">
            {article.type}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-[#2D2A24] mb-2 leading-snug">{article.title}</h2>

        <div
          className="text-[#4A4640] mb-4 prose prose-sm max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(article.description || ""),
          }}
        />

        {article.highlights && article.highlights.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {article.highlights.slice(0, 3).map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-[#635E56]">
                <svg
                  className="w-3.5 h-3.5 mt-0.5 text-sage flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        {article.address && (
          <p className="text-sm text-[#635E56] pt-3 border-t border-stone/60">
            <svg
              className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <a
              href={getMapUrl(article.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sage-dark underline underline-offset-2 decoration-stone transition-colors"
            >
              {article.address}
            </a>
          </p>
        )}
      </div>
    </div>
  </div>
);

export const TownHistoryTimeline = ({ type = "all" }: TownHistoryTimelineProps) => {
  const fallback = (() => {
    let filtered = [...staticHistory];
    if (type !== "all") filtered = filtered.filter((a) => a.type === type);
    return filtered;
  })();

  const query = type !== "all" ? { "data.type": type } : undefined;
  const { data: articles, loading } = useBuilderData<TownHistoryArticle>("town-history-article", {
    sort: { priority: -1 },
    limit: 50,
    query,
    fallback,
  });

  if (loading) {
    return (
      <section className="py-12 bg-cream">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone p-6 animate-pulse">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="sm:w-2/5 h-52 bg-stone/20 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-sage/20 rounded-full" />
                      <div className="h-6 w-16 bg-wheat/20 rounded-full" />
                    </div>
                    <div className="h-6 w-3/4 bg-stone/30 rounded" />
                    <div className="h-4 w-full bg-stone/20 rounded" />
                    <div className="h-4 w-5/6 bg-stone/20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  const periods = articles.filter((a) => a.type === "period");
  const landmarks = articles.filter((a) => a.type === "landmark");
  const showSections = type === "all" && periods.length > 0 && landmarks.length > 0;

  return (
    <section className="py-12 bg-cream">
      <div className="container mx-auto px-4">
        {/* --- Mobile layout (< lg): stacked full-width cards --- */}
        <div className="lg:hidden space-y-6">
          {showSections && periods.length > 0 && (
            <h3 className="text-sm font-semibold uppercase tracking-widest text-sage-dark mb-2">
              Historical Periods
            </h3>
          )}
          {(showSections ? periods : articles).map((article) => (
            <HistoryCard key={article.slug} article={article} />
          ))}
          {showSections && landmarks.length > 0 && (
            <>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-sage-dark mt-8 mb-2">
                Landmarks
              </h3>
              {landmarks.map((article) => (
                <HistoryCard key={article.slug} article={article} />
              ))}
            </>
          )}
        </div>

        {/* --- Desktop layout (lg+): centered alternating timeline --- */}
        <div className="hidden lg:block relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-sage/25" />

          {showSections && periods.length > 0 && (
            <div className="relative flex justify-center mb-10">
              <span className="relative z-10 bg-cream px-5 py-1.5 text-sm font-semibold uppercase tracking-widest text-sage-dark">
                Historical Periods
              </span>
            </div>
          )}

          <div className="space-y-14">
            {(showSections ? periods : articles).map((article, index) => {
              const isRight = index % 2 !== 0;
              return (
                <div key={article.slug} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-8 z-10 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-sage-dark border-[3px] border-cream" />
                  </div>

                  {/* Card */}
                  <div
                    className={`w-[calc(50%-2.5rem)] ${isRight ? "ml-auto pl-0" : "mr-auto pr-0"}`}
                  >
                    <HistoryCard article={article} />
                  </div>
                </div>
              );
            })}
          </div>

          {showSections && landmarks.length > 0 && (
            <>
              <div className="relative flex justify-center my-14">
                <span className="relative z-10 bg-cream px-5 py-1.5 text-sm font-semibold uppercase tracking-widest text-sage-dark">
                  Landmarks
                </span>
              </div>

              <div className="space-y-14">
                {landmarks.map((article, index) => {
                  const isRight = index % 2 !== 0;
                  return (
                    <div key={article.slug} className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 top-8 z-10">
                        <div className="w-4 h-4 rounded-full bg-wheat border-[3px] border-cream" />
                      </div>
                      <div
                        className={`w-[calc(50%-2.5rem)] ${
                          isRight ? "ml-auto pl-0" : "mr-auto pr-0"
                        }`}
                      >
                        <HistoryCard article={article} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
