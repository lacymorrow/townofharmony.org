/**
 * Builder.io data model definitions for the Town of Harmony.
 * Maps TypeScript interfaces to Builder.io model schemas.
 * Used by scripts/seed-builder-data.ts to create models via Admin SDK.
 */

interface BuilderField {
	name: string;
	type: string;
	required?: boolean;
	defaultValue?: unknown;
	enum?: string[];
	subFields?: BuilderField[];
	model?: string;
	regex?: { pattern: string; message: string };
	helperText?: string;
	friendlyName?: string;
	advanced?: boolean;
}

interface BuilderModelDefinition {
	name: string;
	kind: "data";
	fields: BuilderField[];
}

const text = (name: string, required = false): BuilderField => ({
	name,
	type: "text",
	required,
});

const longText = (name: string): BuilderField => ({
	name,
	type: "longText",
});

const richText = (name: string): BuilderField => ({
	name,
	type: "richText",
});

const num = (name: string): BuilderField => ({
	name,
	type: "number",
});

const bool = (name: string, defaultValue = false): BuilderField => ({
	name,
	type: "boolean",
	defaultValue,
});

const date = (name: string): BuilderField => ({
	name,
	type: "date",
});

const url = (name: string): BuilderField => ({
	name,
	type: "url",
});

const tags = (name: string): BuilderField => ({
	name,
	type: "Tags",
});

const emailField = (name: string): BuilderField => ({
	name,
	type: "email",
});

const phone = (name: string): BuilderField => ({
	name,
	type: "text",
	regex: {
		pattern: "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$",
		message: "Enter a valid phone number (e.g. 555-555-5555)",
	},
});

const enumText = (name: string, values: string[]): BuilderField => ({
	name,
	type: "text",
	enum: values,
});

const reference = (name: string, model: string): BuilderField => ({
	name,
	type: "reference",
	model,
});

const list = (name: string, subFields: BuilderField[]): BuilderField => ({
	name,
	type: "list",
	subFields,
});

