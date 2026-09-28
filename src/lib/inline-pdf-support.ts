/**
 * Decides whether the browser can display a PDF inside an <iframe>.
 *
 * iOS Safari renders an embedded PDF as a single non-scrollable first page,
 * and most Android browsers refuse to render embedded PDFs at all — so both
 * get the pdf.js pager instead (LAC-4043). `navigator.pdfViewerEnabled` only
 * settles the question on desktop: iOS reports it inconsistently because
 * top-level PDF *navigation* works there even though embedding does not.
 */

export interface InlinePdfNavigator {
  userAgent?: string;
  pdfViewerEnabled?: boolean;
  maxTouchPoints?: number;
}

export const supportsInlinePdf = (
  nav: InlinePdfNavigator | undefined = typeof navigator === "undefined" ? undefined : navigator
): boolean => {
  if (!nav) return true; // SSR — the client re-decides before anything renders.

  const ua = nav.userAgent ?? "";
  // iPadOS 13+ masquerades as macOS; only maxTouchPoints reveals the iPad.
  const isIosLike =
    /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints ?? 0) > 1);
  const isAndroid = /Android/i.test(ua);
  if (isIosLike || isAndroid) return false;

  return nav.pdfViewerEnabled !== false;
};
