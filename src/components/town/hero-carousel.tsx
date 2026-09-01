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

export interface HeroChromeProps {
  badgeText?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

const DEFAULT_BADGE_TEXT = "Est. 1927 · Iredell County";
const DEFAULT_SECONDARY_CTA_TEXT = "Meeting Agendas";
const DEFAULT_SECONDARY_CTA_HREF = "/meetings";

interface HeroCarouselProps extends HeroChromeProps {
  slides: HeroSlide[];
  textSlide?: HeroSlide;
  autoplayDelayMs?: number;
}

/**
 * Builder text fields come back as empty strings when an editor leaves them
 * blank (not `undefined`), so `??` would render an empty heading/CTA. Pick the
 * first value that has actual content and let the caller supply the default.
 */
function firstNonEmpty(...values: (string | undefined | null)[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return undefined;
}

/**
 * A slide only earns a carousel spot when it carries real media. Builder
 * returns empty strings for cleared image/video fields, so length checks alone
 * would count blank placeholder slides and rotate through gradient fallbacks
 * (LAC-2906).
 */
function hasMedia(slide?: HeroSlide): boolean {
  if (!slide) return false;
  const image = typeof slide.image === "string" ? slide.image.trim() : "";
  const video = typeof slide.video === "string" ? slide.video.trim() : "";
  return image !== "" || video !== "";
}

/**
 * Single entry point for both render paths (static homepage + Builder page).
 * The carousel only exists when 2+ slides have real media; otherwise the hero
 * is a single static slide. Hero copy always comes from the first slide so the
 * heading/CTA stay intact even if that slide has no image.
 */
export function Hero({
  slides,
  badgeText,
  secondaryCtaText,
  secondaryCtaHref,
}: { slides: HeroSlide[] } & HeroChromeProps) {
  const textSlide = slides[0];
  const mediaSlides = slides.filter(hasMedia);
  const chrome = { badgeText, secondaryCtaText, secondaryCtaHref };

  if (mediaSlides.length > 1) {
    return <HeroCarousel slides={mediaSlides} textSlide={textSlide} {...chrome} />;
  }

  return (
    <HeroSingleSlide mediaSlide={mediaSlides[0] ?? textSlide} textSlide={textSlide} {...chrome} />
  );
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

export function HeroCarousel({
  slides,
  textSlide,
  autoplayDelayMs = 6000,
  badgeText,
  secondaryCtaText,
  secondaryCtaHref,
}: HeroCarouselProps) {
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
      <div className="grid min-h-[460px] grid-cols-1 lg:grid-cols-2">
        {/* Text stays static while media rotates; the first (highest-priority)
            slide is the canonical source of hero copy. */}
        <HeroTextColumn
          slide={textSlide ?? slides[0]}
          badgeText={badgeText}
          secondaryCtaText={secondaryCtaText}
          secondaryCtaHref={secondaryCtaHref}
        />

        {/* Media shows on every breakpoint: full-width below lg (stacked under
            the text) and half-width beside it on lg+. A fixed mobile height
            gives object-cover a box to fill so it spans the full width. */}
        <div className="relative h-[280px] overflow-hidden sm:h-[360px] lg:h-auto">
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {slides.map((slide, i) => (
                // biome-ignore lint/a11y/useSemanticElements: role="group" with aria-roledescription="slide" is the WAI-ARIA carousel slide pattern
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: slides are fetched with stable priority order; titles may repeat
                  key={i}
                  className="relative flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center overflow-hidden"
                  role="group"
                  aria-roledescription="slide"
                  aria-hidden={i !== selectedIndex}
                >
                  <HeroMedia
                    slide={slide}
                    isActive={i === selectedIndex}
                    prefersReducedMotion={prefersReducedMotion}
                    onVideoEnded={handleVideoEnded}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        // Dots sit over the media pane (bottom row on mobile, right column on
        // lg+) so they track whichever slide is showing at every breakpoint.
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

function HeroTextColumn({
  slide,
  badgeText,
  secondaryCtaText,
  secondaryCtaHref,
}: { slide?: HeroSlide } & HeroChromeProps) {
  // Blank Builder fields fall back to defaults so the primary CTA never renders
  // as an empty button / dead link (LAC-3008).
  const title = firstNonEmpty(slide?.title) ?? "Welcome to the Town of Harmony";
  const description =
    firstNonEmpty(slide?.description) ??
    "Where Harmony LIVES and SINGS! A proud community rooted in southern tradition, natural beauty, and neighborly spirit.";
  const ctaText = firstNonEmpty(slide?.ctaText) ?? "Discover Harmony";
  const ctaHref = firstNonEmpty(slide?.ctaHref) ?? "/history";
  const resolvedBadge = firstNonEmpty(badgeText) ?? DEFAULT_BADGE_TEXT;
  const resolvedSecondaryText = firstNonEmpty(secondaryCtaText) ?? DEFAULT_SECONDARY_CTA_TEXT;
  const resolvedSecondaryHref = firstNonEmpty(secondaryCtaHref) ?? DEFAULT_SECONDARY_CTA_HREF;

  return (
    // Hero is full-bleed so the media reaches the page edge; keep the text
    // left-aligned with the rest of the site by matching the container gutter
    // (2rem padding, 1400px max-width, centered) once the viewport is wider
    // than the container (LAC-2906).
    <div className="flex flex-col justify-center py-12 pl-4 pr-4 lg:py-16 lg:pr-12 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
      <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-wheat/30 bg-wheat/15 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#E8D5A3]">
        {resolvedBadge}
      </div>
      <h1 className="mb-4 text-balance font-serif text-3xl font-bold leading-[1.15] md:text-[42px]">
        {title}
      </h1>
      <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-white/90">{description}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={ctaHref}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-wheat px-7 py-3.5 text-[15px] font-bold text-sage-deep transition-colors hover:bg-wheat-light"
        >
          {ctaText}
        </Link>
        <Link
          href={resolvedSecondaryHref}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/15"
        >
          {resolvedSecondaryText}
        </Link>
      </div>
    </div>
  );
}

/**
 * Single-slide hero (renders when 0 or 1 slides carry media). Text and media
 * are decoupled so the heading/CTA come from the canonical first slide while
 * the media (if any) comes from the lone media-bearing slide.
 * Client component so it can honor prefers-reduced-motion for video slides.
 */
export function HeroSingleSlide({
  mediaSlide,
  textSlide,
  badgeText,
  secondaryCtaText,
  secondaryCtaHref,
}: {
  mediaSlide?: HeroSlide;
  textSlide?: HeroSlide;
} & HeroChromeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const showMedia = hasMedia(mediaSlide);

  return (
    <div className="grid min-h-[460px] grid-cols-1 lg:grid-cols-2">
      <HeroTextColumn
        slide={textSlide ?? mediaSlide}
        badgeText={badgeText}
        secondaryCtaText={secondaryCtaText}
        secondaryCtaHref={secondaryCtaHref}
      />

      <div className="relative flex h-[280px] items-center justify-center overflow-hidden sm:h-[360px] lg:h-auto">
        {showMedia && mediaSlide ? (
          <HeroMedia
            slide={mediaSlide}
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
