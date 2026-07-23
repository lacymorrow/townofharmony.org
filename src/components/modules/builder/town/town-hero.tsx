"use client";

import { HeroCarousel, HeroSingleSlide, type HeroSlide } from "@/components/town/hero-carousel";
import { useBuilderData } from "@/lib/builder-data";
import { getHomepageSync } from "@/lib/town-data-client";

interface TownHeroProps {
  title?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaHref?: string;
}

/**
 * Homepage hero for Builder-composed pages. Fetches `town-homepage-slide`
 * entries so the Builder-page render path shows the same carousel (and video
 * slides) as the static homepage; props set in the Builder editor act as the
 * single-slide fallback while slides load or when fewer than two exist.
 */
export const TownHero = ({ title, subtitle, image, ctaText, ctaHref }: TownHeroProps) => {
  const homepage = getHomepageSync();
  const firstStaticSlide = homepage?.heroSlides?.[0];

  const fallbackSlide: HeroSlide = {
    title: title || firstStaticSlide?.title || "Welcome to the Town of Harmony",
    description: subtitle || firstStaticSlide?.description || undefined,
    image: image || firstStaticSlide?.image || undefined,
    ctaText: ctaText || firstStaticSlide?.ctaText || undefined,
    ctaHref: ctaHref || firstStaticSlide?.ctaHref || undefined,
  };

  const { data: slides } = useBuilderData<HeroSlide>("town-homepage-slide", {
    sort: { priority: -1 },
    limit: 10,
    fallback: [fallbackSlide],
  });

  return (
    <section className="bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white relative overflow-hidden">
      <div className="container mx-auto">
        {slides.length > 1 ? (
          <HeroCarousel slides={slides} />
        ) : (
          <HeroSingleSlide slide={slides[0] ?? fallbackSlide} />
        )}
      </div>
    </section>
  );
};
