import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pageTitle } from "@/lib/page-title";

/**
 * Regression guards for LAC-3921 (Ahrefs: "Title too long", 6 URLs).
 *
 * The root layout metadata template already appends " | Town of Harmony, NC"
 * to every string title. Pages that hardcode the same suffix in their own
 * metadata title rendered it twice ("X | Town of Harmony, NC | Town of
 * Harmony, NC"), pushing titles past Ahrefs' 60-character limit.
 */

describe("pageTitle (LAC-3921)", () => {
	it("uses the full brand suffix when the title fits in 60 chars", () => {
		expect(pageTitle("Special Meeting")).toBe("Special Meeting | Town of Harmony, NC");
	});

	it("falls back to the short suffix when the full title would overflow", () => {
		expect(pageTitle("Tomlinson-Moore Family Park Reservation")).toBe(
			"Tomlinson-Moore Family Park Reservation | Harmony, NC",
		);
		expect(pageTitle("Board of Aldermen Meeting - June 9, 2025")).toBe(
			"Board of Aldermen Meeting - June 9, 2025 | Harmony, NC",
		);
	});

	it("keeps every real CMS meeting title within 60 chars", () => {
		for (const title of [
			"August Town Council Meeting",
			"Board of Aldermen Meeting - May 7, 2025",
			"Board of Aldermen Meeting - June 9, 2025",
			"Town Council Meeting",
			"Special Meeting",
		]) {
			expect(pageTitle(title).length).toBeLessThanOrEqual(60);
		}
	});
});

describe("no town page hardcodes the site suffix in its metadata title (LAC-3921)", () => {
	const TOWN_DIR = join(process.cwd(), "src", "app", "(app)", "(town)");

	const pageFiles = (dir: string): string[] =>
		readdirSync(dir).flatMap((entry) => {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) return pageFiles(full);
			return entry === "page.tsx" ? [full] : [];
		});

	it.each(pageFiles(TOWN_DIR).map((f) => [f.slice(TOWN_DIR.length + 1), f]))(
		"%s does not duplicate the layout title template suffix",
		(_label, file) => {
			// The layout template appends " | Town of Harmony, NC" to string
			// titles; a page title containing it literally renders it twice.
			// Absolute titles built via pageTitle() are exempt by construction.
			const source = readFileSync(file as string, "utf8");
			expect(source).not.toMatch(/title:\s*["'`][^"'`]*\| Town of Harmony, NC/);
		},
	);
});
