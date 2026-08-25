import { Facebook, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

import { navigation as defaultNavData } from "@/data/town/navigation";
import { renderCopyright } from "@/data/town/settings";
import type { TownNavigation, TownSettings } from "@/data/town/types";
import { BUILD_TIME_HIDDEN_HREFS, normalizeHref } from "@/lib/hidden-hrefs";
import { getMapUrl } from "@/lib/map-utils";

interface TownFooterProps {
	settings: TownSettings;
	/** Override hidden hrefs from a server component (supports preview cookie). Falls back to build-time env. */
	hiddenHrefs?: Set<string>;
	/** Navigation tree (defaults to static data). Server wrapper passes the Builder-merged version. */
	navData?: TownNavigation;
}

export function TownFooter({
	settings,
	hiddenHrefs = BUILD_TIME_HIDDEN_HREFS,
	navData = defaultNavData,
}: TownFooterProps) {
	const footerLinks = Object.fromEntries(
		navData.footerLinks.map((section) => [
			section.category,
			section.links.filter((link) => !hiddenHrefs.has(normalizeHref(link.href))),
		]),
	);
	return (
		<footer className="bg-[#1E2118] text-white/80">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
					{/* Town Info */}
					<div>
						<p className="text-xl font-serif font-bold text-white mb-2">{settings.siteTitle}</p>
						<p className="text-sm leading-relaxed mb-2">
							{settings.branding.tagline} Serving our community since {settings.branding.established}.
						</p>
						<p className="text-sm leading-relaxed">
							<a
								href={getMapUrl(settings.contactInfo.address)}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-wheat transition-colors"
							>
								{settings.contactInfo.address}
							</a>
							<br />
							<span className="whitespace-nowrap">{settings.contactInfo.phone}</span>
						</p>
						{(settings.officeHours.weekday || settings.officeHours.weekend) && (
							<p className="text-sm leading-relaxed mt-2">
								{settings.officeHours.weekday && <span>{settings.officeHours.weekday}</span>}
								{settings.officeHours.weekday && settings.officeHours.weekend && <br />}
								{settings.officeHours.weekend && <span>{settings.officeHours.weekend}</span>}
							</p>
						)}

						{/* Social Media */}
						{(settings.socialMedia.facebook || settings.socialMedia.twitter || settings.socialMedia.youtube) && (
						<div className="flex gap-3 mt-4">
							{settings.socialMedia.facebook && (
							<a
								href={settings.socialMedia.facebook}
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-sage transition-colors"
								aria-label="Facebook"
							>
								<Facebook className="h-4 w-4" />
							</a>
							)}
							{settings.socialMedia.twitter && (
							<a
								href={settings.socialMedia.twitter}
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-sage transition-colors"
								aria-label="Twitter"
							>
								<Twitter className="h-4 w-4" />
							</a>
							)}
							{settings.socialMedia.youtube && (
							<a
								href={settings.socialMedia.youtube}
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-sage transition-colors"
								aria-label="YouTube"
							>
								<Youtube className="h-4 w-4" />
							</a>
							)}
						</div>
						)}
					</div>

					{/* Footer Links */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<p className="text-[13px] text-white/85 uppercase tracking-[1.5px] font-bold mb-4">
								{category}
							</p>
							<ul className="space-y-2">
								{links.map((link) => (
									<li key={link.name}>
										<Link
											href={link.href}
											className="text-sm text-white/70 hover:text-wheat transition-colors"
										>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-white/[0.08] pt-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[13px]">
						<span>{renderCopyright(settings.footer.copyright, settings.siteTitle)}</span>
						<div className="flex gap-5">
							{settings.footer.legalLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-white/80 hover:text-wheat transition-colors"
								>
									{link.name}
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
