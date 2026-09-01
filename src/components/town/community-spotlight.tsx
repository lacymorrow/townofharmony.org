import Link from "next/link";
import { getSettings } from "@/lib/town-data";

export async function CommunitySpotlight() {
	const { homepage } = await getSettings();

	return (
		<section className="py-16 bg-cream">
			<div className="container mx-auto px-4">
				<div className="bg-warm-white rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#DDD7CC]">
					{/* Image area */}
					<div className="bg-gradient-to-br from-sage-dark to-sage min-h-[320px] flex items-center justify-center">
						<span className="font-serif text-[56px] text-wheat italic opacity-50">
							&ldquo;{homepage.spotlightImageLetter}&rdquo;
						</span>
					</div>

					{/* Content */}
					<div className="p-12 flex flex-col justify-center">
						<div className="bg-sage/10 text-sage-dark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider w-fit mb-4">
							{homepage.spotlightBadge}
						</div>
						<h2 className="text-2xl font-serif font-bold text-sage-dark mb-3">
							{homepage.spotlightTitle}
						</h2>
						<p className="text-base text-[#4A4640] leading-relaxed mb-5">
							{homepage.spotlightDescription}
						</p>
						<Link
							href={homepage.spotlightCtaHref}
							className="text-sage font-semibold text-base hover:text-sage-dark hover:underline transition-colors cursor-pointer"
						>
							{homepage.spotlightCtaText} &rarr;
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
