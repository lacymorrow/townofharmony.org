"use client";

import Link from "next/link";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { getHomepageSync } from "@/lib/town-data-client";

interface TownHeroProps {
	title?: string;
	subtitle?: string;
	image?: string;
	ctaText?: string;
	ctaHref?: string;
}

export const TownHero = ({
	title,
	subtitle,
	image,
	ctaText,
	ctaHref,
}: TownHeroProps) => {
	const homepage = getHomepageSync();
	const firstSlide = homepage?.heroSlides?.[0];

	const heroTitle = title || firstSlide?.title || "Welcome to the Town of Harmony";
	const heroSubtitle =
		subtitle ||
		firstSlide?.description ||
		"Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit.";
	const heroImage = image || firstSlide?.image || null;
	const heroCta = ctaText || firstSlide?.ctaText || "Discover Harmony";
	const heroHref = ctaHref || firstSlide?.ctaHref || "/history";

	return (
		<section className="bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white relative overflow-hidden">
			<div className="container mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 min-h-[460px]">
					{/* Content */}
					<div className="flex flex-col justify-center py-12 px-4 lg:py-16 lg:pr-12">
						<div className="inline-flex items-center gap-2 bg-wheat/15 border border-wheat/30 text-[#E8D5A3] px-3.5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide w-fit mb-5">
							Est. 1927 &middot; Iredell County
						</div>
						<h2 className="text-3xl md:text-[42px] font-serif font-bold leading-[1.15] mb-4 text-balance">
							{heroTitle}
						</h2>
						<p className="text-lg text-white/90 mb-8 max-w-[480px] leading-relaxed">
							{heroSubtitle}
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								href={heroHref}
								className="inline-flex items-center gap-2 bg-wheat text-sage-deep px-7 py-3.5 rounded-lg text-[15px] font-bold hover:bg-wheat-light transition-colors cursor-pointer"
							>
								{heroCta}
							</Link>
							<Link
								href="/meetings"
								className="inline-flex items-center gap-2 bg-white/10 text-white px-7 py-3.5 rounded-lg text-[15px] font-medium border border-white/20 hover:bg-white/15 hover:border-white/30 transition-colors cursor-pointer"
							>
								Meeting Agendas
							</Link>
						</div>
					</div>

					{/* Image area */}
					<div className="hidden lg:flex items-center justify-center relative overflow-hidden">
						{heroImage ? (
							<LightboxImage
								src={heroImage}
								alt={heroTitle}
								wrapperClassName="absolute inset-0 w-full h-full"
								className="w-full h-full object-cover"
								width={800}
								height={600}
							/>
						) : (
							<div className="absolute inset-0 bg-gradient-to-br from-wheat/[0.08] to-wheat/[0.04]" />
						)}
						{!heroImage && (
							<div className="w-[280px] h-[280px] border-[3px] border-wheat/30 rounded-full flex items-center justify-center relative z-10">
								<span className="font-serif text-[80px] text-wheat/35 italic">
									H
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
