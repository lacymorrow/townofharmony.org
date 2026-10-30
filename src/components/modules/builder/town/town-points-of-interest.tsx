"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataLink } from "@/components/primitives/data-link";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { useBuilderData } from "@/lib/builder-data";
import { getMapUrl } from "@/lib/map-utils";
import { htmlToPlainText } from "@/lib/html-to-text";
import { isSafeUrl } from "@/lib/utils";
import { pointsOfInterest as staticPOIs } from "@/data/town/points-of-interest";
import type { TownPointOfInterest } from "@/data/town/types";

interface TownPointsOfInterestProps {
  showCategoryFilter?: boolean;
}

/**
 * Well-known categories shown first in the filter bar, in this order.
 * Categories entered in Builder.io that aren't listed here still appear,
 * sorted alphabetically after these — editors can add new categories
 * without a code change.
 */
const PREFERRED_CATEGORY_ORDER = [
  "Parks",
  "Government",
  "Historic Sites",
  "Memorials",
  "Education",
  "Recreation",
] as const;

export const TownPointsOfInterest = ({ showCategoryFilter = true }: TownPointsOfInterestProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams?.get("category") || undefined;

  const { data: allPOIs, loading } = useBuilderData<TownPointOfInterest>("town-point-of-interest", {
    sort: { priority: -1 },
    limit: 50,
    fallback: staticPOIs,
  });

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    for (const p of allPOIs) {
      const cat = p.category?.trim();
      if (cat) catSet.add(cat);
    }
    const preferred = PREFERRED_CATEGORY_ORDER.filter((cat) => catSet.has(cat));
    const preferredSet = new Set<string>(PREFERRED_CATEGORY_ORDER);
    const extras = [...catSet]
      .filter((cat) => !preferredSet.has(cat))
      .sort((a, b) => a.localeCompare(b));
    return [...preferred, ...extras];
  }, [allPOIs]);

  const pois = category ? allPOIs.filter((p) => p.category?.trim() === category) : allPOIs;

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        {/* Category Filter */}
        {showCategoryFilter && (
          <div className="mb-8 flex flex-wrap gap-2">
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
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-sage-dark text-white"
                    : "border border-stone bg-white text-[#4A4640] hover:bg-stone"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* POI Grid */}
        {pois.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pois.map((poi) => {
              const safeLink = poi.link && isSafeUrl(poi.link) ? poi.link : undefined;
              return (
                <div
                  key={poi.slug}
                  className="overflow-hidden rounded-lg border border-stone bg-white"
                >
                  {/* Image */}
                  {poi.image ? (
                    <LightboxImage
                      src={poi.image}
                      alt={poi.name}
                      wrapperClassName="h-48 w-full"
                      className="h-full w-full object-cover"
                      width={800}
                      height={600}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-stone">
                      <svg
                        className="h-12 w-12 text-[#635E56]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    {poi.category && (
                      <span className="mb-2 inline-block rounded-full bg-stone px-2 py-0.5 text-xs font-medium text-sage-dark">
                        {poi.category}
                      </span>
                    )}
                    <h2 className="mb-2 text-lg font-semibold text-[#2D2A24]">
                      <DataLink
                        href={safeLink}
                        className="transition-colors hover:text-sage-dark"
                        fallback={poi.name}
                      >
                        {poi.name}
                      </DataLink>
                    </h2>
                    <p className="mb-3 line-clamp-2 text-base text-[#4A4640]">
                      {htmlToPlainText(poi.description)}
                    </p>

                    <div className="space-y-1.5 text-sm text-[#635E56]">
                      <div className="flex items-start gap-1.5">
                        <svg
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <a
                          href={getMapUrl(poi.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-sage-dark"
                        >
                          {poi.address}
                        </a>
                        {poi.address && (
                          <AddressCopyButton
                            address={poi.address}
                            label={poi.name}
                            tone="default"
                            className="h-6 w-6 shrink-0"
                            iconClassName="h-3.5 w-3.5"
                          />
                        )}
                      </div>
                      <div className="flex items-start gap-1.5">
                        <svg
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{poi.hours}</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {poi.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1 border-t border-stone pt-3">
                        {poi.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded bg-cream px-1.5 py-0.5 text-xs text-[#635E56]"
                          >
                            {amenity}
                          </span>
                        ))}
                        {poi.amenities.length > 3 && (
                          <span className="py-0.5 text-xs text-[#635E56]">
                            +{poi.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {safeLink &&
                      (() => {
                        const visitClassName =
                          "inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-sage-dark hover:text-[#2D2A24] transition-colors";
                        const visitContent = (
                          <>
                            Visit
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </>
                        );
                        return (
                          <DataLink href={safeLink} className={visitClassName}>
                            {visitContent}
                          </DataLink>
                        );
                      })()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-[#635E56]">No points of interest found.</p>
          </div>
        )}
      </div>
    </section>
  );
};
