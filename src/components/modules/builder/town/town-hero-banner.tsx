"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { DataLink } from "@/components/primitives/data-link";
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
    <section className="relative overflow-hidden bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white">
      <div className="container mx-auto">
        <div className="grid min-h-[460px] grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-4 py-12 lg:py-16 lg:pr-12">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-wheat/30 bg-wheat/15 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#E8D5A3]">
              Est. 1927 &middot; Iredell County
            </div>
            <h2 className="mb-4 text-balance font-serif text-3xl font-bold leading-[1.15] md:text-[42px]">
              {title}
            </h2>
            <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-white/90">{subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <DataLink
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-wheat px-7 py-3.5 text-[15px] font-bold text-sage-deep transition-colors hover:bg-wheat-light"
              >
                {ctaText}
              </DataLink>
            </div>
          </div>

          <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
            {image ? (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group absolute inset-0 m-0 cursor-zoom-in overflow-hidden border-0 bg-transparent p-0"
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
                <DialogContent className="w-fit max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] [&>button]:rounded-full [&>button]:bg-background/70 [&>button]:p-1 [&>button]:hover:bg-background">
                  <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Full-size view of {title}.</DialogDescription>
                  </VisuallyHidden>
                  <img
                    src={image}
                    alt={title}
                    className="block h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-lg object-contain"
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-wheat/[0.08] to-wheat/[0.04]" />
                <div className="relative z-10 flex h-[280px] w-[280px] items-center justify-center rounded-full border-[3px] border-wheat/30">
                  <span className="font-serif text-[80px] italic text-wheat/35">H</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
