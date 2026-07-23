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
	allowedFileTypes?: string[];
}

interface BuilderModelDefinition {
	name: string;
	kind: "data";
	/** Field name used to auto-populate the Builder entry name (so editors don't have to fill in a separate "name" field at the top). */
	nameField?: string;
	/** Short description shown in the Builder.io content editor for this model. */
	helperText?: string;
	fields: BuilderField[];
}

interface FieldExtras {
	friendlyName?: string;
	helperText?: string;
}

const text = (name: string, required = false, extras: FieldExtras = {}): BuilderField => ({
	name,
	type: "text",
	required,
	...extras,
});

const longText = (name: string, extras: FieldExtras = {}): BuilderField => ({
	name,
	type: "longText",
	...extras,
});

const richText = (name: string, extras: FieldExtras = {}): BuilderField => ({
	name,
	type: "richText",
	...extras,
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

const date = (name: string, extras: FieldExtras = {}): BuilderField => ({
	name,
	type: "date",
	...extras,
});

const url = (name: string): BuilderField => ({
	name,
	type: "url",
});

const file = (
	name: string,
	allowedFileTypes = ["jpeg", "png", "webp", "svg", "gif"]
): BuilderField => ({
	name,
	type: "file",
	allowedFileTypes,
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
		// Display order is managed by Builder.io's drag-and-drop priority in the
		// CMS list view — no `sortOrder` field. Consumers fetch with
		// `sort: { priority: -1 }` so the rendered list matches CMS order.
		fields: [
			text("name", true),
			text("title", true),
			enumText("category", ["Executive", "Town Council", "Board of Aldermen", "Staff"]),
			emailField("email"),
			file("image"),
			phone("phone"),
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
		// Display order is managed by Builder.io's drag-and-drop priority in the
		// CMS list view — no `sortOrder` field. Consumers fetch with
		// `sort: { priority: -1 }` so the rendered timeline matches CMS order.
		fields: [
			text("title", true),
			text("slug", true),
			enumText("type", ["period", "landmark"]),
			text("era"),
			text("year"),
			text("address"),
			richText("description"),
			richText("content"),
			file("image"),
			tags("highlights"),
		],
	},
	{
		name: "town-point-of-interest",
		kind: "data",
		fields: [
			text("name", true),
			text("slug", true),
			text("category", false, {
				helperText:
					"Grouping label for the filter bar (e.g. Parks, Government, Historic Sites). New categories appear in the filter automatically.",
			}),
			richText("description"),
			file("image"),
			text("address"),
			text("hours"),
			tags("amenities"),
			url("link"),
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
			text("sewerContactAddress", false, {
				helperText: "Mailing address shown on the /sewer contact block.",
			}),
			{
				...phone("sewerContactPhone"),
				helperText:
					"Phone number shown on all sewer pages. Leave blank to fall back to the built-in value.",
			},
			text("sewerContactHours", false, {
				helperText: "Office hours shown on the /sewer contact block.",
			}),
			emailField("sewerContactEmail"),
			text("sewerPageHeading", false, {
				helperText: "H1 shown at the top of /sewer.",
			}),
			longText("sewerPageDescription", {
				helperText: "Intro paragraph under the /sewer heading.",
			}),
			text("sewerPaymentHeading", false, {
				helperText: "H1 shown at the top of /pay/sewer.",
			}),
			longText("sewerSuccessCopy", {
				helperText: "Body copy shown on the /pay/sewer/success confirmation page.",
			}),
			longText("sewerCancelCopy", {
				helperText: "Body copy shown on the /pay/sewer/cancel page.",
			}),
		],
	},
	{
		name: "town-navigation",
		kind: "data",
		fields: [
			list("mainNav", [text("name", true), text("href", true), text("parentName")]),
			list("topBarLinks", [text("name", true), text("href", true), text("icon")]),
			list("quickLinks", [
				text("title", true),
				text("href", true),
				longText("description"),
				text("icon"),
				text("color"),
			]),
			list("footerLinks", [text("category", true), text("name", true), text("href", true)]),
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
			file("featuredImage"),
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
		// Use the event title as the Builder entry name so editors don't need
		// to type a separate "Name" at the top — fixes "doesn't recognize
		// title" save errors.
		nameField: "title",
		fields: [
			text("title", true, {
				friendlyName: "Event title",
				helperText: "Public title shown on the events list and detail pages.",
			}),
			text("slug", false, {
				friendlyName: "URL slug",
				helperText:
					"URL-friendly version of the title (e.g. spring-festival-2026). Leave blank to auto-generate.",
			}),
			richText("description", {
				friendlyName: "Short description",
				helperText: "1–2 sentence summary shown on event listings.",
			}),
			richText("content", {
				friendlyName: "Event details",
				helperText: "Full event description shown on the event page.",
			}),
			file("featuredImage"),
			date("eventDate", {
				friendlyName: "Event date",
				helperText:
					"Date of the event. The time portion is ignored — use the Start time and End time fields below.",
			}),
			text("eventTime", undefined, {
				friendlyName: "Start time",
				helperText: 'Free-form start time (e.g. "4:00 PM" or "All day").',
			}),
			text("endTime", undefined, {
				friendlyName: "End time",
				helperText: 'Free-form end time (e.g. "7:00 PM" or "All day").',
			}),
			text("locationAddress", undefined, {
				friendlyName: "Location / address",
				helperText: "Venue name and/or street address.",
			}),
			text("organizer", undefined, {
				friendlyName: "Organizer",
				helperText: 'Organizer name (e.g. "Town of Harmony").',
			}),
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
			file("logo"),
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
			list("images", [file("image")]),
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
			list("pollingLocations", [text("name"), text("address"), text("hours")]),
			bool("isActive", true),
			list("candidates", [
				text("name"),
				text("position"),
				text("party"),
				longText("bio"),
				num("sortOrder"),
			]),
			url("resultsUrl"),
			file("sampleBallot", ["pdf", "jpeg", "png"]),
		],
	},

	// --- Static Pages ---
	// Editable prose for a small set of hardcoded routes (/about, /accessibility,
	// /privacy). The routes themselves stay hardcoded in Next.js — this model
	// only carries the body copy. Slug matches the URL segment (e.g. "about").
	{
		name: "town-static-page",
		kind: "data",
		nameField: "title",
		helperText:
			"Editable prose for hardcoded pages like /about, /accessibility, /privacy. The `slug` must match the URL segment (e.g. `about`). Leave blank to fall back to the built-in copy.",
		fields: [
			text("slug", true, {
				helperText:
					"URL segment for the page — e.g. `about` for /about, `accessibility` for /accessibility, `privacy` for /privacy.",
			}),
			text("title", true, {
				helperText: "Page heading rendered as <h1>.",
			}),
			richText("body", {
				helperText:
					"Full page body. Rendered as sanitized HTML inside a standard prose container.",
			}),
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
			file("image"),
			{
				...file("video", ["mp4", "webm", "mov", "m4v"]),
				helperText:
					"Optional background video (muted, autoplay, playsInline). Image field is used as the poster and as the fallback when video is missing or the browser can't play it, or when the visitor prefers reduced motion.",
			},
			text("ctaText"),
			text("ctaHref"),
		],
	},

	// --- Contact Form Inquiry Types ---
	// Display order is managed by Builder.io's drag-and-drop priority in the
	// CMS list view — no `sortOrder` field needed. The form fetches with
	// `sort: { priority: -1 }` so the rendered <select> matches CMS order.
	{
		name: "town-contact-inquiry-type",
		kind: "data",
		fields: [text("value", true), text("label", true), bool("isActive", true)],
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
