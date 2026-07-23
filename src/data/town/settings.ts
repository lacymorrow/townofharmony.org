import type { TownSettings } from "./types";

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
		weekday: "Monday - Friday: 9:00 AM - 5:00 PM",
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
	homepage: {
		heroBadgeText: "Est. 1927 · Iredell County",
		heroSecondaryCtaText: "Meeting Agendas",
		heroSecondaryCtaHref: "/meetings",
		quickLinksHeading: "Town Services",
		quickLinksSubheading: "Find what you need quickly",
		latestNewsHeading: "Latest News",
		upcomingEventsHeading: "Upcoming Events",
		spotlightBadge: "Community Spotlight",
		spotlightTitle: "Harmony Hill Camp Meeting",
		spotlightDescription:
			"A two-week revival tradition first held in 1846, the Harmony Hill Camp Meeting still gathers each year on the second weekend of October on the grounds of present-day Harmony Elementary School. The town takes its name from these meetings.",
		spotlightCtaText: "Learn More",
		spotlightCtaHref: "/history",
		spotlightImageLetter: "H",
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
	homepageHeroBadgeText?: string;
	homepageHeroSecondaryCtaText?: string;
	homepageHeroSecondaryCtaHref?: string;
	homepageQuickLinksHeading?: string;
	homepageQuickLinksSubheading?: string;
	homepageLatestNewsHeading?: string;
	homepageUpcomingEventsHeading?: string;
	homepageSpotlightBadge?: string;
	homepageSpotlightTitle?: string;
	homepageSpotlightDescription?: string;
	homepageSpotlightCtaText?: string;
	homepageSpotlightCtaHref?: string;
	homepageSpotlightImageLetter?: string;
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
	homepage: {
		heroBadgeText: flat.homepageHeroBadgeText ?? settings.homepage.heroBadgeText,
		heroSecondaryCtaText:
			flat.homepageHeroSecondaryCtaText ?? settings.homepage.heroSecondaryCtaText,
		heroSecondaryCtaHref:
			flat.homepageHeroSecondaryCtaHref ?? settings.homepage.heroSecondaryCtaHref,
		quickLinksHeading:
			flat.homepageQuickLinksHeading ?? settings.homepage.quickLinksHeading,
		quickLinksSubheading:
			flat.homepageQuickLinksSubheading ?? settings.homepage.quickLinksSubheading,
		latestNewsHeading:
			flat.homepageLatestNewsHeading ?? settings.homepage.latestNewsHeading,
		upcomingEventsHeading:
			flat.homepageUpcomingEventsHeading ?? settings.homepage.upcomingEventsHeading,
		spotlightBadge: flat.homepageSpotlightBadge ?? settings.homepage.spotlightBadge,
		spotlightTitle: flat.homepageSpotlightTitle ?? settings.homepage.spotlightTitle,
		spotlightDescription:
			flat.homepageSpotlightDescription ?? settings.homepage.spotlightDescription,
		spotlightCtaText:
			flat.homepageSpotlightCtaText ?? settings.homepage.spotlightCtaText,
		spotlightCtaHref:
			flat.homepageSpotlightCtaHref ?? settings.homepage.spotlightCtaHref,
		spotlightImageLetter:
			flat.homepageSpotlightImageLetter ?? settings.homepage.spotlightImageLetter,
	},
});
