"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { mapBusinesses } from "@/data/town/map-businesses";
import { BusinessSidebar } from "@/components/town/map/business-sidebar";
import { MapLegend } from "@/components/town/map/map-legend";
import type { MapBusiness, BusinessCategory } from "@/lib/map-utils";
import { ALL_CATEGORIES } from "@/lib/map-utils";
import type { HarmonyMapHandle } from "@/components/town/map/harmony-map";
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
			<div className="h-full w-full flex items-center justify-center bg-cream">
				<div className="flex flex-col items-center gap-3">
					<div className="h-10 w-10 rounded-full border-3 border-sage-deep border-t-transparent animate-spin" />
					<p className="text-sm text-[#635E56] font-medium">Loading map...</p>
				</div>
			</div>
		),
	},
);

// Parse categories from URL param (comma-separated)
function parseCatsParam(value: string | null): Set<BusinessCategory> {
	if (!value) return new Set(ALL_CATEGORIES);
	const cats = value.split(",").filter((c) => ALL_CATEGORIES.includes(c as BusinessCategory));
	return cats.length > 0 ? new Set(cats as BusinessCategory[]) : new Set(ALL_CATEGORIES);
}

export const InteractiveMap = () => {
	const mapRef = useRef<HarmonyMapHandle>(null);
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const initializedRef = useRef(false);

	// Initialize state from URL params
	const [searchQuery, setSearchQuery] = useState(() => searchParams?.get("q") ?? "");
	const [activeCategories, setActiveCategories] = useState<Set<BusinessCategory>>(() =>
		parseCatsParam(searchParams?.get("cats") ?? null),
	);
	const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(() => {
		const bizId = searchParams?.get("biz");
		return bizId ? mapBusinesses.find((b) => b.id === bizId) ?? null : null;
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
		return mapBusinesses
			.filter((b) => activeCategories.has(b.category))
			.filter(
				(b) =>
					!searchQuery ||
					b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
					b.category.toLowerCase().includes(searchQuery.toLowerCase()),
			);
	}, [activeCategories, searchQuery]);

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
			<div className="h-11 shrink-0 flex items-center justify-between px-4 bg-sage-deep text-cream shadow-sm">
				<div className="flex items-center gap-2.5">
					<h1 className="text-sm font-bold leading-tight tracking-tight">
						Interactive Business Map
					</h1>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={handleCopyLink}
						className="flex items-center justify-center h-8 w-8 rounded-md text-cream hover:bg-white/15 transition-colors"
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
						className="flex items-center justify-center h-8 w-8 rounded-md text-cream hover:bg-white/15 transition-colors"
						aria-label="Reset map view"
						title="Reset view"
					>
						<LocateFixed className="h-4 w-4" />
					</button>

					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md text-cream hover:bg-white/15 transition-colors"
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
						className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md text-cream hover:bg-white/15 transition-colors"
						aria-label="Open business list"
					>
						<List className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden relative">
				{/* Desktop Sidebar */}
				<aside
					className={`hidden lg:flex shrink-0 transition-all duration-300 ease-in-out border-r border-stone ${
						sidebarOpen ? "w-[380px]" : "w-0"
					}`}
					aria-label="Business directory sidebar"
				>
					{sidebarOpen && (
						<div className="w-[380px] h-full">
							<BusinessSidebar
								businesses={mapBusinesses}
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
				<div className="flex-1 relative">
					<HarmonyMap
						ref={mapRef}
						businesses={filteredBusinesses}
						selectedBusiness={selectedBusiness}
						onMarkerClick={handleMarkerClick}
					/>
					<MapLegend />

					<button
						onClick={() => setMobileSheetOpen(true)}
						className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-full bg-sage-deep text-cream shadow-lg hover:bg-sage-dark transition-colors text-sm font-medium"
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
					className="lg:hidden h-[80vh] sm:h-[75vh] max-h-[700px] p-0 overflow-hidden shadow-2xl !left-3 !right-3 sm:!left-6 sm:!right-6 !bottom-3 sm:!bottom-4 rounded-2xl border border-stone !z-[1100] [&>button]:hidden"
				>
					<SheetHeader className="sr-only">
						<SheetTitle>Harmony Business Directory</SheetTitle>
						<SheetDescription>Browse and search businesses in Harmony, NC</SheetDescription>
					</SheetHeader>
					<div className="shrink-0 flex justify-center pt-3 pb-1">
						<div className="h-1.5 w-12 rounded-full bg-stone" />
					</div>
					<div className="flex-1 min-h-0 overflow-hidden">
						<BusinessSidebar
							businesses={mapBusinesses}
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
