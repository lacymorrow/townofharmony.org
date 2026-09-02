import { describe, expect, it } from "vitest";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { htmlToPlainText } from "@/lib/html-to-text";

describe("htmlToPlainText", () => {
  it("strips tags and decodes entities from Builder rich text (LAC-3559 repro)", () => {
    const html =
      '<p class="">Harmony Farmers Market events are hosted at the Tomlinson-Moore Family Park. Food trucks &amp; vendors may register to participate.</p>';
    expect(htmlToPlainText(html)).toBe(
      "Harmony Farmers Market events are hosted at the Tomlinson-Moore Family Park. Food trucks & vendors may register to participate."
    );
  });

  it("passes plain strings through unchanged", () => {
    expect(htmlToPlainText("Community potluck at the park")).toBe("Community potluck at the park");
  });

  it("returns empty string for null, undefined, and empty markup", () => {
    expect(htmlToPlainText(null)).toBe("");
    expect(htmlToPlainText(undefined)).toBe("");
    expect(htmlToPlainText("<p></p>")).toBe("");
  });

  it("separates block elements and line breaks with spaces", () => {
    expect(htmlToPlainText("<p>First</p><p>Second</p>")).toBe("First Second");
    expect(htmlToPlainText("One<br>Two")).toBe("One Two");
  });

  it("decodes common named entities", () => {
    expect(htmlToPlainText("Fish &amp; Chips &lt;fresh&gt; &quot;daily&quot; at Joe&#39;s")).toBe(
      'Fish & Chips <fresh> "daily" at Joe\'s'
    );
    expect(htmlToPlainText("a&nbsp;b")).toBe("a b");
  });

  it("decodes numeric and hex entities", () => {
    expect(htmlToPlainText("It&#8217;s here &#x2014; today")).toBe("It’s here — today");
  });

  it("does not double-decode escaped entities", () => {
    // "&amp;lt;" is the literal text "&lt;", not "<"
    expect(htmlToPlainText("&amp;lt;")).toBe("&lt;");
  });

  it("leaves unknown or invalid entities as-is", () => {
    expect(htmlToPlainText("&bogus; &#xfffffff;")).toBe("&bogus; &#xfffffff;");
  });

  it("collapses whitespace", () => {
    expect(htmlToPlainText("<p>  spaced\n\n  out  </p>")).toBe("spaced out");
  });
});

describe("extractTextFromRichText", () => {
  it("strips HTML from Builder rich text strings", () => {
    expect(extractTextFromRichText('<p class="">Food trucks &amp; vendors</p>')).toBe(
      "Food trucks & vendors"
    );
  });

  it("passes plain strings through unchanged", () => {
    expect(extractTextFromRichText("Just text")).toBe("Just text");
  });

  it("still extracts text from Lexical editor state", () => {
    const lexical = {
      root: {
        children: [{ type: "paragraph", children: [{ type: "text", text: "Hello" }] }],
      },
    };
    expect(extractTextFromRichText(lexical)).toBe("Hello");
  });
});
