"use client";

import {
	AlertCircle,
	AlertTriangle,
	Flame,
	Heart,
	MapPin,
	Phone,
	Shield,
	ShieldAlert,
	Stethoscope,
	Wrench,
	Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { useBuilderData } from "@/lib/builder-data";
import { emergencyServices } from "@/data/town/emergency-services";
import type { TownEmergencyService } from "@/data/town/types";
import { getMapUrl } from "@/lib/map-utils";

const iconMap: Record<string, LucideIcon> = {
	Phone,
	Flame,
	Shield,
	Zap,
	Wrench,
	AlertTriangle,
	AlertCircle,
	Stethoscope,
	ShieldAlert,
	Heart,
};

interface TownEmergencyServicesProps {
	title?: string;
	subtitle?: string;
}

export const TownEmergencyServices = ({
	title = "Emergency Services",
	subtitle = "Emergency alerts, contacts, and preparedness",
}: TownEmergencyServicesProps) => {
	const { data: services, loading } = useBuilderData<TownEmergencyService>(
		"town-emergency-service",
		{ sort: { priority: -1 }, limit: 50, fallback: emergencyServices },
	);

	// Immediate/critical numbers (911) render inside the page header; the rest
	// render as category-grouped cards below.
	const immediate = services.filter((s) => s.category === "immediate");
	const other = services.filter((s) => s.category !== "immediate");

	// Group non-immediate by category
	const grouped: Record<string, typeof services> = {};
	for (const service of other) {
		const bucket = grouped[service.category] ?? [];
		bucket.push(service);
		grouped[service.category] = bucket;
	}

	const categoryOrder = ["public-safety", "utility", "health"];
	const categoryLabels: Record<string, string> = {
		"public-safety": "Public Safety",
		utility: "Utilities",
		health: "Health Services",
	};

	return (
		<>
			{/* Page header with critical numbers built in — big, unmissable */}
			<section className="bg-barn-red text-white py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
						<div>
							<h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
								{title}
							</h1>
							{subtitle && (
								<p className="text-lg text-white/90 max-w-2xl">{subtitle}</p>
							)}
						</div>

						<div className="space-y-4">
							{loading ? (
								<div className="rounded-2xl bg-white/10 p-6 animate-pulse">
									<div className="h-14 w-40 bg-white/20 rounded mb-3" />
									<div className="h-5 w-64 bg-white/10 rounded" />
								</div>
							) : (
								immediate.map((service) => {
									const Icon = iconMap[service.icon] ?? Phone;
									// Don't repeat the page title inside the call block
									const showLabel = service.title !== title;

									return (
										<div
											key={service.title}
											className="relative rounded-2xl bg-white/10 p-6 transition-colors hover:bg-white/15"
										>
											<div className="absolute top-4 right-4 z-10">
												<PhoneCopyButton
													phone={service.phone}
													label={service.title}
													tone="onDark"
												/>
											</div>
											<a
												href={`tel:${service.phone.replace(/[^\d+]/g, "")}`}
												className="block whitespace-normal"
											>
												<div className="flex items-center gap-4 pr-10">
													<Icon
														className="h-9 w-9 shrink-0 text-white/90"
														aria-hidden="true"
													/>
													<span className="font-bold font-mono tracking-wide text-5xl md:text-6xl">
														{service.phone}
													</span>
												</div>
												{showLabel && (
													<div className="mt-2 text-lg font-semibold text-white/90">
														{service.title}
													</div>
												)}
												<p className="mt-3 text-base leading-relaxed text-white/85">
													{service.description}
												</p>
											</a>
											{service.address && (
												<a
													href={getMapUrl(service.address)}
													target="_blank"
													rel="noopener noreferrer"
													className="mt-4 inline-flex items-start gap-2 text-sm text-white/90 hover:underline transition-colors"
												>
													<MapPin
														className="h-4 w-4 mt-0.5 shrink-0"
														aria-hidden="true"
													/>
													<span>{service.address}</span>
												</a>
											)}
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			</section>

			<section className="py-12 bg-warm-white">
				<div className="container mx-auto px-4">
					{loading && (
						<div className="space-y-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="rounded-xl border border-stone/30 p-8 animate-pulse"
								>
									<div className="h-10 w-32 bg-stone/40 rounded mb-3" />
									<div className="h-5 w-64 bg-stone/20 rounded" />
								</div>
							))}
						</div>
					)}

					{/* Other services — clear and scannable */}
					{!loading && categoryOrder.map((cat) => {
						const items = grouped[cat];
						if (!items || items.length === 0) return null;

						return (
							<div key={cat} className="mb-8 last:mb-0">
								<h2 className="text-xl font-bold text-[#2D2A24] mb-4 pb-2 border-b-2 border-sage/20">
									{categoryLabels[cat] ?? cat}
								</h2>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{items.map((service) => {
										const Icon = iconMap[service.icon] ?? Phone;

										return (
											<div
												key={service.title}
												className="bg-cream rounded-xl border border-[#DDD7CC] p-6"
											>
												<div className="flex items-start gap-4">
													<div className="w-11 h-11 bg-sage-dark/10 rounded-lg flex items-center justify-center flex-shrink-0">
														<Icon className="h-5 w-5 text-sage-dark" />
													</div>

													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-lg text-[#2D2A24] mb-1">
															{service.title}
														</h3>

														<div className="flex items-center gap-1 mb-2 flex-wrap">
															<a
																href={`tel:${service.phone.replace(/[^\d+]/g, "")}`}
																className="inline-flex items-center gap-2 text-2xl font-bold font-mono text-sage-deep hover:text-sage-dark transition-colors"
															>
																<Phone className="h-5 w-5" />
																{service.phone}
															</a>
															<PhoneCopyButton
																phone={service.phone}
																label={service.title}
															/>
														</div>

														<p className="text-base text-[#4A4640] leading-relaxed">
															{service.description}
														</p>

														{service.address && (
															<a
																href={getMapUrl(service.address)}
																target="_blank"
																rel="noopener noreferrer"
																className="mt-2 inline-flex items-start gap-2 text-sm text-[#4A4640] hover:text-sage-dark hover:underline transition-colors"
															>
																<MapPin
																	className="h-4 w-4 mt-0.5 shrink-0 text-[#635E56]"
																	aria-hidden="true"
																/>
																<span>{service.address}</span>
															</a>
														)}

														{service.preparedness.length > 0 && (
															<details className="mt-4 pt-3 border-t border-[#DDD7CC]">
																<summary className="text-sm font-semibold text-[#4A4640] uppercase tracking-wider cursor-pointer hover:text-sage-dark transition-colors">
																	Preparedness Tips
																</summary>
																<ul className="mt-2 space-y-1">
																	{service.preparedness.map((tip) => (
																		<li
																			key={tip}
																			className="text-sm text-[#4A4640] flex items-start gap-2"
																		>
																			<span className="text-sage mt-1 flex-shrink-0">&bull;</span>
																			{tip}
																		</li>
																	))}
																</ul>
															</details>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</>
	);
};
