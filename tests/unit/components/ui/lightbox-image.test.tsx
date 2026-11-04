import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LightboxImage } from "@/components/ui/lightbox-image";

// Regression tests for LAC-6291: LightboxImage painted the browser's
// broken-image icon when a Builder CDN asset 404'd (same failure as LAC-6283).

const src = "https://cdn.builder.io/api/v1/image/assets%2Fabc%2Fdead";
const alt = "Harmony Hardware";

let restore = () => {};
afterEach(() => restore());

/** Simulates an image that failed before React attached (pre-hydration). */
function stubImageAsAlreadyFailed() {
  const proto = HTMLImageElement.prototype;
  const complete = Object.getOwnPropertyDescriptor(proto, "complete");
  const naturalWidth = Object.getOwnPropertyDescriptor(proto, "naturalWidth");
  Object.defineProperty(proto, "complete", { configurable: true, get: () => true });
  Object.defineProperty(proto, "naturalWidth", { configurable: true, get: () => 0 });
  restore = () => {
    if (complete) Object.defineProperty(proto, "complete", complete);
    if (naturalWidth) Object.defineProperty(proto, "naturalWidth", naturalWidth);
    restore = () => {};
  };
}

describe("LightboxImage failure fallback", () => {
  it("renders the image and lightbox trigger when it loads", () => {
    render(<LightboxImage src={src} alt={alt} wrapperClassName="h-48 w-full" />);

    expect(screen.getByAltText(alt)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("swaps a failed image for a placeholder and drops the lightbox trigger", () => {
    render(<LightboxImage src={src} alt={alt} wrapperClassName="h-48 w-full" />);

    fireEvent.error(screen.getByAltText(alt));

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const placeholder = screen.getByRole("img", { name: alt });
    expect(placeholder.tagName).toBe("DIV");
    expect(placeholder).toHaveClass("h-48", "w-full");
  });

  it("falls back when the image already failed before hydration", () => {
    stubImageAsAlreadyFailed();

    render(<LightboxImage src={src} alt={alt} wrapperClassName="h-12 w-12" />);

    expect(document.querySelector("img")).toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: alt })).toHaveClass("h-12", "w-12");
  });

  it("falls back in the disabled (plain img) path too", () => {
    render(<LightboxImage src={src} alt={alt} disabled className="h-10 w-10 rounded-full" />);

    fireEvent.error(screen.getByAltText(alt));

    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: alt })).toHaveClass("h-10", "w-10");
  });

  it("gives a new src a fresh attempt after a failure", () => {
    const { rerender } = render(<LightboxImage src={src} alt={alt} wrapperClassName="h-12 w-12" />);
    fireEvent.error(screen.getByAltText(alt));

    rerender(<LightboxImage src={`${src}2`} alt={alt} wrapperClassName="h-12 w-12" />);

    expect(screen.getByAltText(alt)).toBeInTheDocument();
  });
});
