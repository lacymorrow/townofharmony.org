import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroCarousel, HeroSingleSlide, type HeroSlide } from "@/components/town/hero-carousel";

const slides: HeroSlide[] = [
  {
    title: "First Slide Title",
    description: "First slide description",
    image: "/images/town/hero-slider-1.jpg",
    ctaText: "See The Town",
    ctaHref: "/history",
  },
  {
    title: "Second Slide Title",
    description: "Second slide description",
    image: "/images/town/about-hero.png",
  },
  {
    title: "Third Slide Title",
    description: "Third slide description",
    video: "/videos/town/flyover.mp4",
  },
];

// Regression test for LAC-3008: the carousel must rotate media only. The text
// column (heading, description, CTAs) renders once from the first slide
// instead of once per slide inside the embla track.
describe("HeroCarousel", () => {
  it("renders the text column exactly once, sourced from the first slide", () => {
    const html = renderToString(<HeroCarousel slides={slides} />);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("First Slide Title");
    expect(html).toContain("First slide description");
    expect(html).toContain("See The Town");

    // Later slides contribute media only — their text fields must not render.
    // (Titles still appear as <img alt>, so assert on descriptions/CTAs.)
    expect(html).not.toContain("Second slide description");
    expect(html).not.toContain("Third slide description");
  });

  it("falls back to default CTA text/href when the first slide's fields are blank", () => {
    // Builder returns empty strings (not undefined) for cleared fields, which
    // used to render an empty primary CTA button + dead link (LAC-3008).
    const blankCtaSlides: HeroSlide[] = [
      {
        title: "Welcome to the Town of Harmony",
        description: "Static hero copy.",
        ctaText: "",
        ctaHref: "",
        image: "/images/town/hero-slider-1.jpg",
      },
      { title: "Second", image: "/images/town/about-hero.png" },
    ];
    const html = renderToString(<HeroCarousel slides={blankCtaSlides} />);

    expect(html).toContain("Discover Harmony");
    expect(html).toContain('href="/history"');
    // The primary CTA must never render as an empty anchor.
    expect(html).not.toContain('href=""');
  });

  it("still renders every slide's media and one dot per slide", () => {
    const html = renderToString(<HeroCarousel slides={slides} />);

    expect(html.match(/aria-roledescription="slide"/g)).toHaveLength(slides.length);
    expect(html.match(/Go to slide/g)).toHaveLength(slides.length);
    expect(html.match(/<video/g)).toHaveLength(1);
    expect(html.match(/<img/g)).toHaveLength(2);
  });

  it("keeps the media pane and dots visible on mobile (not lg-only)", () => {
    // Regression for LAC-3008: media used to be `hidden lg:block`, so mobile
    // showed a text-only hero. It must render at every breakpoint.
    const html = renderToString(<HeroCarousel slides={slides} />);

    // The media pane carries a mobile height instead of being display:none.
    expect(html).toContain("h-[280px]");
    // No element should use the standalone `hidden` class (which hides it on
    // mobile). Matches " hidden " but not "overflow-hidden".
    expect(html).not.toMatch(/\shidden[\s"]/);
  });
});

describe("HeroSingleSlide", () => {
  it("renders fallback copy when no slide exists", () => {
    const html = renderToString(<HeroSingleSlide />);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Welcome to the Town of Harmony");
    expect(html).toContain("Discover Harmony");
  });

  it("renders the slide's copy when one slide exists", () => {
    // Copy is sourced from textSlide (LAC-2995 made hero copy Builder-editable;
    // LAC-3008 decoupled the text column from the media slide).
    const html = renderToString(<HeroSingleSlide textSlide={slides[0]} mediaSlide={slides[0]} />);

    expect(html).toContain("First Slide Title");
    expect(html).toContain("See The Town");
  });
});
