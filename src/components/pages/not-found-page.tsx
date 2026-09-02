// This must be a server component

import { Calendar, FileText, Home, MapPin, Phone, Users } from "lucide-react";
import Link from "next/link";
import { renderCopyright, settings as staticSettings } from "@/data/town/settings";
import type { TownSettings } from "@/data/town/types";

const helpfulLinks = [
	{
		title: "Upcoming Events",
		description: "View community events and activities",
		href: "/events",
		Icon: Calendar,
	},
	{
		title: "Town Meetings",
		description: "Agendas, minutes, and schedules",
		href: "/meetings",
		Icon: Users,
	},
	{
		title: "Resident Resources",
		description: "Documents and information for residents",
		href: "/resources",
		Icon: FileText,
	},
	{
		title: "Contact Us",
		description: "Reach the town office directly",
		href: "/contact",
		Icon: Phone,
	},
];

interface NotFoundPageProps {
	settings?: TownSettings;
}

export const NotFoundPage = ({ settings = staticSettings }: NotFoundPageProps = {}) => {
	return (
		<div className="min-h-screen flex flex-col">
			{/* Simplified header */}
			<header className="bg-warm-white border-b border-[#DDD7CC] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
				<div className="container mx-auto px-4 py-4">
					<Link href="/" className="flex items-center gap-4 w-fit">
						<div
							className="w-12 h-14 bg-sage-dark flex items-center justify-center text-[#E8D5A3] font-serif text-base font-bold flex-shrink-0"
							style={{
								clipPath:
									"polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)",
							}}
						>
							TH
						</div>
						<div>
							<span className="text-xl font-serif font-bold text-sage-dark block">
								{settings.siteTitle}
							</span>
							<span className="text-xs text-[#635E56] uppercase tracking-[1.5px] font-semibold">
								{settings.branding.county}, {settings.branding.state}
							</span>
						</div>
					</Link>
				</div>
			</header>

			{/* Hero section */}
			<section className="bg-sage-dark text-white py-16">
				<div className="container mx-auto px-4">
					<span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 text-white/70 px-3 py-1 rounded-full border border-white/20 mb-6">
						{settings.notFound.eyebrow}
					</span>
					<h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
						{settings.notFound.heading}
					</h1>
					<p className="text-white/80 text-lg max-w-2xl mb-8">
						{settings.notFound.body}
					</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 bg-wheat text-sage-deep font-semibold px-6 py-3 rounded-lg hover:bg-wheat-light transition-colors"
					>
						<Home className="h-4 w-4" />
						{settings.notFound.ctaLabel}
					</Link>
				</div>
			</section>

			{/* Helpful links */}
			<section className="flex-grow py-16 bg-cream">
				<div className="container mx-auto px-4">
					<h2 className="text-2xl font-serif font-bold text-sage-dark mb-2">
						Common Services
					</h2>
					<p className="text-[#4A4640] mb-8">
						Find what you need using one of these frequently visited pages.
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{helpfulLinks.map(({ title, description, href, Icon }) => (
							<Link
								key={href}
								href={href}
								className="group flex items-start gap-4 bg-warm-white p-6 rounded-xl border border-[#DDD7CC] hover:border-sage-light hover:shadow-md hover:-translate-y-0.5 transition-all"
							>
								<div className="w-11 h-11 bg-stone rounded-[10px] flex items-center justify-center text-sage-dark flex-shrink-0 group-hover:bg-sage-dark group-hover:text-wheat transition-colors">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<p className="font-semibold text-base text-[#2D2A24] mb-1">
										{title}
									</p>
									<p className="text-[13px] text-[#4A4640]">{description}</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Contact strip */}
			<section className="bg-warm-white border-t border-[#DDD7CC] py-12">
				<div className="container mx-auto px-4">
					<h2 className="text-xl font-serif font-bold text-sage-dark mb-6">
						Still need help?
					</h2>
					<div className="flex flex-col sm:flex-row gap-8 max-w-3xl">
						<a
							href={`tel:${settings.contactInfo.phone.replace(/[^\d+]/g, "")}`}
							className="flex items-center gap-3 group"
						>
							<div className="w-10 h-10 bg-sage-dark rounded-lg flex items-center justify-center flex-shrink-0">
								<Phone className="h-5 w-5 text-wheat" />
							</div>
							<div>
								<p className="text-sm font-semibold text-[#2D2A24]">Call us</p>
								<p className="text-sage text-sm group-hover:text-sage-dark transition-colors">
									{settings.contactInfo.phone}
								</p>
							</div>
						</a>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-sage-dark rounded-lg flex items-center justify-center flex-shrink-0">
								<MapPin className="h-5 w-5 text-wheat" />
							</div>
							<div>
								<p className="text-sm font-semibold text-[#2D2A24]">Office hours</p>
								<p className="text-[#4A4640] text-sm">{settings.officeHours.weekday}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Minimal footer */}
			<footer className="bg-[#1E2118] text-white/60 py-6">
				<div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
					<span>{renderCopyright(settings.footer.copyright, settings.siteTitle)}</span>
					<Link
						href="/"
						className="text-wheat hover:text-wheat-light transition-colors"
					>
						Return to homepage
					</Link>
				</div>
			</footer>
		</div>
	);
};
