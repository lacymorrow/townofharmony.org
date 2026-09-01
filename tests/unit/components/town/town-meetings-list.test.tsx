import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TownMeetingsList } from "@/components/modules/builder/town/town-meetings-list";
import type { TownMeeting } from "@/data/town/types";
import { useBuilderPaginatedData } from "@/lib/builder-data";

vi.mock("@/lib/builder-data", () => ({
  useBuilderPaginatedData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUseBuilderPaginatedData = vi.mocked(useBuilderPaginatedData);

const baseMeeting: TownMeeting = {
  id: 1,
  title: "Town Council Meeting",
  slug: "town-council-meeting",
  type: "Council",
  meetingDate: "2026-05-11T00:00:00.000Z",
  meetingTime: "6:00 PM",
  location: "Campbell Town Hall",
  agenda: "",
  attendees: [],
  isPublic: true,
};

// Builder.io returns cleared fields as empty strings, not undefined (LAC-3622),
// so a meeting saved without a type reaches the component as type: "".
const meetings: TownMeeting[] = [
  baseMeeting,
  {
    ...baseMeeting,
    id: 2,
    title: "Special Meeting",
    slug: "special-meeting",
    type: "" as TownMeeting["type"],
    meetingDate: "2026-06-22T00:00:00.000Z",
    minutes: "Minutes text",
  },
];

const paginatedResult = {
  docs: meetings,
  allData: meetings,
  totalDocs: meetings.length,
  totalPages: 1,
  page: 1,
  loading: false,
  error: null,
};

describe("TownMeetingsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBuilderPaginatedData.mockReturnValue(paginatedResult);
  });

  it("renders the type pill when a meeting has a type", () => {
    render(<TownMeetingsList />);
    // "Council" also appears as a filter <option>; the pill is the span.
    const pills = screen.getAllByText("Council").filter((el) => el.tagName === "SPAN");
    expect(pills).toHaveLength(1);
    expect(pills[0]?.className).toContain("rounded-full");
  });

  it("does not render an empty type pill when the type is blank (LAC-3622)", () => {
    const { container } = render(<TownMeetingsList />);

    expect(screen.getByText("Special Meeting")).toBeInTheDocument();
    expect(screen.getByText("Minutes Available")).toBeInTheDocument();

    const emptyPills = Array.from(container.querySelectorAll("span")).filter(
      (span) => span.className.includes("rounded-full") && span.textContent?.trim() === ""
    );
    expect(emptyPills).toHaveLength(0);
  });
});
