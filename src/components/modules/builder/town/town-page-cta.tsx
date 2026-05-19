"use client";

import Link from "next/link";

interface TownPageCtaProps {
	heading?: string;
	body?: string;
	ctaText?: string;
	ctaHref?: string;
	variant?: "primary" | "secondary";
}

export const TownPageCta = ({
	heading = "Get Involved",
	body,
	ctaText = "Learn More",
	ctaHref = "/about",
	variant = "primary",
}: TownPageCtaProps) => {
	const isPrimary = variant === "primary";

	return (
		<section
			className={
				isPrimary
					? "bg-sage-deep text-white py-16"
					: "bg-[#F5F0E8] border-t border-[#DDD7CC] py-16"
			}
		>
			<div className="container mx-auto px-4 text-center max-w-2xl">
				<h2
					className={`text-3xl font-serif font-bold mb-4 ${isPrimary ? "text-white" : "text-sage-dark"}`}
				>
					{heading}
				</h2>
				{body && (
					<p className={`text-lg mb-8 leading-relaxed ${isPrimary ? "text-white/85" : "text-[#635E56]"}`}>
						{body}
					</p>
				)}
				{ctaText && ctaHref && (
					<Link
						href={ctaHref}
						className={
							isPrimary
								? "inline-flex items-center gap-2 bg-wheat text-sage-deep px-8 py-3.5 rounded-lg text-[15px] font-bold hover:bg-wheat-light transition-colors"
								: "inline-flex items-center gap-2 bg-sage text-white px-8 py-3.5 rounded-lg text-[15px] font-bold hover:bg-sage-dark transition-colors"
						}
					>
						{ctaText}
					</Link>
				)}
			</div>
		</section>
	);
};
