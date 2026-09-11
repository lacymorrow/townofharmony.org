import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TownPointsOfInterest } from "@/components/modules/builder/town/town-points-of-interest";
import type { TownPointOfInterest } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";

vi.mock("@/lib/builder-data", () => ({
  useBuilderData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseBuilderData = vi.mocked(useBuilderData);

// Builder.io stores richText fields as HTML strings (LAC-3559), so a description
// edited in Builder reaches the component as "<p>…&amp;…</p>", not plain text.
const poi: TownPointOfInterest = {
  id: 1,
  name: "Tomlinson-Moore Family Park",
  slug: "tomlinson-moore-family-park",
  description:
    '<p class="">Trails, picnic tables &amp; a playground for all ages.</p>',
  image: null,
  address: "100 Park Ln",
  hours: "Dawn to dusk",
  amenities: [],
};

describe("TownPointsOfInterest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBuilderData.mockReturnValue({
      data: [poi],
      loading: false,
      error: null,
    });
  });

  it("renders the description as plain text, not raw HTML (LAC-3644)", () => {
    render(<TownPointsOfInterest />);

    expect(
      screen.getByText("Trails, picnic tables & a playground for all ages.")
    ).toBeInTheDocument();
    // The raw markup and undecoded entity must not leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
