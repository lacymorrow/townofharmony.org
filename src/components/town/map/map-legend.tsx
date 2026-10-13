"use client";

import { useState } from "react";
import { ALL_CATEGORIES, getCategoryColor } from "@/lib/map-utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MapLegendProps {
  title?: string;
  boundaryLabel?: string;
}

export const MapLegend = ({
  title = "Legend",
  boundaryLabel = "Town Boundary",
}: MapLegendProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-6 right-3 z-[1000] max-w-[200px]">
      <div className="overflow-hidden rounded-lg border border-stone bg-white shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-[#2D2A24] transition-colors hover:bg-cream"
          aria-expanded={isOpen}
          aria-controls="map-legend-content"
        >
          <span>{title}</span>
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#635E56]" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-[#635E56]" />
          )}
        </button>
        {isOpen && (
          <div id="map-legend-content" className="flex flex-col gap-1.5 px-3 pb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-5 border-t-2 border-dashed border-sage-deep"
                aria-hidden="true"
              />
              <span className="text-xs text-[#635E56]">{boundaryLabel}</span>
            </div>
            {ALL_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getCategoryColor(cat) }}
                  aria-hidden="true"
                />
                <span className="truncate text-xs text-[#635E56]">{cat}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
