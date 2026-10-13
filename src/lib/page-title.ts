const FULL_SUFFIX = " | Town of Harmony, NC";
const SHORT_SUFFIX = " | Harmony, NC";
const MAX_TITLE_LENGTH = 60;

/**
 * Build an absolute <title> for CMS-driven detail pages (meetings, events).
 *
 * These titles are editor-entered and vary in length; Ahrefs flags rendered
 * titles over 60 characters (LAC-3921). Prefer the full brand suffix, fall
 * back to the shorter regional one when the combined title would overflow.
 *
 * Use with `title: { absolute: pageTitle(...) }` so the root layout template
 * (`%s | Town of Harmony, NC`) does not append the suffix a second time.
 */
export const pageTitle = (title: string): string => {
	// Editor-entered titles carry stray whitespace ("Town Council Meeting " on
	// /meetings/council-meeting-2025-07-07 rendered a double space before the
	// separator), and collapse to the bare brand name when blank.
	const clean = title.replace(/\s+/g, " ").trim();
	if (!clean) return FULL_SUFFIX.replace(/^\s*\|\s*/, "");

	const full = `${clean}${FULL_SUFFIX}`;
	return full.length <= MAX_TITLE_LENGTH ? full : `${clean}${SHORT_SUFFIX}`;
};
