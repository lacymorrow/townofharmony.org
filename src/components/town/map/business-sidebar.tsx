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
					b.category.toLowerCase().includes(searchQuery.toLowerCase()),
			);
	}, [businesses, activeCategories, searchQuery]);

	const totalCount = businesses.length;
	const visibleCount = filteredBusinesses.length;

	return (
		<div className="flex flex-col h-full overflow-hidden bg-white">
			{/* Header with search */}
			<div className="shrink-0 px-3 py-2.5 border-b border-stone">
				<div className="mb-2">
					<div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-sage-deep align-middle mr-2">
						<MapPin className="h-3.5 w-3.5 text-cream" aria-hidden="true" />
					</div>
					<h2 className="text-sm font-bold text-[#2D2A24] leading-tight inline-block align-middle">Harmony Business Directory</h2>
				</div>

				<div className="relative">
					<Search
						className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#635E56]"
						aria-hidden="true"
					/>
					<Input
						type="text"
						placeholder="Search businesses..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-8 h-8 text-sm bg-cream border-stone placeholder:text-[#635E56] text-[#2D2A24]"
						aria-label="Search businesses by name, address, or category"
					/>
				</div>
			</div>

			{/* Filters + count */}
			<div className="shrink-0 px-3 py-2 border-b border-stone">
				<CategoryFilter
					activeCategories={activeCategories}
					onToggleCategory={onToggleCategory}
					onClearAll={onClearAll}
					onSelectAll={onSelectAll}
					businesses={businesses}
				/>
				<p className="text-xs text-[#635E56] mt-1.5" aria-live="polite" aria-atomic="true">
					Showing <span className="font-semibold text-[#2D2A24]">{visibleCount}</span> of{" "}
					{totalCount} businesses
				</p>
			</div>

			{/* Business List */}
			<div className="flex-1 min-h-0 overflow-y-auto">
				<div className="p-3 flex flex-col gap-1.5">
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
							<Search className="h-8 w-8 text-stone mb-3" aria-hidden="true" />
							<p className="text-sm font-medium text-[#635E56]">No businesses found</p>
							<p className="text-sm text-[#635E56] mt-1">
								Try adjusting your search or filters
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
