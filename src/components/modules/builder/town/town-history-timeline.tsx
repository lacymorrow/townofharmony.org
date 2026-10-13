"use client";

import { AddressCopyButton } from "@/components/town/address-copy-button";
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
  <div className="overflow-hidden rounded-xl border border-stone bg-white shadow-sm">
    <div className="flex flex-col sm:flex-row">
      {article.image && (
        <div className="shrink-0 sm:w-2/5 lg:w-[280px]">
          <LightboxImage
            src={article.image}
            alt={article.title}
            wrapperClassName="w-full h-52 sm:h-full sm:min-h-[200px]"
            className="h-full w-full object-cover"
            width={800}
            height={600}
          />
        </div>
      )}

      <div className="min-w-0 flex-1 p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.era && (
            <span className="rounded-full bg-sage-dark px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {article.era}
            </span>
          )}
          {article.year && (
            <span className="rounded-full bg-wheat/40 px-3 py-1 text-xs font-semibold text-[#5C4E1A]">
              {article.year}
            </span>
          )}
          {article.type && (
            <span className="rounded-full bg-stone/60 px-2.5 py-0.5 text-xs capitalize text-[#4A4640]">
              {article.type}
            </span>
          )}
        </div>

        <h2 className="mb-2 text-xl font-semibold leading-snug text-[#2D2A24]">{article.title}</h2>

        <div
          className="prose prose-sm mb-4 max-w-none leading-relaxed text-[#4A4640]"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(article.description || ""),
          }}
        />

        {article.highlights && article.highlights.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {article.highlights.slice(0, 3).map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-[#635E56]">
                <svg
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-sage"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
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
          <p className="border-t border-stone/60 pt-3 text-sm text-[#635E56]">
            <svg
              className="-mt-0.5 mr-1 inline-block h-3.5 w-3.5 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
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
              className="underline decoration-stone underline-offset-2 transition-colors hover:text-sage-dark"
            >
              {article.address}
            </a>
            <AddressCopyButton
              address={article.address}
              label={article.title}
              tone="default"
              className="ml-1 h-6 w-6 align-middle"
              iconClassName="h-3.5 w-3.5"
            />
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
      <section
        className="overflow-x-hidden bg-cream py-12"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-stone bg-white p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="h-52 rounded-lg bg-stone/20 sm:w-2/5" />
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 rounded-full bg-sage/20" />
                      <div className="h-6 w-16 rounded-full bg-wheat/20" />
                    </div>
                    <div className="h-6 w-3/4 rounded bg-stone/30" />
                    <div className="h-4 w-full rounded bg-stone/20" />
                    <div className="h-4 w-5/6 rounded bg-stone/20" />
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
    <section
      className="overflow-x-hidden bg-cream py-12"
      style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
    >
      {/* --- Mobile layout (< lg): stacked full-width cards --- */}
      <div className="mx-auto max-w-2xl space-y-6 px-4 lg:hidden">
        {showSections && periods.length > 0 && (
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-sage-dark">
            Historical Periods
          </h3>
        )}
        {(showSections ? periods : articles).map((article) => (
          <HistoryCard key={article.slug} article={article} />
        ))}
        {showSections && landmarks.length > 0 && (
          <>
            <h3 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-widest text-sage-dark">
              Landmarks
            </h3>
            {landmarks.map((article) => (
              <HistoryCard key={article.slug} article={article} />
            ))}
          </>
        )}
      </div>

      {/* --- Desktop layout (lg+): centered alternating timeline --- */}
      <div className="hidden lg:block">
        <div className="relative mx-auto max-w-7xl px-8">
          {/* Vertical line */}
          <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-px bg-sage/25" />

          {showSections && periods.length > 0 && (
            <div className="relative mb-10 flex justify-center">
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
                  <div className="absolute left-1/2 top-8 z-10 -translate-x-1/2">
                    <div className="h-4 w-4 rounded-full border-[3px] border-cream bg-sage-dark" />
                  </div>

                  {/* Card */}
                  <div className={`w-[calc(50%-2.5rem)] ${isRight ? "ml-auto" : "mr-auto"}`}>
                    <HistoryCard article={article} />
                  </div>
                </div>
              );
            })}
          </div>

          {showSections && landmarks.length > 0 && (
            <>
              <div className="relative my-14 flex justify-center">
                <span className="relative z-10 bg-cream px-5 py-1.5 text-sm font-semibold uppercase tracking-widest text-sage-dark">
                  Landmarks
                </span>
              </div>

              <div className="space-y-14">
                {landmarks.map((article, index) => {
                  const isRight = index % 2 !== 0;
                  return (
                    <div key={article.slug} className="relative">
                      <div className="absolute left-1/2 top-8 z-10 -translate-x-1/2">
                        <div className="h-4 w-4 rounded-full border-[3px] border-cream bg-wheat" />
                      </div>
                      <div className={`w-[calc(50%-2.5rem)] ${isRight ? "ml-auto" : "mr-auto"}`}>
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
