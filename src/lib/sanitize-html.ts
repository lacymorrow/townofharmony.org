import DOMPurify from "isomorphic-dompurify";

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
  /** Strip <a> tags entirely. Use in contexts already wrapped in a link/button to avoid nested interactive elements. */
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

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
  });
};
