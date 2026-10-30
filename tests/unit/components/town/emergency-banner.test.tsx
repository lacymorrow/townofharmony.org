import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmergencyBanner } from "@/components/town/emergency-banner";
import { getActiveAnnouncements } from "@/lib/town-data";

vi.mock("@/lib/town-data", () => ({
  getActiveAnnouncements: vi.fn(),
}));

const mockGetActiveAnnouncements = vi.mocked(getActiveAnnouncements);

const announcement = {
  id: 2,
  title: "Christmas Parade Application Now Available",
  content: "Entries are due Wednesday, December 2. Download the application.",
  link: "/docs/2026-christmas-parade-application.pdf",
  level: "info" as const,
  isActive: true,
  endsAt: "2026-12-03T00:00:00.000Z",
  createdAt: "2026-10-27",
};

const renderBanner = async () => render(await EmergencyBanner());

// LAC-6284: the banner rendered `alert.link` through `next/link`, so clicking
// "View details" asked the App Router for a path with no route, the catch-all
// served the 404 page, and only a reload produced the PDF.
describe("EmergencyBanner", () => {
  beforeEach(() => {
    mockGetActiveAnnouncements.mockReset();
  });

  it("opens a PDF announcement link in a new tab instead of routing to it", async () => {
    mockGetActiveAnnouncements.mockResolvedValue([announcement]);

    await renderBanner();

    const link = screen.getByRole("link", { name: "View details" });
    expect(link).toHaveAttribute("href", "/docs/2026-christmas-parade-application.pdf");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("still navigates in-app for an announcement that points at a route", async () => {
    mockGetActiveAnnouncements.mockResolvedValue([{ ...announcement, link: "/contact" }]);

    await renderBanner();

    const link = screen.getByRole("link", { name: "View details" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders nothing when there is no active announcement", async () => {
    mockGetActiveAnnouncements.mockResolvedValue([]);

    const { container } = await renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
