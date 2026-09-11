import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TownHeader } from "@/components/town/town-header";
import { settings } from "@/data/town/settings";

// TownSearch pulls in client-side search machinery irrelevant to this test.
vi.mock("@/components/town/town-search", () => ({
  TownSearch: () => null,
}));

/**
 * Regression test for LAC-3516 (Ahrefs site audit).
 *
 * The header rendered the site title as an <h1> on every page, so each page
 * had two h1 elements (the header's plus the page's own). The h1 belongs to
 * page content; the header logo lockup must not claim it.
 */
describe("TownHeader (LAC-3516)", () => {
  it("does not render an h1 element", () => {
    const { container } = render(<TownHeader settings={settings} />);
    expect(container.querySelectorAll("h1")).toHaveLength(0);
  });

  it("still displays the site title", () => {
    const { getByText } = render(<TownHeader settings={settings} />);
    expect(getByText(settings.siteTitle)).toBeTruthy();
  });
});
