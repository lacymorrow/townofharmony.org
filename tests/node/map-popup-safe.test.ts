import { describe, expect, it } from "vitest";
import { escapeHtml, safeHttpUrl } from "@/lib/map-popup-safe";

// LAC-3637: harmony-map.tsx interpolates town-map-business fields (from Builder
// CMS + Google Places sync) into a Leaflet innerHTML popup template. These
// helpers keep injected markup and href-scheme abuse out of the rendered DOM.
describe("escapeHtml", () => {
	it("escapes all five HTML-significant characters", () => {
		expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
			"&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
		);
		expect(escapeHtml("A & B")).toBe("A &amp; B");
		expect(escapeHtml("O'Brien")).toBe("O&#39;Brien");
	});

	it("neutralises attribute breakouts inside interpolated text", () => {
		expect(escapeHtml('" onmouseover="alert(1)" x="')).toBe(
			"&quot; onmouseover=&quot;alert(1)&quot; x=&quot;",
		);
	});

	it("returns empty string for null/undefined/empty input", () => {
		expect(escapeHtml(null)).toBe("");
		expect(escapeHtml(undefined)).toBe("");
		expect(escapeHtml("")).toBe("");
	});

	it("passes plain text through unchanged", () => {
		expect(escapeHtml("Harmony General Store")).toBe("Harmony General Store");
	});
});

describe("safeHttpUrl", () => {
	it("accepts http and https absolute URLs", () => {
		expect(safeHttpUrl("https://example.com/path?q=1")).toBe("https://example.com/path?q=1");
		expect(safeHttpUrl("http://example.com")).toBe("http://example.com/");
	});

	it("rejects javascript: URIs", () => {
		expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
		expect(safeHttpUrl("JavaScript:alert(1)")).toBeNull();
		expect(safeHttpUrl("  javascript:alert(1)  ")).toBeNull();
	});

	it("rejects data:, vbscript:, file:, and mailto: schemes", () => {
		expect(safeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
		expect(safeHttpUrl("vbscript:msgbox(1)")).toBeNull();
		expect(safeHttpUrl("file:///etc/passwd")).toBeNull();
		expect(safeHttpUrl("mailto:x@example.com")).toBeNull();
	});

	it("rejects relative/scheme-less input that could smuggle attributes", () => {
		expect(safeHttpUrl("/relative/path")).toBeNull();
		expect(safeHttpUrl("example.com")).toBeNull();
		expect(safeHttpUrl('" onclick="alert(1)')).toBeNull();
	});

	it("returns null for null/undefined/empty input", () => {
		expect(safeHttpUrl(null)).toBeNull();
		expect(safeHttpUrl(undefined)).toBeNull();
		expect(safeHttpUrl("")).toBeNull();
		expect(safeHttpUrl("   ")).toBeNull();
	});
});
