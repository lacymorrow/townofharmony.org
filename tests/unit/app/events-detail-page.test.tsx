import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TownEvent } from "@/data/town/types";

// The non-Builder fallback detail view rendered `event.content` raw, so any
// event without a Builder page override printed its entire body as literal HTML
// (LAC-3642). Builder richText fields store HTML strings (LAC-3559).

// Force the fallback branch: no Builder page override for this route.
vi.mock("@/lib/builder-data-server", () => ({
  getBuilderPageContent: vi.fn(async () => null),
}));

vi.mock("@/lib/builder-io/builder-io", () => ({
  RenderBuilderContent: () => null,
}));

const getEventBySlug = vi.fn();
vi.mock("@/lib/town-data", () => ({
  getEventBySlug: (slug: string) => getEventBySlug(slug),
  resolveEvents: vi.fn(async () => []),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

import EventDetailPage from "@/app/(app)/(town)/events/[slug]/page";

const event: TownEvent = {
  id: 1,
  title: "Fall Festival",
  slug: "fall-festival",
  description: "A community celebration.",
  content: '<p class="">Join us for food, music &amp; fun in the town square.</p>',
  featuredImage: null,
  eventDate: "2026-10-15",
  eventTime: "10:00 AM",
  endTime: "2:00 PM",
  locationAddress: null,
  organizer: null,
  contactEmail: "",
  contactPhone: "",
  status: "upcoming",
  isRecurring: false,
  categories: [],
  tags: [],
};

describe("EventDetailPage fallback body (LAC-3642)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEventBySlug.mockResolvedValue(event);
  });

  it("renders the content as sanitized HTML, not literal markup", async () => {
    const ui = await EventDetailPage({
      params: Promise.resolve({ slug: "fall-festival" }),
    });
    render(ui);

    // The decoded text is present as real markup...
    expect(
      screen.getByText("Join us for food, music & fun in the town square.")
    ).toBeInTheDocument();
    // ...and the raw tags / undecoded entity never leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
