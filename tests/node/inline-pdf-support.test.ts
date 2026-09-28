import { describe, expect, it } from "vitest";
import { supportsInlinePdf } from "@/lib/inline-pdf-support";

// Regression tests for LAC-4043: iOS Safari renders an embedded PDF
// (<iframe>) as a single non-scrollable first page, so the ordinance
// document appeared to have only one page on iPhone. Mobile browsers must
// route to the pdf.js pager instead of the iframe.

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD_LEGACY_UA =
  "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
// iPadOS 13+ reports itself as macOS; only maxTouchPoints reveals the iPad.
const IPAD_DESKTOP_MODE_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const DESKTOP_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const MAC_SAFARI_UA = IPAD_DESKTOP_MODE_UA;

describe("supportsInlinePdf", () => {
  it("returns false on iPhone even if the browser claims a PDF viewer", () => {
    // iOS can *navigate* to PDFs, but embedded frames still show one page.
    expect(supportsInlinePdf({ userAgent: IPHONE_UA, pdfViewerEnabled: true })).toBe(false);
    expect(supportsInlinePdf({ userAgent: IPHONE_UA, pdfViewerEnabled: false })).toBe(false);
    expect(supportsInlinePdf({ userAgent: IPHONE_UA })).toBe(false);
  });

  it("returns false on legacy iPad user agents", () => {
    expect(supportsInlinePdf({ userAgent: IPAD_LEGACY_UA })).toBe(false);
  });

  it("returns false on iPadOS masquerading as macOS (touch points > 1)", () => {
    expect(supportsInlinePdf({ userAgent: IPAD_DESKTOP_MODE_UA, maxTouchPoints: 5 })).toBe(false);
  });

  it("returns true on real macOS Safari (no touch points)", () => {
    expect(
      supportsInlinePdf({ userAgent: MAC_SAFARI_UA, maxTouchPoints: 0, pdfViewerEnabled: true })
    ).toBe(true);
  });

  it("returns false on Android", () => {
    expect(supportsInlinePdf({ userAgent: ANDROID_CHROME_UA, pdfViewerEnabled: false })).toBe(
      false
    );
    expect(supportsInlinePdf({ userAgent: ANDROID_CHROME_UA })).toBe(false);
  });

  it("respects pdfViewerEnabled on desktop", () => {
    expect(supportsInlinePdf({ userAgent: DESKTOP_CHROME_UA, pdfViewerEnabled: true })).toBe(true);
    expect(supportsInlinePdf({ userAgent: DESKTOP_CHROME_UA, pdfViewerEnabled: false })).toBe(
      false
    );
  });

  it("assumes support on desktop browsers that predate pdfViewerEnabled", () => {
    expect(supportsInlinePdf({ userAgent: DESKTOP_CHROME_UA })).toBe(true);
  });

  it("assumes support during SSR (no navigator)", () => {
    expect(supportsInlinePdf(undefined)).toBe(true);
  });
});
