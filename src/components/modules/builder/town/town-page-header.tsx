"use client";

import { cn } from "@/lib/utils";

interface TownPageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "sage" | "wheat" | "barn-red";
  customBgColor?: string;
}

const variantStyles: Record<NonNullable<TownPageHeaderProps["variant"]>, string> = {
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
        <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && (
          <p
            className={cn(
              "max-w-2xl text-lg",
              variant === "wheat" && !customBgColor ? "text-sage-deep" : "text-white/90"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};
