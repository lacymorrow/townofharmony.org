"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface TownHeroBannerProps {
	title?: string;
	subtitle?: string;
	image?: string;
	ctaText?: string;
	ctaHref?: string;
}

export const TownHeroBanner = ({
	title = "Welcome to the Town of Harmony",
	subtitle = "Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit.",
	image,
	ctaText = "Discover Harmony",
	ctaHref = "/history",
}: TownHeroBannerProps) => {
	return (
		<section className="bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white relative overflow-hidden">
			<div className="container mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 min-h-[460px]">
					<div className="flex flex-col justify-center py-12 px-4 lg:py-16 lg:pr-12">
						<div className="inline-flex items-center gap-2 bg-wheat/15 border border-wheat/30 text-[#E8D5A3] px-3.5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide w-fit mb-5">
							Est. 1927 &middot; Iredell County
						</div>
						<h2 className="text-3xl md:text-[42px] font-serif font-bold leading-[1.15] mb-4 text-balance">
							{title}
						</h2>
						<p className="text-lg text-white/90 mb-8 max-w-[480px] leading-relaxed">
							{subtitle}
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								href={ctaHref}
								className="inline-flex items-center gap-2 bg-wheat text-sage-deep px-7 py-3.5 rounded-lg text-[15px] font-bold hover:bg-wheat-light transition-colors"
							>
								{ctaText}
							</Link>
						</div>
					</div>

					<div className="hidden lg:flex items-center justify-center relative overflow-hidden">
						{image ? (
							<Dialog>
								<DialogTrigger asChild>
									<button
										type="button"
										className="group absolute inset-0 cursor-zoom-in overflow-hidden p-0 m-0 bg-transparent border-0"
									>
										<span className="sr-only">View {title} full size</span>
										<Image
											src={image}
											alt={title}
											fill
											priority
											sizes="(max-width: 1024px) 0px, 50vw"
											className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
										/>
									</button>
								</DialogTrigger>
								<DialogContent className="border-none bg-transparent p-0 shadow-none w-fit max-w-[95vw] sm:max-w-[90vw] [&>button]:bg-background/70 [&>button]:hover:bg-background [&>button]:rounded-full [&>button]:p-1">
									<VisuallyHidden>
										<DialogTitle>{title}</DialogTitle>
										<DialogDescription>Full-size view of {title}.</DialogDescription>
									</VisuallyHidden>
									<img
										src={image}
										alt={title}
										className="block max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg object-contain"
									/>
								</DialogContent>
							</Dialog>
						) : (
							<>
								<div className="absolute inset-0 bg-gradient-to-br from-wheat/[0.08] to-wheat/[0.04]" />
								<div className="w-[280px] h-[280px] border-[3px] border-wheat/30 rounded-full flex items-center justify-center relative z-10">
									<span className="font-serif text-[80px] text-wheat/35 italic">H</span>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
