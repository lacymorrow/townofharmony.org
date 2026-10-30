"use client";

import { DataLink } from "@/components/primitives/data-link";

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
        isPrimary ? "bg-sage-deep py-16 text-white" : "border-t border-[#DDD7CC] bg-[#F5F0E8] py-16"
      }
    >
      <div className="container mx-auto max-w-2xl px-4 text-center">
        <h2
          className={`mb-4 font-serif text-3xl font-bold ${isPrimary ? "text-white" : "text-sage-dark"}`}
        >
          {heading}
        </h2>
        {body && (
          <p
            className={`mb-8 text-lg leading-relaxed ${isPrimary ? "text-white/85" : "text-[#635E56]"}`}
          >
            {body}
          </p>
        )}
        {ctaText && ctaHref && (
          <DataLink
            href={ctaHref}
            className={
              isPrimary
                ? "inline-flex items-center gap-2 rounded-lg bg-wheat px-8 py-3.5 text-[15px] font-bold text-sage-deep transition-colors hover:bg-wheat-light"
                : "inline-flex items-center gap-2 rounded-lg bg-sage px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-sage-dark"
            }
          >
            {ctaText}
          </DataLink>
        )}
      </div>
    </section>
  );
};
