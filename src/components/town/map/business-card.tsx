"use client";

import { cn } from "@/lib/utils";
import type { MapBusiness } from "@/lib/map-utils";
import { getCategoryColor, getDirectionsUrl, getMapUrl } from "@/lib/map-utils";
import { MapPin, Phone, Navigation, Globe } from "lucide-react";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";

interface BusinessCardProps {
  business: MapBusiness;
  isSelected: boolean;
  onClick: () => void;
}

export const BusinessCard = ({ business, isSelected, onClick }: BusinessCardProps) => {
  const color = getCategoryColor(business.category);

  return (
    // A div, not a <button>: the card contains links and copy buttons, and
    // interactive content inside <button> is invalid HTML. React then fails
    // hydration on /map and re-renders the whole tree on the client.
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "w-full cursor-pointer rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
        isSelected
          ? "border-sage/30 bg-sage/10 shadow-sm"
          : "border-transparent bg-cream hover:border-stone/40 hover:bg-stone/20"
      )}
      aria-label={`View ${business.name} on map`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-snug text-[#2D2A24]">
            {business.name}
          </h3>
          <div className="mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-[#635E56]" aria-hidden="true" />
            <a
              href={getMapUrl(business.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="truncate text-sm leading-tight text-[#635E56] transition-colors hover:text-sage-dark"
            >
              {business.address}
            </a>
            <AddressCopyButton
              address={business.address}
              label={business.name}
              tone="default"
              className="h-6 w-6"
              iconClassName="h-3.5 w-3.5"
            />
          </div>
          {business.phone && (
            <div className="mt-0.5 flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0 text-[#635E56]" aria-hidden="true" />
              <a
                href={`tel:+1${business.phone.replace(/\D/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-[#635E56] transition-colors hover:text-sage-dark"
              >
                {business.phone}
              </a>
              <PhoneCopyButton
                phone={business.phone}
                label={business.name}
                tone="default"
                className="h-6 w-6"
                iconClassName="h-3.5 w-3.5"
              />
            </div>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {business.category}
            </span>
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-full bg-stone/40 px-2 py-0.5 text-[10px] font-medium text-sage-dark transition-colors hover:bg-stone/60"
                aria-label={`Visit ${business.name} website`}
              >
                <Globe className="h-2.5 w-2.5" />
                Website
              </a>
            )}
            <a
              href={getDirectionsUrl(business.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full bg-stone/40 px-2 py-0.5 text-[10px] font-medium text-sage-dark transition-colors hover:bg-stone/60"
              aria-label={`Get directions to ${business.name}`}
            >
              <Navigation className="h-2.5 w-2.5" />
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
