import DOMPurify from "dompurify";
import type sanitizeHtmlServer from "sanitize-html";

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

// Loaded lazily inside the server branch so client bundles never pull in
// sanitize-html (Next.js replaces `typeof window` at build time and
// dead-code-eliminates the branch).
let serverSanitizer: typeof sanitizeHtmlServer | undefined;

export const sanitizeHtml = (
  html: string | null | undefined,
  options: SanitizeOptions = {}
): string => {
  if (!html) return "";

  const allowedTags = options.stripLinks ? ALLOWED_TAGS.filter((tag) => tag !== "a") : ALLOWED_TAGS;

  if (typeof window === "undefined") {
    // Server/SSR: DOMPurify needs a real DOM, and the jsdom-backed
    // isomorphic-dompurify crashed Vercel serverless functions (PR #277,
    // reverted in #279). The pure-JS sanitize-html package enforces the same
    // allowlist instead; scheme rules mirror DOMPurify's defaults (data: URIs
    // only on <img>). Parity between both paths is enforced by
    // tests/shared/sanitize-html-spec.ts running under node AND jsdom.
    serverSanitizer ??= require("sanitize-html") as typeof sanitizeHtmlServer;
    return serverSanitizer(html, {
      allowedTags,
      allowedAttributes: { "*": [...ALLOWED_ATTRS] },
      allowedSchemes: ["http", "https", "mailto", "tel"],
      allowedSchemesByTag: { img: ["http", "https", "data"] },
      allowProtocolRelative: true,
      disallowedTagsMode: "discard",
    });
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
  });
};
