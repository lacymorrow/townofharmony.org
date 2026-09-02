import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BusinessCard } from "@/components/town/business/business-card";

// Builder.io stores richText fields as HTML strings (LAC-3559). BusinessCard is
// a reusable card, so even though its current caller pre-strips, the component
// must not leak raw markup for any other caller (LAC-3643).
const business = {
  id: 1,
  name: "Harmony Hardware",
  slug: "harmony-hardware",
  description:
    '<p class="">Tools, paint &amp; friendly advice for every project.</p>',
  category: "retail",
  address: "1 Main St",
  phone: "555-1234",
  email: null,
  website: null,
  hours: null,
  logo: null,
  isVerified: true,
  isFeatured: false,
};

describe("BusinessCard", () => {
  it("renders the description as plain text, not raw HTML (LAC-3643)", () => {
    render(<BusinessCard business={business} />);

    expect(
      screen.getByText("Tools, paint & friendly advice for every project.")
    ).toBeInTheDocument();
    // The raw markup and undecoded entity must not leak into the DOM.
    expect(screen.queryByText(/<p/)).not.toBeInTheDocument();
    expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
  });
});
