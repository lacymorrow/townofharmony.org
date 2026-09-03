import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PayloadRichText } from "@/components/town/payload-rich-text";

// Builder.io stores richText fields as HTML strings (usually a single line),
// so a body edited in Builder reaches this component as "<p>…</p>" markup.
// Regression for LAC-3639: the string branch used to split on "\n" and render
// each line inside <p>{line}</p>, printing the raw tags as literal text.
describe("PayloadRichText", () => {
  it("renders Builder HTML strings as markup, not literal text", () => {
    const { container } = render(
      <PayloadRichText content='<p class="">Council meets <strong>Tuesday</strong>.</p>' />
    );

    // The HTML is parsed into real elements…
    expect(container.querySelector("p")).not.toBeNull();
    expect(container.querySelector("strong")?.textContent).toBe("Tuesday");
    // …and the raw tags never appear as visible text.
    expect(container.textContent).not.toContain("<p");
    expect(container.textContent).not.toContain("<strong>");
    expect(container.textContent).toContain("Council meets Tuesday.");
  });

  it("sanitizes dangerous markup out of Builder HTML", () => {
    const { container } = render(
      <PayloadRichText content='<p>Safe</p><script>alert("xss")</script>' />
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("Safe");
  });

  it("still renders plain-text static strings as paragraphs", () => {
    const { container } = render(
      <PayloadRichText content={"First line\nSecond line"} />
    );

    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.textContent).toBe("First line");
    expect(paragraphs[1]?.textContent).toBe("Second line");
  });

  it("renders nothing for empty content", () => {
    const { container } = render(<PayloadRichText content={null} />);
    expect(container.firstChild).toBeNull();
  });
});
