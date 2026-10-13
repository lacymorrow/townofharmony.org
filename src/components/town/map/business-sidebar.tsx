"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "./category-filter";
import { BusinessCard } from "./business-card";
import type { MapBusiness, BusinessCategory } from "@/lib/map-utils";
import { ALL_CATEGORIES } from "@/lib/map-utils";
import { Search, MapPin } from "lucide-react";

interface BusinessSidebarProps {
  businesses: MapBusiness[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategories: Set<BusinessCategory>;
  onToggleCategory: (category: BusinessCategory) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  selectedBusiness: MapBusiness | null;
  onSelectBusiness: (business: MapBusiness) => void;
}

export const BusinessSidebar = ({
  businesses,
  searchQuery,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  onClearAll,
  onSelectAll,
  selectedBusiness,
  onSelectBusiness,
}: BusinessSidebarProps) => {
  const filteredBusinesses = useMemo(() => {
    return businesses
      .filter((b) => activeCategories.has(b.category))
      .filter(
        (b) =>
          !searchQuery ||
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [businesses, activeCategories, searchQuery]);

  const totalCount = businesses.length;
  const visibleCount = filteredBusinesses.length;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Header with search */}
      <div className="shrink-0 border-b border-stone px-3 py-2.5">
        <div className="mb-2">
          <div className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sage-deep align-middle">
            <MapPin className="h-3.5 w-3.5 text-cream" aria-hidden="true" />
          </div>
          <h2 className="inline-block align-middle text-sm font-bold leading-tight text-[#2D2A24]">
            Harmony Business Directory
          </h2>
        </div>

        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#635E56]"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 border-stone bg-cream pl-8 text-sm text-[#2D2A24] placeholder:text-[#635E56]"
            aria-label="Search businesses by name, address, or category"
          />
        </div>
      </div>

      {/* Filters + count */}
      <div className="shrink-0 border-b border-stone px-3 py-2">
        <CategoryFilter
          activeCategories={activeCategories}
          onToggleCategory={onToggleCategory}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          businesses={businesses}
        />
        <p className="mt-1.5 text-xs text-[#635E56]" aria-live="polite" aria-atomic="true">
          Showing <span className="font-semibold text-[#2D2A24]">{visibleCount}</span> of{" "}
          {totalCount} businesses
        </p>
      </div>

      {/* Business List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1.5 p-3">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((biz) => (
              <BusinessCard
                key={biz.id}
                business={biz}
                isSelected={selectedBusiness?.id === biz.id}
                onClick={() => onSelectBusiness(biz)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-3 h-8 w-8 text-stone" aria-hidden="true" />
              <p className="text-sm font-medium text-[#635E56]">No businesses found</p>
              <p className="mt-1 text-sm text-[#635E56]">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
