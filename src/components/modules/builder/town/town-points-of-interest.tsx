"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBuilderData } from "@/lib/builder-data";
import { pointsOfInterest as staticPOIs } from "@/data/town/points-of-interest";
import type { TownPointOfInterest } from "@/data/town/types";

interface TownPointsOfInterestProps {
	showCategoryFilter?: boolean;
}

const POI_CATEGORIES = [
	"Parks",
	"Government",
	"Historic Sites",
	"Memorials",
	"Education",
	"Recreation",
] as const;

export const TownPointsOfInterest = ({
	showCategoryFilter = true,
}: TownPointsOfInterestProps) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const category = searchParams?.get("category") || undefined;

	const { data: allPOIs, loading } = useBuilderData<TownPointOfInterest>(
		"town-point-of-interest",
		{ limit: 50, fallback: staticPOIs },
	);

	const availableCategories = useMemo(() => {
		const catSet = new Set<string>();
		for (const p of allPOIs) catSet.add(p.category);
		return POI_CATEGORIES.filter((cat) => catSet.has(cat));
	}, [allPOIs]);

	const pois = (() => {
		let filtered = [...allPOIs];
		if (category) filtered = filtered.filter((p) => p.category === category);
		return filtered.sort((a, b) => a.name.localeCompare(b.name));
	})();

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
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				{/* Category Filter */}
				{showCategoryFilter && (
					<div className="mb-8 flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => updateParams({ category: undefined })}
							className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
								!category
									? "bg-sage-dark text-white"
									: "bg-white border border-stone text-[#4A4640] hover:bg-stone"
							}`}
						>
							All
						</button>
						{availableCategories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => updateParams({ category: cat })}
								className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
									category === cat
										? "bg-sage-dark text-white"
										: "bg-white border border-stone text-[#4A4640] hover:bg-stone"
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				)}

				{/* POI Grid */}
				{pois.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{pois.map((poi) => (
							<div
								key={poi.slug}
								className="bg-white rounded-lg border border-stone overflow-hidden"
							>
								{/* Image */}
								{poi.image ? (
									<div className="h-48 overflow-hidden">
										<img
											src={poi.image}
											alt={poi.name}
											className="w-full h-full object-cover"
											width={800}
											height={600}
										/>
									</div>
								) : (
									<div className="h-48 bg-stone flex items-center justify-center">
										<svg
											className="w-12 h-12 text-[#635E56]"
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
									<span className="inline-block bg-stone text-sage-dark px-2 py-0.5 rounded-full text-xs font-medium mb-2">
										{poi.category}
									</span>
									<h2 className="text-lg font-semibold text-[#2D2A24] mb-2">
										{poi.name}
									</h2>
									<p className="text-base text-[#4A4640] mb-3 line-clamp-2">
										{poi.description}
									</p>

									<div className="space-y-1.5 text-sm text-[#635E56]">
										<div className="flex items-start gap-1.5">
											<svg
												className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
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
											<span>{poi.address}</span>
										</div>
										<div className="flex items-start gap-1.5">
											<svg
												className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
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
										<div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-stone">
											{poi.amenities.slice(0, 3).map((amenity) => (
												<span
													key={amenity}
													className="bg-cream text-[#635E56] px-1.5 py-0.5 rounded text-xs"
												>
													{amenity}
												</span>
											))}
											{poi.amenities.length > 3 && (
												<span className="text-xs text-[#635E56] py-0.5">
													+{poi.amenities.length - 3} more
												</span>
											)}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-[#635E56] text-lg">
							No points of interest found.
						</p>
					</div>
				)}
			</div>
		</section>
	);
};
