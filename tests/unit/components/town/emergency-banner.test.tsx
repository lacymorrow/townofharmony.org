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

  // Staff upload the file in Builder, so it must win over a typed link and
  // the banner must still show exactly one "View details".
  it("links an uploaded attachment ahead of a typed link", async () => {
    const file = "https://cdn.builder.io/o/assets%2Fabc%2Fparade.pdf?alt=media";
    mockGetActiveAnnouncements.mockResolvedValue([
      { ...announcement, file, externalUrl: "https://example.com" },
    ]);

    await renderBanner();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", file);
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("falls back to the legacy externalUrl when nothing else is set", async () => {
    mockGetActiveAnnouncements.mockResolvedValue([
      { ...announcement, link: "  ", externalUrl: "https://example.com/info" },
    ]);

    await renderBanner();

    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      "https://example.com/info"
    );
  });

  it("renders nothing when there is no active announcement", async () => {
    mockGetActiveAnnouncements.mockResolvedValue([]);

    const { container } = await renderBanner();

    expect(container).toBeEmptyDOMElement();
  });
});
