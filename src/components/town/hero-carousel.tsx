"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/utils/get-media-url";

export interface HeroSlide {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaHref?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplayDelayMs?: number;
}

export function HeroCarousel({ slides, autoplayDelayMs = 6000 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi || isPaused || prefersReducedMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayDelayMs);
    return () => window.clearInterval(id);
  }, [emblaApi, isPaused, prefersReducedMotion, slides.length, autoplayDelayMs]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="region" with aria-roledescription="carousel" is the WAI-ARIA carousel pattern
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage hero"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: slides are fetched with stable priority order; titles may repeat
            <HeroSlideView key={i} slide={slide} isActive={i === selectedIndex} />
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2 pl-4 pr-4 lg:justify-start">
          {slides.map((_, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: dots map 1:1 to slide indices
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-current={i === selectedIndex}
              className={cn(
                "h-2 rounded-full transition-all",
                i === selectedIndex ? "w-6 bg-wheat" : "w-2 bg-white/40 hover:bg-white/60"
              )}
            >
              <span className="sr-only">Go to slide {i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroSlideView({ slide, isActive }: { slide: HeroSlide; isActive: boolean }) {
  const heroImageUrl = slide.image ? getMediaUrl(slide.image) : null;
  const linkTabIndex = isActive ? 0 : -1;

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" with aria-roledescription="slide" is the WAI-ARIA carousel slide pattern
    <div
      className="min-w-0 shrink-0 grow-0 basis-full"
      role="group"
      aria-roledescription="slide"
      aria-hidden={!isActive}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[460px]">
        <div className="flex flex-col justify-center py-12 pl-4 pr-4 lg:py-16 lg:pr-12">
          <div className="inline-flex items-center gap-2 bg-wheat/15 border border-wheat/30 text-[#E8D5A3] px-3.5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide w-fit mb-5">
            Est. 1927 &middot; Iredell County
          </div>
          <h1 className="text-3xl md:text-[42px] font-serif font-bold leading-[1.15] mb-4 text-balance">
            {slide.title}
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-[480px] leading-relaxed">
            {slide.description ??
              "Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={slide.ctaHref ?? "/history"}
              className="inline-flex items-center gap-2 bg-wheat text-sage-deep px-7 py-3.5 rounded-lg text-[15px] font-bold hover:bg-wheat-light transition-colors cursor-pointer"
              tabIndex={linkTabIndex}
            >
              {slide.ctaText ?? "Discover Harmony"}
            </Link>
            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-7 py-3.5 rounded-lg text-[15px] font-medium border border-white/20 hover:bg-white/15 hover:border-white/30 transition-colors cursor-pointer"
              tabIndex={linkTabIndex}
            >
              Meeting Agendas
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
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
  );
}
