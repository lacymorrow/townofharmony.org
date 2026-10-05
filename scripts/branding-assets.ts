/**
 * The TOH branding assets an upstream Shipkit sync must never touch.
 *
 * Why: `git merge` has no per-path exclude. Sync #297 (commit 24185b7d) added
 * upstream's `src/app/icon.svg` — a file TOH had deliberately deleted — and
 * Next.js emitted it as `<link rel=icon type=image/svg+xml sizes=any>`, which
 * browsers prefer over favicon.ico. The tab showed Shipkit (LAC-3976).
 *
 * Consumed by:
 *   - scripts/restore-branding.ts  (post-merge reset, both sync paths)
 *   - scripts/check-branding.ts    (CI guard, catches anything that slips past)
 *
 * A path listed here but absent from the pre-merge tree is deleted after a
 * sync — that is what kills a re-added upstream icon.svg / icon.png.
 */
export const BRANDING_ASSETS = [
	"src/app/favicon.ico",
	"src/app/icon.svg",
	"src/app/icon.tsx",
	"src/app/icon.png",
	"src/app/apple-icon.tsx",
	"src/app/apple-icon.png",
	"public/favicon.png",
] as const;
