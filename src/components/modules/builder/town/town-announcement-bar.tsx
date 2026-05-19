"use client";

import Link from "next/link";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface TownAnnouncementBarProps {
	message?: string;
	level?: "info" | "warning" | "critical";
	ctaText?: string;
	ctaHref?: string;
	isActive?: boolean;
	startsAt?: string;
	endsAt?: string;
}

const levelStyles: Record<string, { bar: string; badge: string; badgeLabel: string }> = {
	info: {
		bar: "bg-[#EAF3EA] border-b border-[#B8D4B8]",
		badge: "bg-sage text-white",
		badgeLabel: "Notice",
	},
	warning: {
		bar: "bg-[#FEF9EC] border-b border-[#F0D58C]",
		badge: "bg-[#B8860B] text-white",
		badgeLabel: "Warning",
	},
	critical: {
		bar: "bg-[#FEF2F2] border-b border-[#FECACA]",
		badge: "bg-barn-red text-white",
		badgeLabel: "Alert",
	},
};

export const TownAnnouncementBar = ({
	message,
	level = "info",
	ctaText,
	ctaHref,
	isActive = true,
	startsAt,
	endsAt,
}: TownAnnouncementBarProps) => {
	if (!isActive || !message) return null;

	const now = Date.now();
	if (startsAt && new Date(startsAt).getTime() > now) return null;
	if (endsAt && new Date(endsAt).getTime() < now) return null;

	const style = levelStyles[level] ?? levelStyles.info!;

	return (
		<div className={`${style.bar} py-2.5`}>
			<div className="container mx-auto px-4">
				<div className="flex items-center gap-3 text-sm">
					<span className={`${style.badge} px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide flex-shrink-0`}>
						{style.badgeLabel}
					</span>
					<div
						className="text-[#2D2A24] flex-1"
						dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
					/>
					{ctaText && ctaHref && (
						<Link
							href={ctaHref}
							className="text-sage font-semibold hover:text-sage-dark underline flex-shrink-0 text-sm"
						>
							{ctaText}
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};
