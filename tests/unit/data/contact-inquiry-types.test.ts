import { describe, expect, it } from "vitest";
import {
  contactInquiryTypes,
  isGeneralInquiry,
  pinGeneralInquiryFirst,
} from "@/data/town/contact-inquiry-types";

// Mirrors the live Builder.io entries as of LAC-3550: staff renamed the
// general option's value to "general inquiry | other", which broke the old
// value === "general" default/pin logic.
const liveBuilderOptions = [
  { value: "permits", label: "Permits & Zoning" },
  { value: "taxes", label: "Taxes & Billing" },
  { value: "roads", label: "Roads & Infrastructure" },
  { value: "suggestion", label: "Suggestion" },
  { value: "sewer-nonresidential-outtown", label: "Sewer Out-of-Town Nonresidential Service" },
  { value: "sewer-residential-outtown", label: "Sewer Out-of-Town Residential Service" },
  { value: "sewer-nonresidential-intown", label: "Sewer In-Town Nonresidential Service" },
  { value: "sewer-residential-intown", label: "Sewer In-Town Residential Service" },
  { value: "general inquiry | other", label: "General Inquiry | Other" },
  { value: "job posting response", label: "Job Posting Response " },
  { value: "parks", label: "Parks & Recreation" },
  { value: "reservation", label: "Community Center Reservation" },
];

describe("isGeneralInquiry", () => {
  it("matches the static fallback general entry", () => {
    expect(isGeneralInquiry({ value: "general", label: "General Inquiry" })).toBe(true);
  });

  it("matches the staff-edited Builder entry (LAC-3550 regression)", () => {
    expect(
      isGeneralInquiry({ value: "general inquiry | other", label: "General Inquiry | Other" })
    ).toBe(true);
  });

  it("matches by label even when the value drifts entirely", () => {
    expect(isGeneralInquiry({ value: "misc", label: "General questions" })).toBe(true);
  });

  it("does not match unrelated options", () => {
    for (const option of liveBuilderOptions.filter((o) => o.value !== "general inquiry | other")) {
      expect(isGeneralInquiry(option)).toBe(false);
    }
  });
});

describe("pinGeneralInquiryFirst", () => {
  it("moves the staff-edited general entry from mid-list to the top (LAC-3550 regression)", () => {
    const pinned = pinGeneralInquiryFirst(liveBuilderOptions);
    expect(pinned[0]?.value).toBe("general inquiry | other");
    expect(pinned).toHaveLength(liveBuilderOptions.length);
  });

  it("preserves the relative order of all other options", () => {
    const pinned = pinGeneralInquiryFirst(liveBuilderOptions);
    expect(pinned.slice(1).map((o) => o.value)).toEqual(
      liveBuilderOptions.filter((o) => o.value !== "general inquiry | other").map((o) => o.value)
    );
  });

  it("returns the same order when general is already first", () => {
    expect(pinGeneralInquiryFirst(contactInquiryTypes)[0]?.value).toBe("general");
    expect(pinGeneralInquiryFirst(contactInquiryTypes)).toEqual(contactInquiryTypes);
  });

  it("returns the list unchanged when no general option exists", () => {
    const withoutGeneral = liveBuilderOptions.filter((o) => o.value !== "general inquiry | other");
    expect(pinGeneralInquiryFirst(withoutGeneral)).toEqual(withoutGeneral);
  });

  it("handles an empty list", () => {
    expect(pinGeneralInquiryFirst([])).toEqual([]);
  });
});
