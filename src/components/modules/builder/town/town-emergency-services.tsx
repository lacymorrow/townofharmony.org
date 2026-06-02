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

export const TownEmergencyServices = () => {
	const { data: services, loading } = useBuilderData<TownEmergencyService>(
		"town-emergency-service",
		{ sort: { priority: -1 }, limit: 50, fallback: emergencyServices },
	);

	if (loading) {
		return (
			<section className="py-12 bg-warm-white">
				<div className="container mx-auto px-4">
					<div className="space-y-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="rounded-xl border border-stone/30 p-8 animate-pulse">
								<div className="h-10 w-32 bg-stone/40 rounded mb-3" />
								<div className="h-5 w-64 bg-stone/20 rounded" />
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	// Separate immediate/critical numbers from the rest
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
		<section className="py-12 bg-warm-white">
			<div className="container mx-auto px-4">
				{/* Critical numbers — big, unmissable */}
				{immediate.length > 0 && (
					<div className="mb-10">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{immediate.map((service) => {
								const Icon = iconMap[service.icon] ?? Phone;
								const is911 = service.phone === "911";

								return (
									<div
										key={service.title}
										className={`block whitespace-normal rounded-2xl p-8 transition-shadow hover:shadow-lg ${
											is911
												? "bg-red-600 text-white col-span-full"
												: "bg-red-50 border-2 border-red-200 text-red-900"
										}`}
									>
										<a
											href={`tel:${service.phone.replace(/[^0-9+]/g, "")}`}
											className="block"
										>
											<div className="flex items-center gap-4 mb-3">
												<Icon className={`h-8 w-8 ${is911 ? "text-white/90" : "text-red-600"}`} />
												<span className={`text-lg font-semibold ${is911 ? "text-white/90" : "text-red-800"}`}>
													{service.title}
												</span>
											</div>
											<div className={`font-bold font-mono tracking-wide ${is911 ? "text-6xl md:text-7xl" : "text-3xl sm:text-4xl md:text-5xl"}`}>
												{service.phone}
											</div>
											<p className={`mt-3 text-base leading-relaxed ${is911 ? "text-white/80" : "text-red-700"}`}>
												{service.description}
											</p>
										</a>
										{service.address && (
											<a
												href={getMapUrl(service.address)}
												target="_blank"
												rel="noopener noreferrer"
												className={`mt-4 inline-flex items-start gap-2 text-sm hover:underline transition-colors ${
													is911 ? "text-white/90" : "text-red-800"
												}`}
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
							})}
						</div>
					</div>
				)}

				{/* Other services — clear and scannable */}
				{categoryOrder.map((cat) => {
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

													<a
														href={`tel:${service.phone.replace(/[^0-9+]/g, "")}`}
														className="inline-flex items-center gap-2 text-2xl font-bold font-mono text-sage-deep hover:text-sage-dark transition-colors mb-2"
													>
														<Phone className="h-5 w-5" />
														{service.phone}
													</a>

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
	);
};
