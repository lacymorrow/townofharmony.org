import type { TownContactInquiryType } from "./types";

/**
 * Inquiry type options shown in the public contact form.
 * Mirrored in Builder.io model `town-contact-inquiry-type` (editable by staff).
 * The form falls back to this list when Builder returns no entries.
 */
export const contactInquiryTypes: TownContactInquiryType[] = [
	{ value: "general", label: "General Inquiry", sortOrder: 1, isActive: true },
	{
		value: "sewer-residential-intown",
		label: "Sewer In-Town Residential Service",
		sortOrder: 2,
		isActive: true,
	},
	{
		value: "sewer-nonresidential-intown",
		label: "Sewer In-Town Nonresidential Service",
		sortOrder: 3,
		isActive: true,
	},
	{
		value: "sewer-residential-outtown",
		label: "Sewer Out-of-Town Residential Service",
		sortOrder: 4,
		isActive: true,
	},
	{
		value: "sewer-nonresidential-outtown",
		label: "Sewer Out-of-Town Nonresidential Service",
		sortOrder: 5,
		isActive: true,
	},
	{ value: "permits", label: "Permits & Zoning", sortOrder: 6, isActive: true },
	{ value: "taxes", label: "Taxes & Billing", sortOrder: 7, isActive: true },
	{ value: "parks", label: "Parks & Recreation", sortOrder: 8, isActive: true },
	{ value: "roads", label: "Roads & Infrastructure", sortOrder: 9, isActive: true },
	{ value: "suggestion", label: "Suggestion", sortOrder: 10, isActive: true },
	{ value: "other", label: "Other", sortOrder: 11, isActive: true },
];
