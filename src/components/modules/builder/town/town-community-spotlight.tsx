"use client";

import Link from "next/link";
import { LightboxImage } from "@/components/ui/lightbox-image";

interface TownCommunitySpotlightProps {
	badge?: string;
	title?: string;
	description?: string;
	linkHref?: string;
	image?: string;
}

export const TownCommunitySpotlight = ({
	badge = "Community Spotlight",
	title = "Harmony Heritage Trail",
	description = "Walk through history along our newly restored Heritage Trail, connecting nine landmarks that tell the story of Harmony from its founding in 1927 to today.",
	linkHref = "/history",
	image,
}: TownCommunitySpotlightProps) => {
	return (
		<section className="py-16 bg-cream">
			<div className="container mx-auto px-4">
				<div className="bg-warm-white rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#DDD7CC]">
					{/* Image area */}
					<div className="bg-gradient-to-br from-sage-dark to-sage min-h-[320px] flex items-center justify-center relative overflow-hidden">
						{image ? (
							<LightboxImage
								src={image}
								alt={title}
								wrapperClassName="absolute inset-0 w-full h-full"
								className="w-full h-full object-cover"
								width={800}
								height={600}
							/>
						) : (
							<span className="font-serif text-[56px] text-wheat italic opacity-50">
								&ldquo;H&rdquo;
							</span>
						)}
					</div>

					{/* Content */}
					<div className="p-12 flex flex-col justify-center">
						<div className="bg-sage/10 text-sage-dark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider w-fit mb-4">
							{badge}
						</div>
						<h2 className="text-2xl font-serif font-bold text-sage-dark mb-3">
							{title}
						</h2>
						<p className="text-base text-[#4A4640] leading-relaxed mb-5">
							{description}
						</p>
						<Link
							href={linkHref}
							className="text-sage font-semibold text-[15px] hover:text-sage-dark hover:underline transition-colors cursor-pointer"
						>
							Learn More &rarr;
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};
