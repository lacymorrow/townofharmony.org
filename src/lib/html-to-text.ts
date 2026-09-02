/**
 * Plain-text extraction for Builder rich text fields.
 *
 * Builder rich text values are HTML strings ("<p class=\"\">… &amp; …</p>").
 * Rendering them directly as JSX text shows the raw markup to visitors
 * (LAC-3559), while dangerouslySetInnerHTML is overkill for line-clamped
 * previews. This converts the HTML to readable plain text: tags become
 * spaces, entities are decoded once, whitespace is collapsed. Plain strings
 * pass through unchanged. Dependency-free so it is safe in both server and
 * client components.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
};

const decodeEntity = (match: string, code: string): string => {
  if (code.startsWith("#")) {
    const codePoint =
      code[1]?.toLowerCase() === "x"
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
    if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match;
    return String.fromCodePoint(codePoint);
  }
  return NAMED_ENTITIES[code.toLowerCase()] ?? match;
};

export const htmlToPlainText = (html: string | null | undefined): string => {
  if (!html) return "";
  return (
    html
      .replace(/<[^>]*>/g, " ")
      // Single pass, so "&amp;lt;" decodes to the literal text "&lt;"
      .replace(/&(#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, decodeEntity)
      .replace(/\s+/g, " ")
      .trim()
  );
};
