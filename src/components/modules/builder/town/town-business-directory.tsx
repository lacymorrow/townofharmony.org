"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBuilderPaginatedData } from "@/lib/builder-data";
import { businesses as staticBusinesses } from "@/data/town/businesses";
import type { TownBusiness } from "@/data/town/types";

interface TownBusinessDirectoryProps {
	itemsPerPage?: number;
	showSearch?: boolean;
}

/**
 * Well-known categories shown first in the filter bar, in this order.
 * Categories entered in Builder.io that aren't listed here still appear,
 * sorted alphabetically after these — editors can add new categories
 * without a code change.
 */
const PREFERRED_CATEGORY_ORDER = [
	"retail",
	"restaurant",
	"services",
	"agriculture",
	"professional",
	"healthcare",
	"automotive",
	"construction",
] as const;

const Pagination = ({
	page,
	totalPages,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) => {
	if (totalPages <= 1) return null;

	const pages: number[] = [];
	for (let i = 1; i <= totalPages; i++) {
		pages.push(i);
	}

	return (
		<nav className="flex items-center justify-center gap-2 mt-8">
			<button
				type="button"
				onClick={() => onPageChange(page - 1)}
				disabled={page <= 1}
				className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				Previous
			</button>
			{pages.map((p) => (
				<button
					key={p}
					type="button"
					onClick={() => onPageChange(p)}
					className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
						p === page
							? "bg-sage-dark text-white"
							: "border border-stone bg-white text-sage-dark hover:bg-cream"
					}`}
				>
					{p}
				</button>
			))}
			<button
				type="button"
				onClick={() => onPageChange(page + 1)}
				disabled={page >= totalPages}
				className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				Next
			</button>
		</nav>
	);
};

export const TownBusinessDirectory = ({
	itemsPerPage = 12,
	showSearch = true,
}: TownBusinessDirectoryProps) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const page = Number(searchParams?.get("page")) || 1;
	const category = searchParams?.get("category") || undefined;
	const search = searchParams?.get("search") || undefined;
	const featured = searchParams?.get("featured") === "true" || undefined;

	const { docs, allData: allBusinesses, totalPages } = useBuilderPaginatedData<TownBusiness>("town-business", {
		page,
		limit: itemsPerPage,
		fallbackData: staticBusinesses,
		search,
		searchFields: ["name", "description", "category"],
		filter: (biz) => {
			if (category && biz.category !== category) return false;
			if (featured && !biz.isFeatured) return false;
			return true;
		},
		clientSort: (a, b) => a.name.localeCompare(b.name),
	});

	const availableCategories = useMemo(() => {
		const catSet = new Set<string>();
		for (const b of allBusinesses) {
			const cat = b.category?.trim();
			if (cat) catSet.add(cat);
		}
		const preferred = PREFERRED_CATEGORY_ORDER.filter((cat) => catSet.has(cat));
		const preferredSet = new Set<string>(PREFERRED_CATEGORY_ORDER);
		const extras = [...catSet]
			.filter((cat) => !preferredSet.has(cat))
			.sort((a, b) => a.localeCompare(b));
		return [...preferred, ...extras];
	}, [allBusinesses]);

	const updateParams = (updates: Record<string, string | undefined>) => {
		const params = new URLSearchParams(searchParams?.toString() ?? "");
		for (const [key, value] of Object.entries(updates)) {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		}
		if (!("page" in updates)) {
			params.delete("page");
		}
		router.push(`?${params.toString()}`, { scroll: false });
	};

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				{/* Search and Filters */}
				<div className="mb-8 space-y-4">
					{showSearch && (
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1 max-w-md">
								<input
									type="text"
									placeholder="Search businesses..."
									defaultValue={search}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											updateParams({
												search:
													(e.target as HTMLInputElement).value || undefined,
											});
										}
									}}
									className="w-full px-4 py-2.5 rounded-lg border border-stone bg-white text-[#2D2A24] placeholder:text-[#635E56] focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
								/>
							</div>
							<button
								type="button"
								onClick={() =>
									updateParams({
										featured: featured ? undefined : "true",
									})
								}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									featured
										? "bg-wheat text-sage-deep"
										: "bg-white border border-stone text-[#4A4640] hover:bg-stone"
								}`}
							>
								Featured Only
							</button>
						</div>
					)}

					<div className="flex flex-wrap gap-2">
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
								className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
									category === cat
										? "bg-sage-dark text-white"
										: "bg-white border border-stone text-[#4A4640] hover:bg-stone"
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>

				{/* Business Grid */}
				{docs.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{docs.map((business) => (
							<Link
								key={business.slug}
								href={`/business/${business.slug}`}
								className="group bg-white rounded-lg border border-stone overflow-hidden hover:shadow-lg transition-shadow"
							>
								<div className="p-5">
									<div className="flex items-start gap-4 mb-3">
										{business.logo ? (
											<img
												src={business.logo}
												alt={business.name}
												className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-stone"
												width={800}
												height={600}
											/>
										) : (
											<div className="w-14 h-14 rounded-lg bg-stone flex items-center justify-center flex-shrink-0">
												<span className="text-xl font-bold text-sage-dark">
													{business.name.charAt(0)}
												</span>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h2 className="text-lg font-semibold text-[#2D2A24] group-hover:text-sage-dark transition-colors truncate">
												{business.name}
											</h2>
											<span className="text-sm text-[#635E56] capitalize">
												{business.category}
											</span>
										</div>
									</div>

									{/* Badges */}
									<div className="flex flex-wrap gap-1.5 mb-3">
										{business.isFeatured && (
											<span className="bg-wheat/30 text-[#7A6520] border border-wheat/50 px-2 py-0.5 rounded-full text-xs font-medium">
												Featured
											</span>
										)}
										{business.isVerified && (
											<span className="bg-sage/15 text-sage-dark border border-sage/30 px-2 py-0.5 rounded-full text-xs font-medium">
												Verified
											</span>
										)}
									</div>

									<p className="text-base text-[#4A4640] mb-3 line-clamp-2">
										{business.description}
									</p>

									<div className="space-y-1 text-sm text-[#635E56]">
										<p>
											{business.address}, {business.city}, {business.stateCode}{" "}
											{business.zipCode}
										</p>
										<p>{business.phone}</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-[#635E56] text-lg">No businesses found.</p>
					</div>
				)}

				{/* Pagination */}
				<Pagination
					page={page}
					totalPages={totalPages}
					onPageChange={(p) => updateParams({ page: String(p) })}
				/>
			</div>
		</section>
	);
};
