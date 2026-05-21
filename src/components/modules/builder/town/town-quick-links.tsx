"use client";

import Link from "next/link";
import {
	AlertCircle,
	Briefcase,
	Calendar,
	FileText,
	Home,
	Phone,
	Star,
	Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isHrefHidden } from "@/lib/hidden-hrefs";
import { getNavigationSync } from "@/lib/town-data-client";

const iconMap: Record<string, LucideIcon> = {
	FileText,
	Calendar,
	Users,
	AlertCircle,
	Briefcase,
	Home,
	Phone,
	Star,
};

interface QuickLinkItem {
	icon?: string;
	title: string;
	description: string;
	href: string;
}

interface TownQuickLinksProps {
	links?: QuickLinkItem[];
}

export const TownQuickLinks = ({ links }: TownQuickLinksProps) => {
	const allLinks: QuickLinkItem[] =
		links && links.length > 0
			? links
			: getNavigationSync().quickLinks.map((ql) => ({
					icon: ql.icon,
					title: ql.title,
					description: ql.description,
					href: ql.href,
				}));

	const resolvedLinks = allLinks.filter((link) => !isHrefHidden(link.href));

	return (
		<section className="py-16 bg-cream">
			<div className="container mx-auto px-4">
				<div className="text-center mb-10">
					<h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
						Town Services
					</h2>
					<p className="text-[#4A4640] text-base">
						Find what you need quickly
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{resolvedLinks.map((link) => {
						const Icon = link.icon
							? iconMap[link.icon] ?? FileText
							: FileText;
						return (
							<Link
								key={link.title}
								href={link.href}
								className="group flex items-start gap-4 bg-warm-white p-6 rounded-xl border border-[#DDD7CC] hover:border-sage-light hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
							>
								<div className="w-11 h-11 bg-stone rounded-[10px] flex items-center justify-center text-sage-dark flex-shrink-0 group-hover:bg-sage-dark group-hover:text-wheat transition-colors">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold text-base text-[#2D2A24] mb-1">
										{link.title}
									</h3>
									<p className="text-[13px] text-[#4A4640]">
										{link.description}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
};
