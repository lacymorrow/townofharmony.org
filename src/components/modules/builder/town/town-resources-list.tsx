"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentViewerDialog } from "@/components/town/document-viewer-dialog";
import { useBuilderData } from "@/lib/builder-data";
import { resources as staticResources } from "@/data/town/resources";
import type { TownResource } from "@/data/town/types";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { isExternalUrl } from "@/lib/utils";

interface TownResourcesListProps {
	type?: "document" | "service" | "link";
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
	FileText: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
	),
	Shield: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
			/>
		</svg>
	),
	Building: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
			/>
		</svg>
	),
	Scale: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
			/>
		</svg>
	),
	DropletIcon: (
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 21a8 8 0 01-6.93-4A8 8 0 0112 3a8 8 0 016.93 14A8 8 0 0112 21z"
			/>
		</svg>
	),
	ExternalLink: (
		<svg
			className="w-5 h-5"
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
	),
};

const getIconElement = (iconName: string) => {
	return (
		TYPE_ICONS[iconName] || (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
				/>
			</svg>
		)
	);
};

const TYPE_LABELS: Record<string, string> = {
	document: "Document",
	service: "Service",
	link: "External Link",
};

const TYPE_COLORS: Record<string, string> = {
	document: "bg-sage/15 text-sage-dark border-sage/30",
	service: "bg-wheat/30 text-[#7A6520] border-wheat/50",
	link: "bg-stone text-[#4A4640] border-stone",
};

export const TownResourcesList = ({ type }: TownResourcesListProps) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const categoryParam = searchParams?.get("category") || undefined;

	const { data: rawResources } = useBuilderData<TownResource>(
		"town-resource",
		{ sort: { priority: -1 }, limit: 50, fallback: staticResources },
	);

	const typeFilteredResources = React.useMemo(() => {
		return type ? rawResources.filter((r) => r.type === type) : [...rawResources];
	}, [rawResources, type]);

	const allResources = React.useMemo(
		() =>
			categoryParam
				? typeFilteredResources.filter((r) => r.category === categoryParam)
				: typeFilteredResources,
		[typeFilteredResources, categoryParam],
	);

	// Group resources by category
	const categories = React.useMemo(() => {
		const grouped = new Map<string, typeof allResources>();
		for (const resource of allResources) {
			const cat = resource.category;
			if (!grouped.has(cat)) {
				grouped.set(cat, []);
			}
			grouped.get(cat)!.push(resource);
		}
		return grouped;
	}, [allResources]);

	// Derive pills from the type-filtered set so the selector stays visible after a category is chosen.
	const uniqueCategories = React.useMemo(
		() => Array.from(new Set(typeFilteredResources.map((r) => r.category))),
		[typeFilteredResources],
	);

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
				{uniqueCategories.length > 1 && (
					<div className="mb-8 flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => updateParams({ category: undefined })}
							className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
								!categoryParam
									? "bg-sage-dark text-white"
									: "bg-white border border-stone text-[#4A4640] hover:bg-stone"
							}`}
						>
							All
						</button>
						{uniqueCategories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => updateParams({ category: cat })}
								className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
									categoryParam === cat
										? "bg-sage-dark text-white"
										: "bg-white border border-stone text-[#4A4640] hover:bg-stone"
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				)}

				{/* Resources Grouped by Category */}
				{allResources.length > 0 ? (
					<div className="space-y-10">
						{Array.from(categories.entries()).map(
							([categoryName, resources]) => (
								<div key={categoryName}>
									<h2 className="text-xl font-bold text-[#2D2A24] mb-4 pb-2 border-b border-stone">
										{categoryName}
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{resources.map((resource) => {
											const typeColor =
												TYPE_COLORS[resource.type] ||
												"bg-stone text-[#4A4640] border-stone";

											const content = (
												<div className="group bg-white rounded-lg border border-stone p-5 hover:shadow-md transition-shadow h-full">
													<div className="flex items-start gap-3">
														{/* Icon */}
														<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sage/10 text-sage-dark flex items-center justify-center">
															{getIconElement(resource.icon)}
														</div>

														<div className="flex-1 min-w-0">
															{/* Type Badge */}
															<span
																className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border mb-1.5 ${typeColor}`}
															>
																{TYPE_LABELS[resource.type] || resource.type}
															</span>

															<h3 className="text-base font-semibold text-[#2D2A24] group-hover:text-sage-dark transition-colors">
																{resource.title}
															</h3>

															<div
																className="text-base text-[#4A4640] mt-1 line-clamp-2 prose prose-sm max-w-none"
																dangerouslySetInnerHTML={{
																	__html: sanitizeHtml(resource.description || "", { stripLinks: true }),
																}}
															/>

															{/* Contact Info */}
															{(resource.contactPhone ||
																resource.contactEmail) && (
																<div className="mt-2 space-y-0.5 text-sm text-[#635E56]">
																	{resource.contactPhone && (
																		<p>Phone: {resource.contactPhone}</p>
																	)}
																	{resource.contactEmail && (
																		<p>Email: {resource.contactEmail}</p>
																	)}
																</div>
															)}
														</div>
													</div>
												</div>
											);

											if (resource.type === "document" && resource.externalUrl) {
												return (
													<DocumentViewerDialog
														key={resource.slug}
														url={resource.externalUrl}
														title={resource.title}
													>
														<button type="button" className="text-left w-full">
															{content}
														</button>
													</DocumentViewerDialog>
												);
											}

											if (resource.externalUrl) {
												const isInternal = !isExternalUrl(resource.externalUrl);
												if (isInternal) {
													return (
														<Link key={resource.slug} href={resource.externalUrl}>
															{content}
														</Link>
													);
												}
												return (
													<a
														key={resource.slug}
														href={resource.externalUrl}
														target="_blank"
														rel="noopener noreferrer"
													>
														{content}
													</a>
												);
											}

											return (
												<div key={resource.slug}>
													{content}
												</div>
											);
										})}
									</div>
								</div>
							),
						)}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-[#635E56] text-lg">No resources found.</p>
					</div>
				)}
			</div>
		</section>
	);
};
