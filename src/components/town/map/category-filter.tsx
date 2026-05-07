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
					className="text-xs font-medium text-[#635E56] uppercase tracking-wide hover:text-[#2D2A24] transition-colors"
					aria-expanded={expanded}
					aria-controls="category-filter-pills"
				>
					<ChevronDown
						className={cn(
							"h-3.5 w-3.5 transition-transform duration-200 inline-block align-middle mr-1.5",
							expanded && "rotate-180",
						)}
						aria-hidden="true"
					/>
					<span className="align-middle">Categories</span>
					{!allActive && (
						<span className="normal-case tracking-normal text-[#635E56] align-middle ml-1.5">
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
										"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all border",
										isActive
											? "border-transparent text-white shadow-sm"
											: "border-stone text-[#635E56] bg-cream hover:bg-stone/30",
									)}
									style={isActive ? { backgroundColor: color } : undefined}
								>
									<span
										className={cn(
											"inline-block h-2 w-2 rounded-full shrink-0",
											!isActive && "opacity-70",
										)}
										style={{ backgroundColor: color }}
										aria-hidden="true"
									/>
									<span className="truncate max-w-[100px]">{category}</span>
									<span
										className={cn(
											"text-[10px] tabular-nums",
											isActive ? "text-white/80" : "text-[#635E56]",
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
						className="text-xs font-medium text-sage hover:text-sage-dark transition-colors self-start"
						aria-label={allActive ? "Clear all category filters" : "Select all categories"}
					>
						{allActive ? "Clear All" : "Select All"}
					</button>
				</>
			)}
		</div>
	);
};
