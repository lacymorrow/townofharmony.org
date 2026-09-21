/**
 * Branding guard: fails if Town of Harmony icon files are replaced by
 * upstream Shipkit art.
 *
 * Why: the upstream sync (see LAC-3887 / PR #297) re-added Shipkit's
 * `src/app/icon.svg` (the red rocket), which browsers prefer over
 * favicon.ico, so the tab showed Shipkit instead of the TOH "H"
 * (LAC-3976). git merge has no per-path protection, so this check runs
 * in CI to catch the next sync that tries the same thing.
 *
 * If a branding asset is changed ON PURPOSE, update the expectations
 * below in the same PR.
 *
 * Usage: bun run check:branding
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

/** Shipkit rocket flame red — present in upstream icon.svg, never in TOH art. */
const SHIPKIT_MARKER = /e94b35/i;

/** sha256 of the TOH "H" crest favicon (committed in 416d58c8). */
const FAVICON_SHA256 = "e53f0580d5218ba23c16f887f126b2f13aa425cc3eb374640540d57693b034d6";

const errors: string[] = [];

const requireFile = (path: string): string | undefined => {
	if (!existsSync(path)) {
		errors.push(`${path} is missing`);
		return undefined;
	}
	return readFileSync(path, "utf8");
};

// icon.svg — must be TOH art, not the upstream Shipkit rocket
const iconSvg = requireFile("src/app/icon.svg");
if (iconSvg) {
	if (SHIPKIT_MARKER.test(iconSvg)) {
		errors.push("src/app/icon.svg contains Shipkit rocket art (marker #E94B35) — restore the TOH icon");
	}
	if (!iconSvg.includes("Town of Harmony")) {
		errors.push('src/app/icon.svg is missing the "Town of Harmony" comment marker');
	}
}

// icon.tsx / apple-icon.tsx — must keep the TOH green "H" monogram
for (const path of ["src/app/icon.tsx", "src/app/apple-icon.tsx"]) {
	const source = requireFile(path);
	if (source && !source.includes("#375a3f")) {
		errors.push(`${path} lost the TOH brand color #375a3f`);
	}
}

// favicon.ico — binary, so pin its hash
if (existsSync("src/app/favicon.ico")) {
	const sha = createHash("sha256").update(readFileSync("src/app/favicon.ico")).digest("hex");
	if (sha !== FAVICON_SHA256) {
		errors.push(
			`src/app/favicon.ico sha256 ${sha} does not match the TOH crest (${FAVICON_SHA256}). If this change is intentional, update FAVICON_SHA256 in scripts/check-branding.ts.`
		);
	}
} else {
	errors.push("src/app/favicon.ico is missing");
}

if (errors.length > 0) {
	console.error("❌ Branding check failed (LAC-3976):");
	for (const error of errors) {
		console.error(`  - ${error}`);
	}
	process.exit(1);
}

console.info("✅ Branding check passed — TOH icons intact.");
