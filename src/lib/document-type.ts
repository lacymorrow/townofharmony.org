export type DocumentKind = "pdf" | "docx" | "unknown";

/**
 * Extracts a lowercase file extension from a URL's final path segment.
 * Returns "" when the path has no extension — e.g. Builder.io CDN asset URLs
 * (`/o/assets%2F...%2F<hash>?alt=media`), whose original filename only exists
 * in the Content-Disposition header (LAC-3623).
 */
export function getExtensionFromUrl(url: string): string {
  try {
    // Base only anchors relative paths; the pathname is all we read.
    const pathname = new URL(url, "http://localhost").pathname;
    const lastSegment = decodeURIComponent(pathname.split("/").pop() ?? "");
    const dotIndex = lastSegment.lastIndexOf(".");
    if (dotIndex <= 0 || dotIndex === lastSegment.length - 1) return "";
    return lastSegment.slice(dotIndex + 1).toLowerCase();
  } catch {
    return "";
  }
}

export function detectKindFromUrl(url: string): DocumentKind {
  const ext = getExtensionFromUrl(url);
  if (ext === "pdf" || ext === "docx") return ext;
  return "unknown";
}

export function detectKindFromContentType(contentType: string | null): DocumentKind {
  if (!contentType) return "unknown";
  const normalized = contentType.toLowerCase();
  if (normalized.includes("application/pdf")) return "pdf";
  if (normalized.includes("wordprocessingml.document")) return "docx";
  return "unknown";
}

/**
 * Sniffs magic bytes as a last resort when the server sends a generic
 * content type. The zip signature is shared by all OOXML formats, so a
 * "docx" answer here is a best guess — callers must tolerate conversion
 * failing and fall back to offering a download.
 */
export function detectKindFromBytes(buffer: ArrayBuffer): DocumentKind {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  if (bytes.length < 4) return "unknown";
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "pdf";
  }
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return "docx";
  }
  return "unknown";
}
