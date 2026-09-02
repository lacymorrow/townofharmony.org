/**
 * Static type definitions for Town of Harmony content.
 * These replace Payload CMS generated types.
 */

export interface BuilderReference {
	id?: string;
	value?: {
		id?: string;
		name?: string;
		data?: Record<string, unknown>;
	};
}

export const resolveBuilderRef = (
	field: string | BuilderReference | null | undefined
): string | null => {
	if (!field) return null;
	if (typeof field === "string") return field;
	return (field.value?.data?.name as string) ?? null;
};

export interface TownNews {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	featuredImage: string | null;
	status: "published" | "draft";
	publishedAt: string;
	categories: string[];
	tags: string[];
	viewCount?: number;
	author?: string | BuilderReference | null;
}

export interface TownEvent {
	id: number | string;
	title: string;
	slug: string;
	description: string;
	content: string;
	featuredImage: string | null;
	eventDate: string;
	eventTime: string;
	endTime: string;
	locationAddress: string | null;
	organizer: string | BuilderReference | null;
	contactEmail: string;
	contactPhone: string;
	status: "upcoming" | "past" | "cancelled";
	isRecurring: boolean;
	categories: string[];
	tags: string[];
}

export interface TownMeeting {
	id: number;
	title: string;
	slug: string;
	type: "Council" | "Planning" | "Public Hearing";
	meetingDate: string;
	meetingTime: string;
	location: string;
	agenda: string;
	attendees: string[];
	isPublic: boolean;
	minutes?: string;
	minutesUrl?: string;
	videoUrl?: string;
	audioUrl?: string;
}

export interface TownTeamMember {
	id: number;
	name: string;
	title: string;
	category: "Executive" | "Town Council" | "Board of Aldermen" | "Staff";
	email: string;
	image?: string;
	phone?: string;
	termExpires?: string;
	mayorSince?: string;
	department?: string;
	isActive: boolean;
}

export interface TownHistoryArticle {
	id: number;
	title: string;
	slug: string;
	type: "period" | "landmark";
	era?: string;
	year?: string;
	address?: string;
	description: string;
	content: string;
	image: string | null;
	highlights?: string[];
}

export interface TownPointOfInterest {
	id: number;
	name: string;
	slug: string;
	/** Optional in the Builder.io model — entries may have no category. */
	category?: string;
	description: string;
	image: string | null;
	address: string;
	hours: string;
	amenities: string[];
	link?: string;
	phone?: string;
}

export interface TownResource {
	id: number;
	title: string;
	slug: string;
	type: "document" | "service" | "link";
	category: string;
	icon: string;
	description: string;
	contactPhone?: string;
	contactEmail?: string;
	externalUrl?: string;
}

export interface TownEmergencyService {
	id: number;
	title: string;
	description: string;
	phone: string;
	category: "immediate" | "public-safety" | "utility" | "health";
	icon: string;
	preparedness: string[];
	address?: string;
}

export interface TownBusiness {
	id: number;
	name: string;
	slug: string;
	description: string;
	logo: string | null;
	category: string;
	contactName: string;
	email?: string;
	phone: string;
	website?: string;
	address: string;
	city: string;
	stateCode: string;
	zipCode: string;
	hours: string;
	images?: { id?: string; image: string | null }[];
	isVerified: boolean;
	isFeatured: boolean;
}

export interface TownElectionCandidate {
	id?: string;
	name: string;
	position: string;
	party: string;
	bio: string;
	sortOrder: number;
}

export interface TownElectionPollingLocation {
	name: string;
	address: string;
	hours: string;
}

export interface TownElection {
	id: number;
	title: string;
	slug: string;
	description: string;
	electionDate: string;
	registrationDeadline: string;
	earlyVotingStart: string;
	earlyVotingEnd: string;
	pollingLocations: TownElectionPollingLocation[];
	isActive: boolean;
	candidates: TownElectionCandidate[];
	resultsUrl?: string;
	sampleBallot?: string | null;
}

export interface TownContactInquiryType {
	value: string;
	label: string;
	isActive: boolean;
}

export interface TownAnnouncement {
	id: number;
	title: string;
	content: string;
	message?: string;
	level: "info" | "warning" | "critical";
	isActive: boolean;
	startsAt?: string;
	endsAt?: string;
	createdAt: string;
	updatedAt?: string;
	link?: string;
	externalUrl?: string;
	affectedAreas?: string[];
	contactInfo?: string;
	instructions?: string[];
}

export interface TownSettings {
	siteTitle: string;
	siteDescription: string;
	contactInfo: {
		phone: string;
		address: string;
		mailingAddress: string;
		email: string;
		streetAddress: string;
		city: string;
		stateCode: string;
		zipCode: string;
	};
	officeHours: {
		weekday: string;
		weekend: string;
	};
	socialMedia: {
		facebook: string;
		twitter: string;
		youtube: string;
	};
	branding: {
		tagline: string;
		established: string;
		county: string;
		state: string;
	};
	sewer: {
		contactAddress: string;
		contactPhone: string;
		contactHours: string;
		contactEmail: string;
		pageHeading: string;
		pageDescription: string;
		paymentHeading: string;
		successCopy: string;
		cancelCopy: string;
	};
	homepage: {
		heroBadgeText: string;
		heroSecondaryCtaText: string;
		heroSecondaryCtaHref: string;
		quickLinksHeading: string;
		quickLinksSubheading: string;
		latestNewsHeading: string;
		upcomingEventsHeading: string;
		spotlightBadge: string;
		spotlightTitle: string;
		spotlightDescription: string;
		spotlightCtaText: string;
		spotlightCtaHref: string;
		spotlightImageLetter: string;
	};
	footer: {
		/** Template. `{year}` and `{siteTitle}` are substituted at render time. */
		copyright: string;
		legalLinks: { name: string; href: string }[];
	};
	notFound: {
		eyebrow: string;
		heading: string;
		body: string;
		ctaLabel: string;
	};
	map: {
		pageTitle: string;
		legendTitle: string;
		boundaryLabel: string;
	};
	team: {
		introText: string;
	};
}

export interface TownNavItem {
	name: string;
	href: string;
	children?: { name: string; href: string }[];
	icon?: string;
}

export interface TownQuickLink {
	title: string;
	description: string;
	href: string;
	icon: string;
	color: string;
}

export interface TownFooterLinkCategory {
	category: string;
	links: { name: string; href: string }[];
}

export interface TownNavigation {
	mainNav: TownNavItem[];
	topBarLinks: { name: string; href: string; icon: string }[];
	quickLinks: TownQuickLink[];
	footerLinks: TownFooterLinkCategory[];
}

export interface TownHeroSlide {
	title: string;
	subtitle: string;
	description: string;
	image: string | null;
	ctaText: string;
	ctaHref: string;
}

export interface TownSpotlightCard {
	title: string;
	subtitle: string;
	description: string;
	gradient: string;
	ctaText: string;
	ctaHref: string;
}

export interface TownStat {
	value: string;
	label: string;
}

export interface TownHomepage {
	heroSlides: TownHeroSlide[];
	spotlightCards: TownSpotlightCard[];
	stats: TownStat[];
}
