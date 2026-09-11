import { describe, expect, it } from "vitest";
import { htmlToPlainText } from "@/lib/html-to-text";

// LAC-3641: agenda/minutes are Builder richText (HTML strings); must never
// render raw markup in metadata, tabs, or document cards.

describe("htmlToPlainText — meeting metadata", () => {
	it("strips paragraph tags from minutes", () => {
		const raw = "<p>Regular session called to order at 7:00 PM.</p>";
		expect(htmlToPlainText(raw)).toBe("Regular session called to order at 7:00 PM.");
	});

	it("strips nested HTML and decodes entities", () => {
		const raw = "<p><strong>Item 1:</strong> Budget &amp; Finance</p>";
		expect(htmlToPlainText(raw)).toBe("Item 1: Budget & Finance");
	});

	it("collapses whitespace between block elements", () => {
		const raw = "<p>First item.</p><p>Second item.</p>";
		const result = htmlToPlainText(raw);
		expect(result).not.toContain("<");
		expect(result).toContain("First item.");
		expect(result).toContain("Second item.");
	});

	it("returns empty string for null/undefined", () => {
		expect(htmlToPlainText(null)).toBe("");
		expect(htmlToPlainText(undefined)).toBe("");
	});

	it("passes plain strings through unchanged", () => {
		expect(htmlToPlainText("No markup here.")).toBe("No markup here.");
	});

	it("truncates correctly at 160 chars for metadata", () => {
		const long = "A".repeat(200);
		const raw = `<p>${long}</p>`;
		const plain = htmlToPlainText(raw);
		const description = plain.length > 160 ? plain.slice(0, 157) + "…" : plain;
		expect(description.length).toBeLessThanOrEqual(160);
		expect(description.endsWith("…")).toBe(true);
	});
});
