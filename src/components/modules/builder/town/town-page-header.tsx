"use client";

import { cn } from "@/lib/utils";

interface TownPageHeaderProps {
	title: string;
	subtitle?: string;
	variant?: "sage" | "wheat" | "barn-red";
	customBgColor?: string;
}

const variantStyles: Record<
	NonNullable<TownPageHeaderProps["variant"]>,
	string
> = {
	sage: "bg-sage-dark text-white",
	wheat: "bg-wheat text-sage-dark",
	"barn-red": "bg-barn-red text-white",
};

export const TownPageHeader = ({
	title,
	subtitle,
	variant = "sage",
	customBgColor,
}: TownPageHeaderProps) => {
	const sectionStyle = customBgColor ? { backgroundColor: customBgColor } : undefined;
	const variantClass = customBgColor ? "" : variantStyles[variant];

	return (
		<section className={cn("w-full py-12", variantClass)} style={sectionStyle}>
			<div className="container mx-auto px-4">
				<h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
					{title}
				</h1>
				{subtitle && (
					<p
						className={cn(
							"text-lg max-w-2xl",
							variant === "wheat" && !customBgColor
								? "text-sage-deep"
								: "text-white/90",
						)}
					>
						{subtitle}
					</p>
				)}
			</div>
		</section>
	);
};
