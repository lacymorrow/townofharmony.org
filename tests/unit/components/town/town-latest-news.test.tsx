import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TownLatestNews } from "@/components/modules/builder/town/town-latest-news";
import type { TownNews } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";

vi.mock("@/lib/builder-data", () => ({
  useBuilderData: vi.fn(),
}));

const mockUseBuilderData = vi.mocked(useBuilderData);

// Builder.io stores richText fields as HTML strings (LAC-3559), so an excerpt
// edited in Builder reaches the card as "<p>…&amp;…</p>", not plain text.
const article: TownNews = {
  id: 1,
  title: "Town Hall Reopens",
  slug: "town-hall-reopens",
  excerpt:
    '<p class="">Doors open Monday &amp; parking is free. Come &ldquo;early&rdquo;.</p>',
  content: "",
  featuredImage: null,
  status: "published",
  publishedAt: "2026-08-01T00:00:00.000Z",
  categories: [],
  tags: [],
};

describe("TownLatestNews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBuilderData.mockReturnValue({
      data: [article],
      loading: false,
      error: null,
    });
  });

  it("renders the excerpt as plain text, not raw HTML (LAC-3640)", () => {
    render(<TownLatestNews />);

    expect(
      screen.getByText('Doors open Monday & parking is free. Come “early”.')
    ).toBeInTheDocument();
    // The raw markup and undecoded entity must not leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
