import type { TownSettings } from "./types";

const officeHoursWeekday = "Monday - Friday: 9:00 AM - 5:00 PM";

export const settings: TownSettings = {
	siteTitle: "Town of Harmony",
	siteDescription: "Official website of the Town of Harmony, North Carolina",
	contactInfo: {
		phone: "(704) 546-2339",
		address: "3389 Harmony Hwy, Harmony, NC 28634",
		email: "info@townofharmony.org",
		streetAddress: "3389 Harmony Hwy",
		city: "Harmony",
		stateCode: "NC",
		zipCode: "28634",
	},
	officeHours: {
		weekday: officeHoursWeekday,
		weekend: "Saturday - Sunday: Closed",
	},
	socialMedia: {
		facebook: "",
		twitter: "",
		youtube: "",
	},
	branding: {
		tagline: "",
		established: "Incorporated in 1927",
		county: "Iredell County",
		state: "North Carolina",
	},
	sewer: {
		contactAddress: "Town of Harmony, PO Box 428, Harmony, NC 28634",
		contactPhone: "(704) 546-2339",
		contactHours: officeHoursWeekday,
		contactEmail: "admin@townofharmony.org",
		pageHeading: "Sewer Services",
		pageDescription:
			"The Town of Harmony provides sewer services to residential and nonresidential properties.",
		paymentHeading: "Pay Sewer Bill",
		successCopy: "Thank you for your sewer bill payment.",
		cancelCopy:
			"No charge was made to your card. You can try again or pay in person at Town Hall.",
	},
};

/** Flat shape returned by Builder.io for the town-settings data model. */
export interface BuilderSettingsFlat {
	siteTitle?: string;
	siteDescription?: string;
	contactPhone?: string;
	contactAddress?: string;
	contactEmail?: string;
	officeHoursWeekday?: string;
	officeHoursWeekend?: string;
	socialFacebook?: string;
	socialTwitter?: string;
	socialYoutube?: string;
	brandingTagline?: string;
	brandingEstablished?: string;
	brandingCounty?: string;
	brandingState?: string;
	sewerContactAddress?: string;
	sewerContactPhone?: string;
	sewerContactHours?: string;
	sewerContactEmail?: string;
	sewerPageHeading?: string;
	sewerPageDescription?: string;
	sewerPaymentHeading?: string;
	sewerSuccessCopy?: string;
	sewerCancelCopy?: string;
}

/** Transform flat Builder.io settings into nested TownSettings shape. */
export const toTownSettings = (flat: BuilderSettingsFlat): TownSettings => ({
	siteTitle: flat.siteTitle ?? settings.siteTitle,
	siteDescription: flat.siteDescription ?? settings.siteDescription,
	contactInfo: {
		phone: flat.contactPhone ?? settings.contactInfo.phone,
		address: flat.contactAddress ?? settings.contactInfo.address,
		email: flat.contactEmail ?? settings.contactInfo.email,
		streetAddress: settings.contactInfo.streetAddress,
		city: settings.contactInfo.city,
		stateCode: settings.contactInfo.stateCode,
		zipCode: settings.contactInfo.zipCode,
	},
	officeHours: {
		weekday: flat.officeHoursWeekday ?? settings.officeHours.weekday,
		weekend: flat.officeHoursWeekend ?? settings.officeHours.weekend,
	},
	socialMedia: {
		facebook: flat.socialFacebook ?? settings.socialMedia.facebook,
		twitter: flat.socialTwitter ?? settings.socialMedia.twitter,
		youtube: flat.socialYoutube ?? settings.socialMedia.youtube,
	},
	branding: {
		tagline: flat.brandingTagline ?? settings.branding.tagline,
		established: flat.brandingEstablished ?? settings.branding.established,
		county: flat.brandingCounty ?? settings.branding.county,
		state: flat.brandingState ?? settings.branding.state,
	},
	sewer: {
		contactAddress: flat.sewerContactAddress ?? settings.sewer.contactAddress,
		contactPhone: flat.sewerContactPhone ?? settings.sewer.contactPhone,
		contactHours: flat.sewerContactHours ?? settings.sewer.contactHours,
		contactEmail: flat.sewerContactEmail ?? settings.sewer.contactEmail,
		pageHeading: flat.sewerPageHeading ?? settings.sewer.pageHeading,
		pageDescription: flat.sewerPageDescription ?? settings.sewer.pageDescription,
		paymentHeading: flat.sewerPaymentHeading ?? settings.sewer.paymentHeading,
		successCopy: flat.sewerSuccessCopy ?? settings.sewer.successCopy,
		cancelCopy: flat.sewerCancelCopy ?? settings.sewer.cancelCopy,
	},
});
