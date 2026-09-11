import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BusinessDetail } from "@/components/town/business/business-detail";
import type { TownBusiness } from "@/data/town/types";

// The description path is covered by the PayloadRichText ticket; stub it so this
// test isolates the string-`hours` branch, which is exactly the Builder shape.
vi.mock("@/components/town/payload-rich-text", () => ({
  PayloadRichText: ({ content }: { content: string }) => <div>{content}</div>,
}));

// Builder.io stores richText fields as HTML strings (LAC-3559), so `hours`
// edited in Builder reaches business-detail as "<p>…&amp;…</p>" (LAC-3643).
const business: TownBusiness = {
  id: 1,
  name: "Harmony Hardware",
  slug: "harmony-hardware",
  description: "",
  logo: null,
  category: "retail",
  contactName: "Pat Smith",
  phone: "555-1234",
  address: "1 Main St",
  city: "Harmony",
  stateCode: "NC",
  zipCode: "28102",
  hours: '<p class="">Mon-Fri 9-5 &amp; Sat 10-2</p>',
  isVerified: true,
  isFeatured: false,
};

describe("BusinessDetail", () => {
  it("renders string hours as plain text, not raw HTML (LAC-3643)", () => {
    render(<BusinessDetail business={business} />);

    expect(screen.getByText("Mon-Fri 9-5 & Sat 10-2")).toBeInTheDocument();
    // The raw markup and undecoded entity must not leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
