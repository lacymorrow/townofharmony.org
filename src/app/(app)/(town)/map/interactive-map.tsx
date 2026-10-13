"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { BusinessSidebar } from "@/components/town/map/business-sidebar";
import { MapLegend } from "@/components/town/map/map-legend";
import type { MapBusiness, BusinessCategory } from "@/lib/map-utils";
import type { TownSettings } from "@/data/town/types";
import { ALL_CATEGORIES } from "@/lib/map-utils";
import type { HarmonyMapHandle } from "@/components/town/map/harmony-map";
import { SafeBlock } from "@/components/town/safe-block";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PanelLeftOpen, PanelLeftClose, List, LocateFixed, Share2 } from "lucide-react";

const HarmonyMap = dynamic(
  () => import("@/components/town/map/harmony-map").then((mod) => ({ default: mod.HarmonyMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="border-3 h-10 w-10 animate-spin rounded-full border-sage-deep border-t-transparent" />
          <p className="text-sm font-medium text-[#635E56]">Loading map...</p>
        </div>
      </div>
    ),
  }
);

// Parse categories from URL param (comma-separated)
function parseCatsParam(value: string | null): Set<BusinessCategory> {
  if (!value) return new Set(ALL_CATEGORIES);
  const cats = value.split(",").filter((c) => ALL_CATEGORIES.includes(c as BusinessCategory));
  return cats.length > 0 ? new Set(cats as BusinessCategory[]) : new Set(ALL_CATEGORIES);
}

interface InteractiveMapProps {
  businesses: MapBusiness[];
  labels: TownSettings["map"];
}

export const InteractiveMap = ({ businesses, labels }: InteractiveMapProps) => {
  const mapRef = useRef<HarmonyMapHandle>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedRef = useRef(false);

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get("q") ?? "");
  const [activeCategories, setActiveCategories] = useState<Set<BusinessCategory>>(() =>
    parseCatsParam(searchParams?.get("cats") ?? null)
  );
  const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(() => {
    const bizId = searchParams?.get("biz");
    return bizId ? (businesses.find((b) => b.id === bizId) ?? null) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Sync state changes back to URL
  useEffect(() => {
    // Skip the initial render to avoid a redundant push
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const params = new URLSearchParams();

    if (selectedBusiness) {
      params.set("biz", selectedBusiness.id);
    }
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    if (activeCategories.size !== ALL_CATEGORIES.length && activeCategories.size > 0) {
      params.set("cats", Array.from(activeCategories).join(","));
    }

    const qs = params.toString();
    const base = pathname ?? "/map";
    const url = qs ? `${base}?${qs}` : base;
    router.replace(url, { scroll: false });
  }, [selectedBusiness, searchQuery, activeCategories, pathname, router]);

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

  const handleToggleCategory = useCallback((category: BusinessCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setActiveCategories(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    setActiveCategories(new Set(ALL_CATEGORIES));
  }, []);

  const handleSelectBusiness = useCallback((business: MapBusiness) => {
    setSelectedBusiness(business);
    setMobileSheetOpen(false);
  }, []);

  const handleMarkerClick = useCallback((business: MapBusiness) => {
    setSelectedBusiness(business);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 160px)" }}>
      {/* Map toolbar */}
      <div className="flex h-11 shrink-0 items-center justify-between bg-sage-deep px-4 text-cream shadow-sm">
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-bold leading-tight tracking-tight">{labels.pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex h-8 w-8 items-center justify-center rounded-md text-cream transition-colors hover:bg-white/15"
            aria-label="Copy shareable link"
            title="Share link"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              mapRef.current?.resetView();
              setSelectedBusiness(null);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-cream transition-colors hover:bg-white/15"
            aria-label="Reset map view"
            title="Reset view"
          >
            <LocateFixed className="h-4 w-4" />
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden h-8 w-8 items-center justify-center rounded-md text-cream transition-colors hover:bg-white/15 lg:flex"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setMobileSheetOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-cream transition-colors hover:bg-white/15 lg:hidden"
            aria-label="Open business list"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden shrink-0 border-r border-stone transition-all duration-300 ease-in-out lg:flex ${
            sidebarOpen ? "w-[380px]" : "w-0"
          }`}
          aria-label="Business directory sidebar"
        >
          {sidebarOpen && (
            <div className="h-full w-[380px]">
              <BusinessSidebar
                businesses={businesses}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategories={activeCategories}
                onToggleCategory={handleToggleCategory}
                onClearAll={handleClearAll}
                onSelectAll={handleSelectAll}
                selectedBusiness={selectedBusiness}
                onSelectBusiness={handleSelectBusiness}
              />
            </div>
          )}
        </aside>

        {/* Map */}
        <div className="relative flex-1">
          <SafeBlock name="HarmonyMap" fallback={<MapUnavailable />}>
            <HarmonyMap
              ref={mapRef}
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              onMarkerClick={handleMarkerClick}
            />
          </SafeBlock>
          <MapLegend title={labels.legendTitle} boundaryLabel={labels.boundaryLabel} />

          <button
            onClick={() => setMobileSheetOpen(true)}
            className="absolute bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-sage-deep px-4 py-2.5 text-sm font-medium text-cream shadow-lg transition-colors hover:bg-sage-dark lg:hidden"
            aria-label="View business list"
          >
            <List className="h-4 w-4" />
            <span>
              {filteredBusinesses.length} Place{filteredBusinesses.length !== 1 ? "s" : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent
          side="bottom"
          className="!bottom-3 !left-3 !right-3 !z-[1100] h-[80vh] max-h-[700px] overflow-hidden rounded-2xl border border-stone p-0 shadow-2xl sm:!bottom-4 sm:!left-6 sm:!right-6 sm:h-[75vh] lg:hidden [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Harmony Business Directory</SheetTitle>
            <SheetDescription>Browse and search businesses in Harmony, NC</SheetDescription>
          </SheetHeader>
          <div className="flex shrink-0 justify-center pb-1 pt-3">
            <div className="h-1.5 w-12 rounded-full bg-stone" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <BusinessSidebar
              businesses={businesses}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeCategories={activeCategories}
              onToggleCategory={handleToggleCategory}
              onClearAll={handleClearAll}
              onSelectAll={handleSelectAll}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={handleSelectBusiness}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

/** Shown in the map pane if Leaflet throws. The directory beside it keeps working. */
const MapUnavailable = () => (
  <div
    role="status"
    className="absolute inset-0 flex items-center justify-center bg-cream p-6 text-center"
  >
    <div className="max-w-sm">
      <p className="font-serif text-lg font-semibold text-sage-dark">The map could not load</p>
      <p className="mt-1 text-sm text-[#635E56]">
        The business list still works. Try again in a moment, or use the Directions links.
      </p>
    </div>
  </div>
);
