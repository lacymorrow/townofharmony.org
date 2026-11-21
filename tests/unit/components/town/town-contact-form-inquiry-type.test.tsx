/**
 * Regression guard for LAC-8826: the inquiry-type select used to lose a chosen
 * value, so the form refused to submit and no POST was ever made.
 *
 * The cause is a list that changes underneath the visitor. `useBuilderData`
 * returns the static fallback (`contactInquiryTypes`) synchronously and swaps
 * in the Builder.io `town-contact-inquiry-type` entries when its fetch
 * resolves ~300ms later. Those two lists are not the same value-set: the
 * fallback has `general` and `other`, which the live Builder model does not.
 *
 * So a visitor who picked "General Inquiry" — the FIRST option in the fallback,
 * and the one most residents want — before the fetch landed had their choice
 * silently cleared, the select reverted to its `disabled` placeholder, and
 * because the HTML form-data algorithm skips a selected-but-disabled option,
 * `inquiryType` vanished from FormData entirely rather than arriving empty.
 * That is exactly what the production probe captured.
 *
 * `setBuilderPhase` below mirrors the real hook's two phases. The Builder list
 * is the one live on prod on 2026-11-21.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { contactInquiryTypes } from "@/data/town/contact-inquiry-types";
import type { TownContactInquiryType } from "@/data/town/types";

const { useBuilderDataMock, submitMock } = vi.hoisted(() => ({
  useBuilderDataMock: vi.fn(),
  submitMock: vi.fn(),
}));

vi.mock("@/lib/builder-data", () => ({
  useBuilderData: useBuilderDataMock,
}));

vi.mock("@/server/actions/town-contact", () => ({
  submitTownContactForm: submitMock,
}));

// Turnstile reads `env` and injects a Cloudflare script; neither belongs in a
// jsdom unit test. The token is held in a ref, not state, so a no-op widget
// does not change the submit path this test exercises.
vi.mock("@/components/turnstile", () => ({
  Turnstile: () => null,
}));

import { TownContactForm } from "@/components/modules/town/town-contact-form";

/** The live Builder.io list. Note: no `general`, no `other`. */
const builderInquiryTypes: TownContactInquiryType[] = [
  { value: "event vendor interest", label: "Event Vendor Interest", isActive: true },
  { value: "general inquiry | other", label: "General Inquiry | Other", isActive: true },
  { value: "reservation", label: "Community Center Reservation", isActive: true },
  { value: "parks", label: "Parks & Recreation", isActive: true },
  { value: "job posting response", label: "Job Posting Response", isActive: true },
  { value: "sewer-residential-intown", label: "Sewer In-Town Residential Service", isActive: true },
  {
    value: "sewer-nonresidential-intown",
    label: "Sewer In-Town Nonresidential Service",
    isActive: true,
  },
  {
    value: "sewer-residential-outtown",
    label: "Sewer Out-of-Town Residential Service",
    isActive: true,
  },
  {
    value: "sewer-nonresidential-outtown",
    label: "Sewer Out-of-Town Nonresidential Service",
    isActive: true,
  },
  { value: "suggestion", label: "Suggestion", isActive: true },
  { value: "roads", label: "Roads & Infrastructure", isActive: true },
  { value: "taxes", label: "Taxes & Billing", isActive: true },
  { value: "permits", label: "Permits & Zoning", isActive: true },
];

/** Drives the fallback -> Builder swap that `useBuilderData` performs for real. */
const setBuilderPhase = (phase: "loading" | "loaded") => {
  useBuilderDataMock.mockImplementation(() => ({
    data: phase === "loading" ? contactInquiryTypes : builderInquiryTypes,
    loading: phase === "loading",
    error: null,
  }));
};

const getSelect = () => screen.getByLabelText(/Inquiry Type/i) as HTMLSelectElement;

const fillRequiredFieldsExceptInquiry = () => {
  fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Jane" } });
  fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Resident" } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: "555-867-5309" } });
  fireEvent.change(screen.getByLabelText(/Message/i), {
    target: { value: "I would like to ask the town about a general matter." },
  });
};

describe("TownContactForm inquiry type (LAC-8826)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitMock.mockResolvedValue({ success: true });
    setBuilderPhase("loading");
    // jsdom implements neither matchMedia nor scrollIntoView, and the success
    // panel uses both to bring itself into view once a send succeeds.
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false }))
    );
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("keeps a value chosen from the fallback list once the Builder list arrives", async () => {
    const { rerender } = render(<TownContactForm />);

    fireEvent.change(getSelect(), { target: { value: "general" } });
    expect(getSelect().value).toBe("general");

    // The Builder fetch resolves and replaces the option list. "general" is
    // not in it.
    setBuilderPhase("loaded");
    rerender(<TownContactForm />);

    // The visitor's choice must survive, and must still be a selected,
    // enabled option — a selected-but-disabled option is dropped from
    // FormData by the browser, which is how the value went missing entirely.
    await waitFor(() => expect(getSelect().value).toBe("general"));
    const selected = getSelect().selectedOptions[0];
    expect(selected).toBeDefined();
    expect(selected.disabled).toBe(false);
    expect(selected.value).toBe("general");
    expect(new FormData(getSelect().form as HTMLFormElement).get("inquiryType")).toBe("general");
  });

  it("submits that value instead of refusing with a validation error", async () => {
    const { rerender } = render(<TownContactForm />);

    fireEvent.change(getSelect(), { target: { value: "general" } });
    fillRequiredFieldsExceptInquiry();

    setBuilderPhase("loaded");
    rerender(<TownContactForm />);

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    // The production symptom was no call at all, plus this message on screen.
    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    expect(submitMock.mock.calls[0][0]).toMatchObject({ inquiryType: "general" });
    expect(screen.queryByText("Please select an inquiry type")).not.toBeInTheDocument();
  });

  it("still submits a value that both lists share, without duplicating it", async () => {
    const { rerender } = render(<TownContactForm />);

    fireEvent.change(getSelect(), { target: { value: "permits" } });
    fillRequiredFieldsExceptInquiry();

    setBuilderPhase("loaded");
    rerender(<TownContactForm />);

    expect(getSelect().querySelectorAll('option[value="permits"]')).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    expect(submitMock.mock.calls[0][0]).toMatchObject({ inquiryType: "permits" });
  });

  it("retains nothing when the visitor never chose anything", () => {
    const { rerender } = render(<TownContactForm />);

    setBuilderPhase("loaded");
    rerender(<TownContactForm />);

    // Retention is keyed to an actual choice, so a fallback-only option must
    // not linger in a list the visitor never touched.
    expect(getSelect().querySelector('option[value="general"]')).toBeNull();
    expect(getSelect().value).toBe("");
  });
});
