"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { useBuilderData } from "@/lib/builder-data";
import { getMapUrl } from "@/lib/map-utils";
import { isExternalUrl, isSafeUrl } from "@/lib/utils";
import { pointsOfInterest as staticPOIs } from "@/data/town/points-of-interest";
import type { TownPointOfInterest } from "@/data/town/types";

interface TownPointsOfInterestProps {
	showCategoryFilter?: boolean;
}

/**
 * Well-known categories shown first in the filter bar, in this order.
 * Categories entered in Builder.io that aren't listed here still appear,
 * sorted alphabetically after these — editors can add new categories
 * without a code change.
 */
const PREFERRED_CATEGORY_ORDER = [
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
		{ sort: { priority: -1 }, limit: 50, fallback: staticPOIs },
	);

	const availableCategories = useMemo(() => {
		const catSet = new Set<string>();
		for (const p of allPOIs) {
			const cat = p.category?.trim();
			if (cat) catSet.add(cat);
		}
		const preferred = PREFERRED_CATEGORY_ORDER.filter((cat) => catSet.has(cat));
		const preferredSet = new Set<string>(PREFERRED_CATEGORY_ORDER);
		const extras = [...catSet]
			.filter((cat) => !preferredSet.has(cat))
			.sort((a, b) => a.localeCompare(b));
		return [...preferred, ...extras];
	}, [allPOIs]);

	const pois = category
		? allPOIs.filter((p) => p.category?.trim() === category)
		: allPOIs;

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
						{pois.map((poi) => {
							const safeLink = poi.link && isSafeUrl(poi.link) ? poi.link : undefined;
							const isExternal = safeLink ? isExternalUrl(safeLink) : false;
							return (<div
								key={poi.slug}
								className="bg-white rounded-lg border border-stone overflow-hidden"
							>
								{/* Image */}
								{poi.image ? (
									<LightboxImage
										src={poi.image}
										alt={poi.name}
										wrapperClassName="h-48 w-full"
										className="w-full h-full object-cover"
										width={800}
										height={600}
									/>
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
									{poi.category && (
										<span className="inline-block bg-stone text-sage-dark px-2 py-0.5 rounded-full text-xs font-medium mb-2">
											{poi.category}
										</span>
									)}
									<h2 className="text-lg font-semibold text-[#2D2A24] mb-2">
										{safeLink ? (
											isExternal ? (
												<a
													href={safeLink}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:text-sage-dark transition-colors"
												>
													{poi.name}
												</a>
											) : (
												<Link
													href={safeLink}
													className="hover:text-sage-dark transition-colors"
												>
													{poi.name}
												</Link>
											)
										) : (
											poi.name
										)}
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
											<a
												href={getMapUrl(poi.address)}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:text-sage-dark transition-colors"
											>
												{poi.address}
											</a>
											{poi.address && (
												<AddressCopyButton
													address={poi.address}
													label={poi.name}
													tone="default"
													className="h-6 w-6 shrink-0"
													iconClassName="h-3.5 w-3.5"
												/>
											)}
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

									{safeLink && (() => {
										const visitClassName =
											"inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-sage-dark hover:text-[#2D2A24] transition-colors";
										const visitContent = (
											<>
												Visit
												<svg
													className="w-3.5 h-3.5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
													/>
												</svg>
											</>
										);
										return isExternal ? (
											<a
												href={safeLink}
												target="_blank"
												rel="noopener noreferrer"
												className={visitClassName}
											>
												{visitContent}
											</a>
										) : (
											<Link href={safeLink} className={visitClassName}>
												{visitContent}
											</Link>
										);
									})()}
								</div>
							</div>
						)})}
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
