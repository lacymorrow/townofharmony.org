"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBuilderPaginatedData } from "@/lib/builder-data";
import { htmlToPlainText } from "@/lib/html-to-text";
import { businesses as staticBusinesses } from "@/data/town/businesses";
import type { TownBusiness } from "@/data/town/types";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";

interface TownBusinessDirectoryProps {
  itemsPerPage?: number;
  showSearch?: boolean;
}

/**
 * Well-known categories shown first in the filter bar, in this order.
 * Categories entered in Builder.io that aren't listed here still appear,
 * sorted alphabetically after these — editors can add new categories
 * without a code change.
 */
const PREFERRED_CATEGORY_ORDER = [
  "retail",
  "restaurant",
  "services",
  "agriculture",
  "professional",
  "healthcare",
  "automotive",
  "construction",
] as const;

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

export const TownBusinessDirectory = ({
  itemsPerPage = 12,
  showSearch = true,
}: TownBusinessDirectoryProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams?.get("page")) || 1;
  const category = searchParams?.get("category") || undefined;
  const search = searchParams?.get("search") || undefined;
  const featured = searchParams?.get("featured") === "true" || undefined;

  const {
    docs,
    allData: allBusinesses,
    totalPages,
  } = useBuilderPaginatedData<TownBusiness>("town-business", {
    page,
    limit: itemsPerPage,
    fallbackData: staticBusinesses,
    search,
    searchFields: ["name", "description", "category"],
    filter: (biz) => {
      if (category && biz.category !== category) return false;
      if (featured && !biz.isFeatured) return false;
      return true;
    },
    clientSort: (a, b) => a.name.localeCompare(b.name),
  });

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    for (const b of allBusinesses) {
      const cat = b.category?.trim();
      if (cat) catSet.add(cat);
    }
    const preferred = PREFERRED_CATEGORY_ORDER.filter((cat) => catSet.has(cat));
    const preferredSet = new Set<string>(PREFERRED_CATEGORY_ORDER);
    const extras = [...catSet]
      .filter((cat) => !preferredSet.has(cat))
      .sort((a, b) => a.localeCompare(b));
    return [...preferred, ...extras];
  }, [allBusinesses]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {showSearch && (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="max-w-md flex-1">
                <input
                  type="text"
                  placeholder="Search businesses..."
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
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    featured: featured ? undefined : "true",
                  })
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  featured
                    ? "bg-wheat text-sage-deep"
                    : "border border-stone bg-white text-[#4A4640] hover:bg-stone"
                }`}
              >
                Featured Only
              </button>
            </div>
          )}

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
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Business Grid */}
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((business) => (
              <Link
                key={business.slug}
                href={`/business/${business.slug}`}
                className="group overflow-hidden rounded-lg border border-stone bg-white transition-shadow hover:shadow-lg"
              >
                <div className="p-5">
                  <div className="mb-3 flex items-start gap-4">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="h-14 w-14 flex-shrink-0 rounded-lg border border-stone object-cover"
                        width={800}
                        height={600}
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-stone">
                        <span className="text-xl font-bold text-sage-dark">
                          {business.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                        {business.name}
                      </h2>
                      <span className="text-sm capitalize text-[#635E56]">{business.category}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {business.isFeatured && (
                      <span className="rounded-full border border-wheat/50 bg-wheat/30 px-2 py-0.5 text-xs font-medium text-[#7A6520]">
                        Featured
                      </span>
                    )}
                    {business.isVerified && (
                      <span className="rounded-full border border-sage/30 bg-sage/15 px-2 py-0.5 text-xs font-medium text-sage-dark">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mb-3 line-clamp-2 text-base text-[#4A4640]">
                    {htmlToPlainText(business.description)}
                  </p>

                  <div className="space-y-1 text-sm text-[#635E56]">
                    {business.address && (
                      <p className="flex items-start gap-1.5">
                        <span>
                          {business.address}, {business.city}, {business.stateCode}{" "}
                          {business.zipCode}
                        </span>
                        <AddressCopyButton
                          address={`${business.address}, ${business.city}, ${business.stateCode} ${business.zipCode}`}
                          label={business.name}
                          tone="default"
                          className="h-6 w-6 shrink-0"
                          iconClassName="h-3.5 w-3.5"
                        />
                      </p>
                    )}
                    {business.phone && (
                      <p className="flex items-center gap-1.5">
                        <span>{business.phone}</span>
                        <PhoneCopyButton
                          phone={business.phone}
                          label={business.name}
                          tone="default"
                          className="h-6 w-6 shrink-0"
                          iconClassName="h-3.5 w-3.5"
                        />
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-[#635E56]">No businesses found.</p>
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