export const modelDefinitions: BuilderModelDefinition[] = [
	// --- Simple Models (Phase 2) ---
	{
		name: "town-team-member",
		kind: "data",
		fields: [
			text("name", true),
			text("title", true),
			enumText("category", ["Executive", "Town Council", "Staff"]),
			emailField("email"),
			url("image"),
			text("mayorSince"),
			text("termExpires"),
			text("department"),
			bool("isActive", true),
		],
	},
	{
		name: "town-emergency-service",
		kind: "data",
		fields: [
			text("title", true),
			longText("description"),
			{ ...phone("phone"), required: true },
			enumText("category", ["immediate", "public-safety", "utility", "health"]),
			text("icon"),
			tags("preparedness"),
		],
	},
	{
		name: "town-history-article",
		kind: "data",
		fields: [
			text("title", true),
			text("slug", true),
			enumText("type", ["period", "landmark"]),
			text("era"),
			text("year"),
			text("address"),
			richText("description"),
			richText("content"),
			url("image"),
			tags("highlights"),
		],
	},
	{
		name: "town-point-of-interest",
		kind: "data",
		fields: [
			text("name", true),
			text("slug", true),
			text("category"),
			richText("description"),
			url("image"),
			text("address"),
			text("hours"),
			tags("amenities"),
		],
	},
	{
		name: "town-resource",
		kind: "data",
		fields: [
			text("title", true),
			text("slug", true),
			enumText("type", ["document", "service", "link"]),
			text("category"),
			text("icon"),
			richText("description"),
			text("contactPhone"),
			text("contactEmail"),
			url("externalUrl"),
		],
	},
	{
		name: "town-announcement",
		kind: "data",
		fields: [
			text("title", true),
			richText("content"),
			richText("message"),
			enumText("level", ["info", "warning", "critical"]),
			bool("isActive", true),
			date("startsAt"),
			date("endsAt"),
			date("createdAt"),
			date("updatedAt"),
			url("externalUrl"),
			tags("affectedAreas"),
			text("contactInfo"),
			tags("instructions"),
		],
	},
	{
		name: "town-settings",
		kind: "data",
		fields: [
			text("siteTitle", true),
			longText("siteDescription"),
			phone("contactPhone"),
			text("contactAddress"),
			emailField("contactEmail"),
			text("officeHoursWeekday"),
			text("officeHoursWeekend"),
			url("socialFacebook"),
			url("socialTwitter"),
			url("socialYoutube"),
			text("brandingTagline"),
			text("brandingEstablished"),
			text("brandingCounty"),
			text("brandingState"),
		],
	},
	{
		name: "town-navigation",
		kind: "data",
		fields: [
			list("mainNav", [
				text("name", true),
				text("href", true),
				text("parentName"),
			]),
			list("topBarLinks", [
				text("name", true),
				text("href", true),
				text("icon"),
			]),
			list("quickLinks", [
				text("title", true),
				text("href", true),
				longText("description"),
				text("icon"),
				text("color"),
			]),
			list("footerLinks", [
				text("category", true),
				text("name", true),
				text("href", true),
			]),
		],
	},

	// --- Collection Models (Phase 3) ---
	{
		name: "town-news",
		kind: "data",
		fields: [
			text("title", true),
			text("slug", true),
			richText("excerpt"),
			richText("content"),
			url("featuredImage"),
			enumText("status", ["published", "draft"]),
			date("publishedAt"),
			tags("categories"),
			tags("tags"),
			num("viewCount"),
			reference("author", "town-team-member"),
		],
	},
	{
		name: "town-event",
		kind: "data",
		fields: [
			text("title", true),
			text("slug", true),
			richText("description"),
			richText("content"),
			url("featuredImage"),
			date("eventDate"),
			text("eventTime"),
			text("endTime"),
			text("location"),
			text("locationAddress"),
			reference("organizer", "town-team-member"),
			emailField("contactEmail"),
			phone("contactPhone"),
			enumText("status", ["upcoming", "past", "cancelled"]),
			bool("isRecurring"),
			tags("categories"),
			tags("tags"),
		],
	},
	{
		name: "town-meeting",
		kind: "data",
		fields: [
			text("title", true),
			text("slug", true),
			enumText("type", ["Council", "Planning", "Public Hearing"]),
			date("meetingDate"),
			text("meetingTime"),
			text("location"),
			richText("agenda"),
			tags("attendees"),
			bool("isPublic", true),
			richText("minutes"),
			url("minutesUrl"),
			url("videoUrl"),
			url("audioUrl"),
		],
	},
	{
		name: "town-business",
		kind: "data",
		fields: [
			text("name", true),
			text("slug", true),
			richText("description"),
			url("logo"),
			text("category"),
			text("contactName"),
			emailField("email"),
			phone("phone"),
			url("website"),
			text("address"),
			text("city"),
			text("stateCode"),
			text("zipCode"),
			richText("hours"),
			list("images", [
				url("image"),
			]),
			bool("isVerified"),
			bool("isFeatured"),
		],
	},
	{
		name: "town-election",
		kind: "data",
		fields: [
			text("title", true),
			text("slug", true),
			richText("description"),
			date("electionDate"),
			date("registrationDeadline"),
			date("earlyVotingStart"),
			date("earlyVotingEnd"),
			list("pollingLocations", [
				text("name"),
				text("address"),
				text("hours"),
			]),
			bool("isActive", true),
			list("candidates", [
				text("name"),
				text("position"),
				text("party"),
				longText("bio"),
				num("sortOrder"),
			]),
			url("resultsUrl"),
			url("sampleBallot"),
		],
	},

	// --- Homepage ---
	{
		name: "town-homepage-slide",
		kind: "data",
		fields: [
			text("title", true),
			text("subtitle"),
			longText("description"),
			url("image"),
			text("ctaText"),
			text("ctaHref"),
		],
	},

	// --- Sewer Rates ---
	{
		name: "town-sewer-rate",
		kind: "data",
		fields: [
			text("tierId", true),
			text("name", true),
			longText("description"),
			enumText("location", ["in-town", "out-of-town"]),
			enumText("type", ["residential", "nonresidential"]),
			num("monthlyRate"),
		],
	},

	// --- Map Businesses (dynamic sync from Google Places + manual overrides) ---
	{
		name: "town-map-business",
		kind: "data",
		fields: [
			text("name", true),
			text("address", true),
			text("phone"),
			enumText("category", [
				"Restaurant & Food",
				"Retail & Shopping",
				"Auto & Transportation",
				"Health & Wellness",
				"Community & Government",
				"Churches & Religious",
				"Gas & Fuel",
				"Banking & Finance",
				"Services & Contractors",
				"Other",
			]),
			num("lat"),
			num("lng"),
			longText("description"),
			text("googlePlaceId"),
			bool("isOverride", false),
			text("businessStatus"),
		],
	},
];

export type { BuilderField, BuilderModelDefinition };
