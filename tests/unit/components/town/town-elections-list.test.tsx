import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TownElectionsList } from "@/components/modules/builder/town/town-elections-list";
import type { TownElection } from "@/data/town/types";
import { useBuilderPaginatedData } from "@/lib/builder-data";

vi.mock("@/lib/builder-data", () => ({
  useBuilderPaginatedData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseBuilderPaginatedData = vi.mocked(useBuilderPaginatedData);

// Builder.io stores richText fields as HTML strings (LAC-3559), so a description
// edited in Builder reaches the component as "<p>…&amp;…</p>", not plain text.
const election: TownElection = {
  id: 1,
  title: "2026 Municipal Election",
  slug: "2026-municipal-election",
  description:
    '<p class="">Vote for mayor &amp; town council. Polls open at 7am.</p>',
  electionDate: "2026-11-03T00:00:00.000Z",
  registrationDeadline: "2026-10-05T00:00:00.000Z",
  earlyVotingStart: "2026-10-20T00:00:00.000Z",
  earlyVotingEnd: "2026-10-31T00:00:00.000Z",
  pollingLocations: [],
  isActive: true,
  candidates: [],
};

describe("TownElectionsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBuilderPaginatedData.mockReturnValue({
      docs: [election],
      allData: [election],
      totalDocs: 1,
      totalPages: 1,
      page: 1,
      loading: false,
      error: null,
    });
  });

  it("renders the description as plain text, not raw HTML (LAC-3644)", () => {
    render(<TownElectionsList />);

    expect(
      screen.getByText("Vote for mayor & town council. Polls open at 7am.")
    ).toBeInTheDocument();
    // The raw markup and undecoded entity must not leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
