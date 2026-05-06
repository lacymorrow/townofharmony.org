"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useBuilderData } from "@/lib/builder-data";
import { announcements as staticAnnouncements } from "@/data/town/announcements";
import type { TownAnnouncement } from "@/data/town/types";

interface TownEmergencyAlertsListProps {
	showAll?: boolean;
	limit?: number;
}

const levelConfig: Record<
	string,
	{
		icon: LucideIcon;
		bg: string;
		border: string;
		badge: string;
		badgeText: string;
		text: string;
	}
> = {
	critical: {
		icon: AlertCircle,
		bg: "bg-red-50",
		border: "border-red-300",
		badge: "bg-red-600",
		badgeText: "text-white",
		text: "text-red-800",
	},
	warning: {
		icon: AlertTriangle,
		bg: "bg-amber-50",
		border: "border-amber-300",
		badge: "bg-amber-500",
		badgeText: "text-white",
		text: "text-amber-800",
	},
	info: {
		icon: Info,
		bg: "bg-blue-50",
		border: "border-blue-300",
		badge: "bg-blue-600",
		badgeText: "text-white",
		text: "text-blue-800",
	},
};

export const TownEmergencyAlertsList = ({
	showAll = false,
	limit = 10,
}: TownEmergencyAlertsListProps) => {
	const { data: allAnnouncements } = useBuilderData<TownAnnouncement>(
		"town-announcement",
		{ limit: 50, fallback: staticAnnouncements },
	);

	const alerts = (() => {
		if (showAll) {
			return [...allAnnouncements]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
		const now = new Date().toISOString();
		return allAnnouncements.filter((a) => {
			if (!a.isActive) return false;
			if (a.startsAt && a.startsAt > now) return false;
			if (a.endsAt && a.endsAt < now) return false;
			return true;
		});
	})();

	const displayAlerts = alerts.slice(0, limit);

	// Don't render anything if there are no alerts
	if (displayAlerts.length === 0) {
		return null;
	}

	return (
		<section className="py-10 bg-warm-white">
			<div className="container mx-auto px-4">
				<div className="space-y-4">
					{displayAlerts.map((alert) => {
						const config = (levelConfig[alert.level] ?? levelConfig.info)!;
						const Icon = config.icon;
						const createdDate = new Date(
							alert.createdAt,
						).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						});
						const endsDate = alert.endsAt
							? new Date(alert.endsAt).toLocaleDateString(
									"en-US",
									{
										month: "long",
										day: "numeric",
										year: "numeric",
									},
								)
							: null;

						return (
							<div
								key={alert.title}
								className={`${config.bg} ${config.border} border rounded-xl p-6`}
							>
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 mt-0.5">
										<Icon
											className={`h-5 w-5 ${config.text}`}
										/>
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-3 mb-2 flex-wrap">
											<span
												className={`${config.badge} ${config.badgeText} text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full`}
											>
												{alert.level}
											</span>
											<span className="text-base text-[#4A4640]">
												Posted {createdDate}
											</span>
											{endsDate && (
												<span className="text-base text-[#4A4640]">
													Expires {endsDate}
												</span>
											)}
											{!alert.isActive && (
												<span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
													Inactive
												</span>
											)}
										</div>

										<h3
											className={`font-semibold text-[17px] mb-2 ${config.text}`}
										>
											{alert.title}
										</h3>

										<p className="text-base text-[#4A4640] leading-relaxed mb-3">
											{alert.content}
										</p>

										{alert.affectedAreas &&
											alert.affectedAreas.length > 0 && (
												<div className="mb-3">
													<p className="text-xs font-semibold text-[#4A4640] uppercase tracking-wider mb-1">
														Affected Areas
													</p>
													<div className="flex flex-wrap gap-1.5">
														{alert.affectedAreas.map(
															(area) => (
																<span
																	key={area}
																	className="bg-white/70 text-[#4A4640] text-xs px-2.5 py-0.5 rounded-full border border-[#DDD7CC]"
																>
																	{area}
																</span>
															),
														)}
													</div>
												</div>
											)}

										{alert.instructions &&
											alert.instructions.length > 0 && (
												<div className="mt-3 pt-3 border-t border-[#DDD7CC]/50">
													<p className="text-xs font-semibold text-[#4A4640] uppercase tracking-wider mb-2">
														Instructions
													</p>
													<ol className="space-y-1 list-decimal list-inside">
														{alert.instructions.map(
															(
																instruction,
																i,
															) => (
																<li
																	key={i}
																	className="text-base text-[#4A4640]"
																>
																	{
																		instruction
																	}
																</li>
															),
														)}
													</ol>
												</div>
											)}

										{alert.externalUrl && (
											<a
												href={alert.externalUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-sage hover:text-sage-dark transition-colors"
											>
												More Information &rarr;
											</a>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};
