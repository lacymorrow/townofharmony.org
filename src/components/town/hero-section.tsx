import { fetchBuilderContent } from "@/lib/builder-data-server";
import { getHomepage, getSettings } from "@/lib/town-data";
import { HeroCarousel, HeroSingleSlide, type HeroSlide } from "./hero-carousel";

export async function HeroSection() {
  const [homepage, settings] = await Promise.all([getHomepage(), getSettings()]);
  const staticSlides = ((homepage as any)?.heroSlides ?? []) as HeroSlide[];

  let slides: HeroSlide[] = staticSlides;
  try {
    const { results } = await fetchBuilderContent<HeroSlide>("town-homepage-slide", {
      sort: { priority: -1 },
      limit: 10,
    });
    if (results.length > 0) {
      slides = results;
    }
  } catch (err) {
    console.error("Failed to fetch homepage slides from Builder.io:", err);
  }

  const chrome = {
    badgeText: settings.homepage.heroBadgeText,
    secondaryCtaText: settings.homepage.heroSecondaryCtaText,
    secondaryCtaHref: settings.homepage.heroSecondaryCtaHref,
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white">
      <div className="container mx-auto">
        {slides.length > 1 ? (
          <HeroCarousel slides={slides} {...chrome} />
        ) : (
          <HeroSingleSlide slide={slides[0]} {...chrome} />
        )}
      </div>
    </section>
  );
}
