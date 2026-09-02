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

  // isomorphic-dompurify backs this with jsdom on the server, so the same
  // allowlist applies in both environments. React keeps the server-rendered
  // HTML on hydration, so the SSR output must be fully sanitized (LAC-3638).
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
  });
};
