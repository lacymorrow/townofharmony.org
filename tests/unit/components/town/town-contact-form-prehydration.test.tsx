/**
 * Regression guard for LAC-8831: a topic picked BEFORE React hydrated was reset
 * to the disabled placeholder, so the form refused to submit.
 *
 * This is a different path from LAC-8826 (which was the Builder list changing
 * underneath an already-hydrated select). Here the select is server-rendered
 * and interactive as plain HTML long before the client bundle runs, so on a
 * slow phone a visitor can pick a topic while the page is still inert. The
 * pick lives only in the DOM: `onChange` is not attached yet, so
 * `chosenInquiry` stays null. Hydration itself leaves the DOM value alone, but
 * the select is controlled, so the FIRST re-render after it — the Builder fetch
 * landing ~300ms later, or Turnstile verifying — writes `value=""` back over
 * the element and the choice is gone, back on the *disabled* placeholder, which
 * the HTML form-data algorithm omits from FormData entirely. That is why the
 * LAC-8825 prod probe lost the value in 4 of 6 runs and saw no POST: every run
 * that re-rendered lost it. Each test below therefore re-renders once, which is
 * what a real page always does.
 *
 * These tests hydrate for real (`renderToString` -> raw DOM pick ->
 * `hydrateRoot`) because that is the only way to reproduce it: a plain
 * `render()` never has a pre-hydration window.
 */
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// Turnstile injects a Cloudflare script and reads `env`; neither belongs in a
// jsdom test, and its token lives in a ref rather than state.
vi.mock("@/components/turnstile", () => ({
  Turnstile: () => null,
}));

import { TownContactForm } from "@/components/modules/town/town-contact-form";

/** The live Builder.io list — note it has neither `general` nor `other`. */
const builderInquiryTypes: TownContactInquiryType[] = [
  { value: "event vendor interest", label: "Event Vendor Interest", isActive: true },
  { value: "general inquiry | other", label: "General Inquiry | Other", isActive: true },
  { value: "parks", label: "Parks & Recreation", isActive: true },
  { value: "permits", label: "Permits & Zoning", isActive: true },
];

const setBuilderPhase = (phase: "loading" | "loaded") => {
  useBuilderDataMock.mockImplementation(() => ({
    data: phase === "loading" ? contactInquiryTypes : builderInquiryTypes,
    loading: phase === "loading",
    error: null,
  }));
};

let container: HTMLDivElement | null = null;
let root: Root | null = null;

/** Puts the server-rendered markup in the document, exactly as a page load does. */
const renderOnServer = () => {
  container = document.createElement("div");
  container.innerHTML = renderToString(<TownContactForm />);
  document.body.appendChild(container);
  return container.querySelector("#inquiryType") as HTMLSelectElement;
};

const hydrate = async () => {
  await act(async () => {
    root = hydrateRoot(container as HTMLDivElement, <TownContactForm />);
  });
};

const rerender = async () => {
  await act(async () => {
    root?.render(<TownContactForm />);
  });
};

const getSelect = () => container?.querySelector("#inquiryType") as HTMLSelectElement;

describe("TownContactForm pre-hydration pick (LAC-8831)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitMock.mockResolvedValue({ success: true });
    setBuilderPhase("loading");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false }))
    );
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    root = null;
    container?.remove();
    container = null;
  });

  it("keeps a topic picked before hydration across the next re-render", async () => {
    const select = renderOnServer();
    expect(select.value).toBe("");

    // The raw DOM pick. No React listener exists yet, which is the whole bug.
    select.value = "general";

    await hydrate();
    // Any later state change re-runs the controlled select. Same option list
    // here, so only the recovered value is under test.
    await rerender();

    // Hydration reuses the server node, so this is the same element.
    expect(getSelect()).toBe(select);
    expect(select.value).toBe("general");
    expect(select.selectedOptions[0]?.disabled).toBe(false);
    expect(new FormData(select.form as HTMLFormElement).get("inquiryType")).toBe("general");
  });

  it("submits that topic instead of refusing with a validation error", async () => {
    const select = renderOnServer();
    select.value = "general";

    await hydrate();
    setBuilderPhase("loaded");
    await rerender();

    const field = (name: string) =>
      container?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement;
    await act(async () => {
      for (const [name, value] of [
        ["firstName", "Jane"],
        ["lastName", "Resident"],
        ["email", "jane@example.com"],
        ["phone", "555-867-5309"],
        ["message", "I would like to ask the town about a general matter."],
      ] as const) {
        const el = field(name);
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    await act(async () => {
      (select.form as HTMLFormElement).requestSubmit();
    });

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock.mock.calls[0][0]).toMatchObject({ inquiryType: "general" });
    expect(container?.textContent).not.toContain("Please select an inquiry type");
  });

  it("keeps a pre-hydration pick that the Builder list later drops", async () => {
    const select = renderOnServer();
    select.value = "general";

    await hydrate();

    // The Builder fetch lands and replaces the list; `general` is not in it.
    setBuilderPhase("loaded");
    await rerender();

    expect(select.value).toBe("general");
    expect(select.selectedOptions[0]?.disabled).toBe(false);
    expect(new FormData(select.form as HTMLFormElement).get("inquiryType")).toBe("general");
  });

  it("stays on the placeholder when nothing was picked before hydration", async () => {
    const select = renderOnServer();

    await hydrate();

    expect(select.value).toBe("");
    expect(select.querySelector('option[value="general"]')).not.toBeNull();

    setBuilderPhase("loaded");
    await rerender();

    // Retention is keyed to a real choice, so no fallback-only option lingers.
    expect(select.value).toBe("");
    expect(select.querySelector('option[value="general"]')).toBeNull();
  });
});
