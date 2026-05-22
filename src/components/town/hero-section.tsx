import Link from "next/link";
import { getMediaUrl } from "@/lib/utils/get-media-url";
import { getHomepage } from "@/lib/town-data";
import { fetchBuilderContent } from "@/lib/builder-data-server";

interface BuilderHomepageSlide {
	title: string;
	subtitle?: string;
	description?: string;
	image?: string;
	ctaText?: string;
	ctaHref?: string;
}

export async function HeroSection() {
	const homepage = await getHomepage();
	const staticSlide = (homepage as any)?.heroSlides?.[0];

	let firstSlide = staticSlide;
	try {
		const { results } = await fetchBuilderContent<BuilderHomepageSlide>("town-homepage-slide", {
			sort: { priority: -1 },
			limit: 1,
		});
		if (results.length > 0) {
			firstSlide = results[0];
		}
	} catch (err) {
		console.error("Failed to fetch homepage slides from Builder.io:", err);
	}

	const heroImageUrl = firstSlide?.image ? getMediaUrl(firstSlide.image) : null;

	return (
		<section className="bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white relative overflow-hidden">
			<div className="container mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 min-h-[460px]">
					{/* Content */}
					<div className="flex flex-col justify-center py-12 px-4 lg:py-16 lg:pr-12">
						<div className="inline-flex items-center gap-2 bg-wheat/15 border border-wheat/30 text-[#E8D5A3] px-3.5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide w-fit mb-5">
							Est. 1927 &middot; Iredell County
						</div>
						<h1 className="text-3xl md:text-[42px] font-serif font-bold leading-[1.15] mb-4 text-balance">
							{firstSlide?.title ?? "Welcome to the Town of Harmony"}
						</h1>
						<p className="text-lg text-white/90 mb-8 max-w-[480px] leading-relaxed">
							{firstSlide?.description ??
								"Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit."}
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								href={firstSlide?.ctaHref ?? "/history"}
								className="inline-flex items-center gap-2 bg-wheat text-sage-deep px-7 py-3.5 rounded-lg text-[15px] font-bold hover:bg-wheat-light transition-colors cursor-pointer"
							>
								{firstSlide?.ctaText ?? "Discover Harmony"}
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
						{heroImageUrl ? (
							<img
								src={heroImageUrl}
								alt={firstSlide?.title ?? "Town of Harmony"}
								className="absolute inset-0 w-full h-full object-cover"
							/>
						) : (
							<div className="absolute inset-0 bg-gradient-to-br from-wheat/[0.08] to-wheat/[0.04]" />
						)}
						{!heroImageUrl && (
							<div className="w-[280px] h-[280px] border-[3px] border-wheat/30 rounded-full flex items-center justify-center relative z-10">
								<span className="font-serif text-[80px] text-wheat/35 italic">H</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
