import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "figure",
  "figcaption",
  "div",
  "span",
  "hr",
];

const ALLOWED_ATTRS = ["href", "target", "rel", "src", "alt", "width", "height", "class", "id"];

interface SanitizeOptions {
  stripLinks?: boolean;
}

export const sanitizeHtml = (
  html: string | null | undefined,
  options: SanitizeOptions = {},
): string => {
  if (!html) return "";

  const allowedTags = options.stripLinks
    ? ALLOWED_TAGS.filter((tag) => tag !== "a")
    : ALLOWED_TAGS;

  if (typeof window === "undefined") {
    // SSR: strip obvious XSS vectors; DOMPurify runs on client for full sanitization
    let safe = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/(?:javascript|data|vbscript):/gi, "");
    if (options.stripLinks) {
      safe = safe.replace(/<\/?a\b[^>]*>/gi, "");
    }
    return safe;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
  });
};
