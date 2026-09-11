import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TownBusinessDirectory } from "@/components/modules/builder/town/town-business-directory";
import type { TownBusiness } from "@/data/town/types";
import { useBuilderPaginatedData } from "@/lib/builder-data";

vi.mock("@/lib/builder-data", () => ({
  useBuilderPaginatedData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseBuilderPaginatedData = vi.mocked(useBuilderPaginatedData);

// Builder.io stores richText fields as HTML strings (LAC-3559), so a business
// description edited in Builder reaches the directory as "<p>…&amp;…</p>".
const business: TownBusiness = {
  id: 1,
  name: "Harmony Hardware",
  slug: "harmony-hardware",
  description:
    '<p class="">Tools, paint &amp; friendly advice for every project.</p>',
  logo: null,
  category: "retail",
  contactName: "Pat Smith",
  phone: "555-1234",
  address: "1 Main St",
  city: "Harmony",
  stateCode: "NC",
  zipCode: "28102",
  hours: "Mon-Fri 9-5",
  isVerified: true,
  isFeatured: false,
};

describe("TownBusinessDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBuilderPaginatedData.mockReturnValue({
      docs: [business],
      allData: [business],
      totalDocs: 1,
      totalPages: 1,
      page: 1,
      loading: false,
      error: null,
    });
  });

  it("renders the description as plain text, not raw HTML (LAC-3643)", () => {
    render(<TownBusinessDirectory />);

    expect(
      screen.getByText("Tools, paint & friendly advice for every project.")
    ).toBeInTheDocument();
    // The raw markup and undecoded entity must not leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
