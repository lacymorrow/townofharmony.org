import {
	AlertCircle,
	Briefcase,
	Calendar,
	CreditCard,
	FileText,
	Home,
	Map,
	Phone,
	Star,
	Users,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { navigation } from "@/data/town/navigation";

const iconMap: Record<string, LucideIcon> = {
	FileText,
	Calendar,
	AlertCircle,
	Users,
	Map,
	Briefcase,
	Home,
	Phone,
	Star,
	CreditCard,
};

const HIDDEN_HREFS = new Set<string>([
	...(process.env.NEXT_PUBLIC_FEATURE_SEWER_ENABLED !== "true" ? ["/sewer", "/pay/sewer"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_MAP_ENABLED !== "true" ? ["/map"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_EVENTS_ENABLED !== "true" ? ["/events"] : []),
]);

export function QuickLinks() {
	const quickLinks = navigation.quickLinks.filter((link) => !HIDDEN_HREFS.has(link.href));

	return (
		<section className="py-16 bg-cream">
			<div className="container mx-auto px-4">
				<div className="text-center mb-10">
					<h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
						Town Services
					</h2>
					<p className="text-[#4A4640] text-base">Find what you need quickly</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{quickLinks.map((link) => {
						const Icon = iconMap[link.icon] ?? FileText;
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
									<p className="font-semibold text-base text-[#2D2A24] mb-1">{link.title}</p>
									<p className="text-[13px] text-[#4A4640]">{link.description}</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
