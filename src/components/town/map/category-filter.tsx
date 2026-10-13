"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessCategory, MapBusiness } from "@/lib/map-utils";
import { ALL_CATEGORIES, getCategoryColor } from "@/lib/map-utils";

interface CategoryFilterProps {
  activeCategories: Set<BusinessCategory>;
  onToggleCategory: (category: BusinessCategory) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  businesses: MapBusiness[];
}

export const CategoryFilter = ({
  activeCategories,
  onToggleCategory,
  onClearAll,
  onSelectAll,
  businesses,
}: CategoryFilterProps) => {
  const [expanded, setExpanded] = useState(false);
  const allActive = activeCategories.size === ALL_CATEGORIES.length;

  function getCategoryCount(category: BusinessCategory) {
    return businesses.filter((b) => b.category === category).length;
  }

  const activeCount = activeCategories.size;
  const totalCount = ALL_CATEGORIES.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium uppercase tracking-wide text-[#635E56] transition-colors hover:text-[#2D2A24]"
          aria-expanded={expanded}
          aria-controls="category-filter-pills"
        >
          <ChevronDown
            className={cn(
              "mr-1.5 inline-block h-3.5 w-3.5 align-middle transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden="true"
          />
          <span className="align-middle">Categories</span>
          {!allActive && (
            <span className="ml-1.5 align-middle normal-case tracking-normal text-[#635E56]">
              ({activeCount}/{totalCount})
            </span>
          )}
        </button>
      </div>
      {expanded && (
        <>
          <div
            id="category-filter-pills"
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter businesses by category"
          >
            {ALL_CATEGORIES.map((category) => {
              const isActive = activeCategories.has(category);
              const color = getCategoryColor(category);
              const count = getCategoryCount(category);

              return (
                <button
                  key={category}
                  onClick={() => onToggleCategory(category)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-stone bg-cream text-[#635E56] hover:bg-stone/30"
                  )}
                  style={isActive ? { backgroundColor: color } : undefined}
                >
                  <span
                    className={cn(
                      "inline-block h-2 w-2 shrink-0 rounded-full",
                      !isActive && "opacity-70"
                    )}
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="max-w-[100px] truncate">{category}</span>
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      isActive ? "text-white/80" : "text-[#635E56]"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={allActive ? onClearAll : onSelectAll}
            className="self-start text-xs font-medium text-sage transition-colors hover:text-sage-dark"
            aria-label={allActive ? "Clear all category filters" : "Select all categories"}
          >
            {allActive ? "Clear All" : "Select All"}
          </button>
        </>
      )}
    </div>
  );
};
