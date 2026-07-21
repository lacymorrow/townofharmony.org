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
  video?: string;
  ctaText?: string;
  ctaHref?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplayDelayMs?: number;
}

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return prefers;
}

export function HeroCarousel({ slides, autoplayDelayMs = 6000 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

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

  const activeSlide = slides[selectedIndex];
  const activeIsVideo = Boolean(activeSlide?.video) && !prefersReducedMotion;

  React.useEffect(() => {
    if (!emblaApi || isPaused || prefersReducedMotion || slides.length < 2) return;
    // Video slides self-advance via the <video> `ended` event so viewers see
    // the clip through before rotating.
    if (activeIsVideo) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayDelayMs);
    return () => window.clearInterval(id);
  }, [emblaApi, isPaused, prefersReducedMotion, slides.length, autoplayDelayMs, activeIsVideo]);

  const handleVideoEnded = React.useCallback(() => {
    if (isPaused || prefersReducedMotion) return;
    emblaApi?.scrollNext();
  }, [emblaApi, isPaused, prefersReducedMotion]);

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
            <HeroSlideView
              // biome-ignore lint/suspicious/noArrayIndexKey: slides are fetched with stable priority order; titles may repeat
              key={i}
              slide={slide}
              isActive={i === selectedIndex}
              prefersReducedMotion={prefersReducedMotion}
              onVideoEnded={handleVideoEnded}
            />
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

function HeroSlideView({
  slide,
  isActive,
  prefersReducedMotion,
  onVideoEnded,
}: {
  slide: HeroSlide;
  isActive: boolean;
  prefersReducedMotion: boolean;
  onVideoEnded: () => void;
}) {
  const linkTabIndex = isActive ? 0 : -1;

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" with aria-roledescription="slide" is the WAI-ARIA carousel slide pattern
    <div
      className="min-w-0 shrink-0 grow-0 basis-full"
      role="group"
      aria-roledescription="slide"
      aria-hidden={!isActive}
    >
      <div className="grid min-h-[460px] grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center py-12 pl-4 pr-4 lg:py-16 lg:pr-12">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-wheat/30 bg-wheat/15 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#E8D5A3]">
            Est. 1927 &middot; Iredell County
          </div>
          <h1 className="mb-4 text-balance font-serif text-3xl font-bold leading-[1.15] md:text-[42px]">
            {slide.title}
          </h1>
          <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-white/90">
            {slide.description ??
              "Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={slide.ctaHref ?? "/history"}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-wheat px-7 py-3.5 text-[15px] font-bold text-sage-deep transition-colors hover:bg-wheat-light"
              tabIndex={linkTabIndex}
            >
              {slide.ctaText ?? "Discover Harmony"}
            </Link>
            <Link
              href="/meetings"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/15"
              tabIndex={linkTabIndex}
            >
              Meeting Agendas
            </Link>
          </div>
        </div>

        <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
          <HeroMedia
            slide={slide}
            isActive={isActive}
            prefersReducedMotion={prefersReducedMotion}
            onVideoEnded={onVideoEnded}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Single-slide hero (renders when 0 or 1 Builder slides exist).
 * Client component so it can honor prefers-reduced-motion for video slides.
 */
export function HeroSingleSlide({ slide }: { slide?: HeroSlide }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="grid min-h-[460px] grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center py-12 pl-4 pr-4 lg:py-16 lg:pr-12">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-wheat/30 bg-wheat/15 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#E8D5A3]">
          Est. 1927 &middot; Iredell County
        </div>
        <h1 className="mb-4 text-balance font-serif text-3xl font-bold leading-[1.15] md:text-[42px]">
          {slide?.title ?? "Welcome to the Town of Harmony"}
        </h1>
        <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-white/90">
          {slide?.description ??
            "Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={slide?.ctaHref ?? "/history"}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-wheat px-7 py-3.5 text-[15px] font-bold text-sage-deep transition-colors hover:bg-wheat-light"
          >
            {slide?.ctaText ?? "Discover Harmony"}
          </Link>
          <Link
            href="/meetings"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/15"
          >
            Meeting Agendas
          </Link>
        </div>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
        {slide ? (
          <HeroMedia
            slide={slide}
            isActive
            prefersReducedMotion={prefersReducedMotion}
            // No carousel to advance in the single-slide case, so we let the
            // video loop and ignore `ended`.
            loopVideo
          />
        ) : (
          <HeroMediaFallback />
        )}
      </div>
    </div>
  );
}

function HeroMedia({
  slide,
  isActive,
  prefersReducedMotion,
  onVideoEnded,
  loopVideo = false,
}: {
  slide: HeroSlide;
  isActive: boolean;
  prefersReducedMotion: boolean;
  onVideoEnded?: () => void;
  loopVideo?: boolean;
}) {
  const heroImageUrl = slide.image ? getMediaUrl(slide.image) : null;
  const heroVideoUrl = slide.video ? getMediaUrl(slide.video) : null;
  const showVideo = Boolean(heroVideoUrl) && !prefersReducedMotion;
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = React.useState(false);

  // Reset the failure flag whenever the video source changes so a new Builder
  // upload gets a fresh play attempt instead of being permanently disqualified.
  React.useEffect(() => {
    setVideoFailed(false);
  }, [heroVideoUrl]);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && !prefersReducedMotion) {
      try {
        v.currentTime = 0;
      } catch {
        // Some browsers throw before metadata is ready — safe to ignore.
      }
      v.play().catch(() => {
        // Autoplay blocked (e.g. no user gesture). Fall back to poster.
        setVideoFailed(true);
      });
    } else {
      v.pause();
    }
  }, [isActive, prefersReducedMotion]);

  if (showVideo && !videoFailed && heroVideoUrl) {
    return (
      <>
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideoUrl}
          poster={heroImageUrl ?? undefined}
          muted
          playsInline
          loop={loopVideo}
          preload="metadata"
          tabIndex={-1}
          onEnded={loopVideo ? undefined : onVideoEnded}
          onError={() => setVideoFailed(true)}
        />
        {!heroImageUrl && <HeroMediaBackdrop />}
      </>
    );
  }

  if (heroImageUrl) {
    return (
      <img
        src={heroImageUrl}
        alt={slide.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return <HeroMediaFallback />;
}

function HeroMediaFallback() {
  return (
    <>
      <HeroMediaBackdrop />
      <div className="relative z-10 flex h-[280px] w-[280px] items-center justify-center rounded-full border-[3px] border-wheat/30">
        <span className="font-serif text-[80px] italic text-wheat/35">H</span>
      </div>
    </>
  );
}

function HeroMediaBackdrop() {
  return <div className="absolute inset-0 bg-gradient-to-br from-wheat/[0.08] to-wheat/[0.04]" />;
}
