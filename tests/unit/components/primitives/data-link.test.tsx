import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataLink } from "@/components/primitives/data-link";

// The unit-test `next/link` shim renders a plain anchor, so these assert on the
// attributes a visitor actually feels: a file or external href opens in a new
// tab, an in-app route does not (and so stays a client-side navigation).
describe("DataLink", () => {
  it("opens a static file in a new tab (LAC-6284)", () => {
    render(<DataLink href="/docs/2026-christmas-parade-application.pdf">View details</DataLink>);

    const link = screen.getByRole("link", { name: "View details" });
    expect(link).toHaveAttribute("href", "/docs/2026-christmas-parade-application.pdf");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("opens an external site in a new tab", () => {
    render(<DataLink href="https://example.com">Learn more</DataLink>);

    const link = screen.getByRole("link", { name: "Learn more" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("leaves an in-app route in the same tab", () => {
    render(<DataLink href="/about">About</DataLink>);

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
  });

  it("keeps a mailto in the same tab", () => {
    render(<DataLink href="mailto:clerk@townofharmony.org">Email</DataLink>);

    const link = screen.getByRole("link", { name: "Email" });
    expect(link).toHaveAttribute("href", "mailto:clerk@townofharmony.org");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders the fallback instead of a link for an unsafe href", () => {
    render(
      <DataLink href="javascript:alert(1)" fallback={<span>Parade application</span>}>
        Parade application
      </DataLink>
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Parade application")).toBeInTheDocument();
  });

  it("renders nothing for a missing href when no fallback is given", () => {
    const { container } = render(<DataLink href={undefined}>View details</DataLink>);

    expect(container).toBeEmptyDOMElement();
  });

  it("passes through className and other anchor attributes", () => {
    render(
      <DataLink href="/docs/parade.pdf" className="underline" aria-label="Parade PDF">
        View
      </DataLink>
    );

    const link = screen.getByRole("link", { name: "Parade PDF" });
    expect(link).toHaveClass("underline");
  });
});
