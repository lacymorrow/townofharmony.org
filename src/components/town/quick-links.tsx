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

import { getHiddenHrefs } from "@/lib/preview-flags";
import { getSettings } from "@/lib/town-data";
import { getBuilderNavigation } from "@/lib/town-navigation-server";

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

export async function QuickLinks() {
	const [hiddenHrefs, navigation, settings] = await Promise.all([
		getHiddenHrefs(),
		getBuilderNavigation(),
		getSettings(),
	]);
	const quickLinks = navigation.quickLinks.filter((link) => !hiddenHrefs.has(link.href));

	return (
		<section className="py-16 bg-cream">
			<div className="container mx-auto px-4">
				<div className="text-center mb-10">
					<h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
						{settings.homepage.quickLinksHeading}
					</h2>
					<p className="text-[#4A4640] text-base">{settings.homepage.quickLinksSubheading}</p>
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
									<Icon className="h-5 w-5" aria-hidden="true" />
								</div>
								<div>
									<p className="font-semibold text-base text-[#2D2A24] mb-1">{link.title}</p>
									<p className="text-sm text-[#4A4640]">{link.description}</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
