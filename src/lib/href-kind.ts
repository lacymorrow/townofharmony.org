/**
 * Classifies a data-authored href so it can be rendered with the right element.
 *
 * Hrefs on town surfaces come from Builder fields and `src/data/town/*`, not
 * from the route table, so they are not all App Router routes. One that points
 * at a file under `public/` has no route to match: handed to `next/link`, a
 * client-side navigation asks the router for it, nothing matches, and the
 * catch-all renders the 404 page. A hard reload skips the router and Vercel
 * serves the file, which is the "404 first, refresh works" report in LAC-6284
 * (`/docs/2026-christmas-parade-application.pdf` in the notice banner).
 *
 * Only `route` may go through `<Link>`. Use `DataLink` rather than calling this
 * directly unless you need the classification itself.
 */
export type HrefKind =
  /** Missing, or not renderable as a link at all (`javascript:`, relative). */
  | "unsafe"
  /** An in-app App Router route. The only kind `next/link` may receive. */
  | "route"
  /** A static asset served from `public/`. Needs a plain `<a>`. */
  | "file"
  /** Another origin. Needs a plain `<a>`. */
  | "external"
  /** A `mailto:`/`tel:`/`sms:` handler. Needs a plain `<a>`, same tab. */
  | "action";

/** Schemes an editor may legitimately author. Anything else is `unsafe`. */
const SAFE_SCHEMES = /^(https?):/i;
const ACTION_SCHEMES = /^(mailto|tel|sms):/i;

/**
 * Trailing `.ext` on the last path segment. Deliberately any short extension
 * rather than a known list: an unrecognised file type misread as a route 404s,
 * while a route misread as a file only loses client-side navigation. No slug in
 * `src/data/town` contains a dot, so the heuristic has nothing to trip on here.
 */
const FILE_EXTENSION = /\.[a-z0-9]{1,8}$/i;

export function getHrefKind(href: string | null | undefined): HrefKind {
  const raw = href?.trim();
  if (!raw) return "unsafe";

  if (ACTION_SCHEMES.test(raw)) return "action";

  // Protocol-relative hrefs leave the origin without naming a scheme.
  if (raw.startsWith("//")) return "external";
  if (SAFE_SCHEMES.test(raw)) return "external";

  // Any other scheme (`javascript:`, `data:`, `vbscript:`) must not reach an
  // href attribute, and a bare relative href resolves against whatever page it
  // happens to render on, which is never what an editor meant.
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return "unsafe";

  // Fragment- and query-only hrefs stay on the current route.
  if (raw.startsWith("#") || raw.startsWith("?")) return "route";

  if (!raw.startsWith("/")) return "unsafe";

  const path = raw.split(/[?#]/)[0] ?? "";
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);
  return FILE_EXTENSION.test(lastSegment) ? "file" : "route";
}
