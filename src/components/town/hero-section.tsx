import { fetchBuilderContent } from "@/lib/builder-data-server";
import { getHomepage } from "@/lib/town-data";
import { Hero, type HeroSlide } from "./hero-carousel";

export async function HeroSection() {
  const homepage = await getHomepage();
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

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-sage-deep via-sage-dark to-sage text-white">
      <Hero slides={slides} />
    </section>
  );
}
