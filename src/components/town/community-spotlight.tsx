import Link from "next/link";

export function CommunitySpotlight() {
	return (
		<section className="py-16 bg-cream">
			<div className="container mx-auto px-4">
				<div className="bg-warm-white rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#DDD7CC]">
					{/* Image area */}
					<div className="bg-gradient-to-br from-sage-dark to-sage min-h-[320px] flex items-center justify-center">
						<span className="font-serif text-[56px] text-wheat italic opacity-50">&ldquo;H&rdquo;</span>
					</div>

					{/* Content */}
					<div className="p-12 flex flex-col justify-center">
						<div className="bg-sage/10 text-sage-dark px-3 py-1 rounded text-xs font-bold uppercase tracking-wider w-fit mb-4">
							Community Spotlight
						</div>
						<h3 className="text-2xl font-serif font-bold text-sage-dark mb-3">
							Harmony Hill Camp Meeting
						</h3>
						<p className="text-base text-[#4A4640] leading-relaxed mb-5">
							A two-week revival tradition first held in 1846, the Harmony Hill Camp Meeting still gathers each year on the second weekend of October on the grounds of present-day Harmony Elementary School. The town takes its name from these meetings.
						</p>
						<Link
							href="/history"
							className="text-sage font-semibold text-base hover:text-sage-dark hover:underline transition-colors cursor-pointer"
						>
							Learn More &rarr;
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
