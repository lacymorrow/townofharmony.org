import type { TownContactInquiryType } from "./types";

/**
 * Matches the "General Inquiry" option loosely because its Builder entry is
 * staff-editable and the value has drifted before (e.g. "general" became
 * "general inquiry | other"), which silently broke value-equality checks
 * (LAC-3550).
 */
export function isGeneralInquiry(option: { value: string; label: string }): boolean {
  return /general/i.test(option.value) || /general/i.test(option.label);
}

/**
 * Inquiry type options shown in the public contact form.
 * Mirrored in Builder.io model `town-contact-inquiry-type` (editable by staff).
 * The form falls back to this list when Builder returns no entries.
 *
 * Order: managed by Builder.io's drag-and-drop priority in the CMS. This
 * fallback array's declaration order is used only when Builder is unreachable.
 */
export const contactInquiryTypes: TownContactInquiryType[] = [
  { value: "general", label: "General Inquiry", isActive: true },
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
  { value: "permits", label: "Permits & Zoning", isActive: true },
  { value: "taxes", label: "Taxes & Billing", isActive: true },
  { value: "parks", label: "Parks & Recreation", isActive: true },
  { value: "roads", label: "Roads & Infrastructure", isActive: true },
  { value: "suggestion", label: "Suggestion", isActive: true },
  { value: "other", label: "Other", isActive: true },
];
