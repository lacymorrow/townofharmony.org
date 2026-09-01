import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TownEmergencyServices } from "@/components/modules/builder/town/town-emergency-services";
import { emergencyServices } from "@/data/town/emergency-services";
import type { TownEmergencyService } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";

vi.mock("@/lib/builder-data", () => ({
  useBuilderData: vi.fn(),
}));

const mockUseBuilderData = vi.mocked(useBuilderData);

const services: TownEmergencyService[] = [
  {
    id: 1,
    title: "Emergency Services",
    description:
      "For life-threatening emergencies, fire, or crimes in progress. Call 911 immediately.",
    phone: "911",
    category: "immediate",
    icon: "Phone",
    preparedness: [],
  },
  {
    id: 2,
    title: "Iredell County Sheriff's Office",
    description: "Law enforcement services for the Harmony community.",
    phone: "(704) 878-3180",
    category: "public-safety",
    icon: "Shield",
    preparedness: ["Lock doors and windows"],
  },
  {
    id: 3,
    title: "Hospital",
    description: "Iredell Memorial Hospital provides emergency medical care.",
    phone: "(704) 873-5661",
    category: "health",
    icon: "Stethoscope",
    preparedness: [],
  },
];

describe("TownEmergencyServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBuilderData.mockReturnValue({
      data: services,
      loading: false,
      error: null,
    });
  });

  it("renders the page header with the 911 call block inside it", () => {
    render(<TownEmergencyServices />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Emergency Services",
    });
    const hero = heading.closest("section");
    expect(hero).not.toBeNull();

    // The 911 tap-to-call link lives inside the header section
    const heroCallLink = within(hero as HTMLElement).getByRole("link", {
      name: /911/,
    });
    expect(heroCallLink).toHaveAttribute("href", "tel:911");
  });

  it("renders the default subtitle in the header", () => {
    render(<TownEmergencyServices />);
    expect(screen.getByText("Emergency alerts, contacts, and preparedness")).toBeInTheDocument();
  });

  it("supports custom title and subtitle", () => {
    render(<TownEmergencyServices title="Custom Title" subtitle="Custom subtitle" />);
    expect(screen.getByRole("heading", { level: 1, name: "Custom Title" })).toBeInTheDocument();
    expect(screen.getByText("Custom subtitle")).toBeInTheDocument();
  });

  it("does not render a standalone 911 card outside the header", () => {
    render(<TownEmergencyServices />);
    // Exactly one tel:911 link on the page — the one in the header
    const links = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === "tel:911");
    expect(links).toHaveLength(1);
  });

  it("still renders non-immediate services grouped by category", () => {
    render(<TownEmergencyServices />);
    expect(screen.getByText("Public Safety")).toBeInTheDocument();
    expect(screen.getByText("Health Services")).toBeInTheDocument();
    expect(screen.getByText("Iredell County Sheriff's Office")).toBeInTheDocument();
    expect(screen.getByText("Hospital")).toBeInTheDocument();
  });

  it("renders the header even while Builder data is loading", () => {
    mockUseBuilderData.mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });
    render(<TownEmergencyServices />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Emergency Services" })
    ).toBeInTheDocument();
  });
});

describe("emergency services fallback data", () => {
  it("has 911 as the only immediate entry (fire card removed, LAC-3583)", () => {
    const immediate = emergencyServices.filter((s) => s.category === "immediate");
    expect(immediate).toHaveLength(1);
    expect(immediate[0]?.phone).toBe("911");
  });
});
