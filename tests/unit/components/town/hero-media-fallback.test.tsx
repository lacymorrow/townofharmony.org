import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { HeroSingleSlide } from "@/components/town/hero-carousel";

// jsdom ships no matchMedia, and the hero reads it for prefers-reduced-motion.
beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

// Regression tests for LAC-6283: the homepage hero painted a broken-image icon
// plus raw alt text when its Builder CDN image failed to load. The <video> path
// already degraded to the gradient fallback on error; the <img> path had no
// safety net at all.

const slide = {
  title: "Welcome to the Town of Harmony",
  description: "Static hero copy.",
  image: "https://cdn.builder.io/api/v1/image/assets%2Fabc%2Fdef",
};

/** The gradient fallback is identified by its serif "H" monogram. */
const monogram = () => screen.queryByText("H");

let restoreImageLoadState = () => {};

afterEach(() => {
  restoreImageLoadState();
});

/**
 * jsdom never fetches images, so a failed load has to be simulated. Stubbing
 * the prototype getters is the only way to reproduce the pre-hydration case,
 * where the browser has already finished (and failed) the request by the time
 * React attaches to the server-rendered <img>.
 */
function stubImageAsAlreadyFailed() {
  const proto = HTMLImageElement.prototype;
  const complete = Object.getOwnPropertyDescriptor(proto, "complete");
  const naturalWidth = Object.getOwnPropertyDescriptor(proto, "naturalWidth");
  Object.defineProperty(proto, "complete", { configurable: true, get: () => true });
  Object.defineProperty(proto, "naturalWidth", { configurable: true, get: () => 0 });
  restoreImageLoadState = () => {
    if (complete) Object.defineProperty(proto, "complete", complete);
    if (naturalWidth) Object.defineProperty(proto, "naturalWidth", naturalWidth);
    restoreImageLoadState = () => {};
  };
}

describe("hero image failure fallback", () => {
  it("renders the image when it loads", () => {
    render(<HeroSingleSlide mediaSlide={slide} textSlide={slide} />);

    expect(screen.getByAltText(slide.title)).toBeInTheDocument();
    expect(monogram()).not.toBeInTheDocument();
  });

  it("swaps a failed image for the gradient fallback instead of a broken icon", () => {
    render(<HeroSingleSlide mediaSlide={slide} textSlide={slide} />);

    fireEvent.error(screen.getByAltText(slide.title));

    expect(screen.queryByAltText(slide.title)).not.toBeInTheDocument();
    expect(monogram()).toBeInTheDocument();
  });

  it("falls back when the image already failed before hydration", () => {
    // onError never fires in this case — the error event preceded React
    // attaching its listener, which is how the reported screenshot happened.
    stubImageAsAlreadyFailed();

    render(<HeroSingleSlide mediaSlide={slide} textSlide={slide} />);

    expect(screen.queryByAltText(slide.title)).not.toBeInTheDocument();
    expect(monogram()).toBeInTheDocument();
  });

  it("keeps the hero heading and CTAs when the image fails", () => {
    render(<HeroSingleSlide mediaSlide={slide} textSlide={slide} />);

    fireEvent.error(screen.getByAltText(slide.title));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(slide.title);
    expect(screen.getByText("Discover Harmony")).toBeInTheDocument();
  });
});
