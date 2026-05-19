"use client";
import { Builder } from "@builder.io/react";
import { TownAnnouncementBar } from "./components/modules/builder/town/town-announcement-bar";
import { TownHeroBanner } from "./components/modules/builder/town/town-hero-banner";
import { TownPageCta } from "./components/modules/builder/town/town-page-cta";
import { TownAgendaMinutes } from "./components/modules/builder/town/town-agenda-minutes";
import { TownInteractiveMap } from "./components/modules/builder/town/town-interactive-map";
import { TownBusinessDetail } from "./components/modules/builder/town/town-business-detail";
import { TownBusinessDirectory } from "./components/modules/builder/town/town-business-directory";
import { TownCommunitySpotlight } from "./components/modules/builder/town/town-community-spotlight";
import { TownContactForm } from "./components/modules/builder/town/town-contact-form";
import { TownElectionDetail } from "./components/modules/builder/town/town-election-detail";
import { TownElectionsList } from "./components/modules/builder/town/town-elections-list";

import { TownEmergencyServices } from "./components/modules/builder/town/town-emergency-services";
import { TownEventDetail } from "./components/modules/builder/town/town-event-detail";
import { TownEventsList } from "./components/modules/builder/town/town-events-list";
import { TownHero } from "./components/modules/builder/town/town-hero";
import { TownHistoryTimeline } from "./components/modules/builder/town/town-history-timeline";
import { TownLatestNews } from "./components/modules/builder/town/town-latest-news";
import { TownMeetingDetail } from "./components/modules/builder/town/town-meeting-detail";
import { TownMeetingsList } from "./components/modules/builder/town/town-meetings-list";
import { TownNewsDetail } from "./components/modules/builder/town/town-news-detail";
import { TownNewsGrid } from "./components/modules/builder/town/town-news-grid";
import { TownPageHeader } from "./components/modules/builder/town/town-page-header";
import { TownPointsOfInterest } from "./components/modules/builder/town/town-points-of-interest";
import { TownQuickLinks } from "./components/modules/builder/town/town-quick-links";
import { TownResourcesList } from "./components/modules/builder/town/town-resources-list";
import { TownTeamMembers } from "./components/modules/builder/town/town-team-members";
import { TownUpcomingEvents } from "./components/modules/builder/town/town-upcoming-events";

// --- Homepage Components ---

Builder.registerComponent(TownHero, {
	name: "TownHero",
	inputs: [
		{ name: "title", type: "string", defaultValue: "Welcome to Harmony" },
		{ name: "subtitle", type: "string", defaultValue: "A community rooted in tradition" },
		{ name: "image", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
		{ name: "ctaText", type: "string", defaultValue: "Explore Our Town", friendlyName: "CTA Button Text" },
		{ name: "ctaHref", type: "string", defaultValue: "/about", friendlyName: "CTA Button URL" },
	],
});

Builder.registerComponent(TownQuickLinks, {
	name: "TownQuickLinks",
	inputs: [
		{
			name: "links",
			type: "list",
			subFields: [
				{ name: "icon", type: "string", helperText: "Lucide icon name" },
				{ name: "title", type: "string" },
				{ name: "description", type: "string" },
				{ name: "href", type: "string" },
			],
		},
	],
});

Builder.registerComponent(TownLatestNews, {
	name: "TownLatestNews",
	inputs: [
		{ name: "limit", type: "number", defaultValue: 3, helperText: "Number of news articles to show" },
	],
});

Builder.registerComponent(TownUpcomingEvents, {
	name: "TownUpcomingEvents",
	inputs: [
		{ name: "limit", type: "number", defaultValue: 5, helperText: "Number of events to show" },
	],
});

Builder.registerComponent(TownCommunitySpotlight, {
	name: "TownCommunitySpotlight",
	inputs: [
		{ name: "badge", type: "string", defaultValue: "Community Spotlight" },
		{ name: "title", type: "string", defaultValue: "Harmony Heritage Trail" },
		{ name: "description", type: "longText" },
		{ name: "linkHref", type: "string", defaultValue: "/history", friendlyName: "Link URL" },
		{ name: "image", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
	],
});

// --- Collection / Listing Components ---

Builder.registerComponent(TownNewsGrid, {
	name: "TownNewsGrid",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 9, friendlyName: "Items Per Page" },
		{ name: "showFilters", type: "boolean", defaultValue: true, friendlyName: "Show Filter Bar" },
		{ name: "showSearch", type: "boolean", defaultValue: true, friendlyName: "Show Search" },
		{
			name: "searchPlaceholder",
			type: "string",
			defaultValue: "Search news...",
			friendlyName: "Search Placeholder",
			showIf: (options) => options.get("showSearch") === true,
		},
	],
});

Builder.registerComponent(TownEventsList, {
	name: "TownEventsList",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 10, friendlyName: "Items Per Page" },
		{ name: "showFilters", type: "boolean", defaultValue: true, friendlyName: "Show Filter Bar" },
	],
});

Builder.registerComponent(TownMeetingsList, {
	name: "TownMeetingsList",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 10, friendlyName: "Items Per Page" },
		{ name: "showCalendar", type: "boolean", defaultValue: false, friendlyName: "Show Calendar View" },
	],
});

Builder.registerComponent(TownBusinessDirectory, {
	name: "TownBusinessDirectory",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 12, friendlyName: "Items Per Page" },
		{ name: "showSearch", type: "boolean", defaultValue: true, friendlyName: "Show Search" },
	],
});

Builder.registerComponent(TownElectionsList, {
	name: "TownElectionsList",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 6, friendlyName: "Items Per Page" },
	],
});

Builder.registerComponent(TownTeamMembers, {
	name: "TownTeamMembers",
	inputs: [
		{
			name: "categoryFilter",
			type: "string",
			friendlyName: "Filter by Category",
			helperText: "Show only one category (Executive / Town Council / Staff). Empty = all.",
		},
		{
			name: "showDepartment",
			type: "boolean",
			defaultValue: false,
			friendlyName: "Show Department Label",
			showIf: (options) => options.get("categoryFilter") === "Staff",
		},
		{
			name: "limit",
			type: "number",
			friendlyName: "Maximum Members",
			helperText: "Max members to show. Empty = all active members.",
			advanced: true,
		},
	],
});

Builder.registerComponent(TownPointsOfInterest, {
	name: "TownPointsOfInterest",
	inputs: [
		{ name: "showCategoryFilter", type: "boolean", defaultValue: true, friendlyName: "Show Category Filter" },
	],
});

Builder.registerComponent(TownHistoryTimeline, {
	name: "TownHistoryTimeline",
	inputs: [
		{
			name: "type",
			type: "string",
			defaultValue: "all",
			enum: [
				{ label: "All", value: "all" },
				{ label: "Historical Periods", value: "period" },
				{ label: "Landmarks", value: "landmark" },
			],
		},
	],
});

Builder.registerComponent(TownResourcesList, {
	name: "TownResourcesList",
	inputs: [
		{
			name: "type",
			type: "string",
			enum: [
				{ label: "All Types", value: "" },
				{ label: "Documents", value: "document" },
				{ label: "Services", value: "service" },
				{ label: "Links", value: "link" },
			],
		},
	],
});

// --- Detail Components ---

Builder.registerComponent(TownNewsDetail, {
	name: "TownNewsDetail",
	models: ["page"],
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownEventDetail, {
	name: "TownEventDetail",
	models: ["page"],
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownMeetingDetail, {
	name: "TownMeetingDetail",
	models: ["page"],
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownBusinessDetail, {
	name: "TownBusinessDetail",
	models: ["page"],
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownElectionDetail, {
	name: "TownElectionDetail",
	models: ["page"],
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

// --- Utility / Section Components ---

Builder.registerComponent(TownPageHeader, {
	name: "TownPageHeader",
	inputs: [
		{ name: "title", type: "string", required: true, defaultValue: "Page Title" },
		{ name: "subtitle", type: "string" },
		{
			name: "variant",
			type: "string",
			defaultValue: "sage",
			friendlyName: "Color Theme",
			advanced: true,
			enum: [
				{ label: "Sage (Green)", value: "sage" },
				{ label: "Wheat (Gold)", value: "wheat" },
				{ label: "Barn Red", value: "barn-red" },
			],
		},
	],
});

// Content fully driven by the town-emergency-service data model — edit
// individual services there, not on this block.
Builder.registerComponent(TownEmergencyServices, {
	name: "TownEmergencyServices",
	inputs: [],
});

// TownEmergencyAlertsList removed — EmergencyBanner in the layout already
// shows active alerts on every page, making the Builder.io block redundant.

// Form labels, validation, and submit handler are owned by the component
// for security/consistency — no instance config exposed.
Builder.registerComponent(TownContactForm, {
	name: "TownContactForm",
	inputs: [],
});

Builder.registerComponent(TownAgendaMinutes, {
	name: "TownAgendaMinutes",
	models: ["page"],
	inputs: [
		{
			name: "defaultTab",
			type: "string",
			defaultValue: "agenda",
			enum: [
				{ label: "Agenda", value: "agenda" },
				{ label: "Minutes", value: "minutes" },
			],
		},
	],
});

Builder.registerComponent(TownInteractiveMap, {
	name: "TownInteractiveMap",
	models: ["page"],
	inputs: [
		{
			name: "height",
			type: "string",
			defaultValue: "calc(100vh - 200px)",
			friendlyName: "Map Height",
			helperText: "CSS height (e.g. '500px', '70vh').",
			advanced: true,
		},
		{
			name: "minHeight",
			type: "string",
			defaultValue: "500px",
			friendlyName: "Map Minimum Height",
			advanced: true,
		},
	],
});

// --- Section Components (scoped to Builder.io Section models) ---

Builder.registerComponent(TownAnnouncementBar, {
	name: "TownAnnouncementBar",
	models: ["announcement-bar"],
	inputs: [
		{
			name: "message",
			type: "string",
			required: true,
			helperText: "The announcement text shown in the banner",
		},
		{
			name: "level",
			type: "string",
			defaultValue: "info",
			enum: [
				{ label: "Info (green)", value: "info" },
				{ label: "Warning (yellow)", value: "warning" },
				{ label: "Critical (red)", value: "critical" },
			],
		},
		{ name: "ctaText", type: "string", helperText: "Call-to-action link label (optional)" },
		{ name: "ctaHref", type: "url", helperText: "Call-to-action link URL (optional)" },
		{ name: "isActive", type: "boolean", defaultValue: true },
		{ name: "startsAt", type: "date", helperText: "Show banner from this date (optional)" },
		{ name: "endsAt", type: "date", helperText: "Hide banner after this date (optional)" },
	],
});

Builder.registerComponent(TownHeroBanner, {
	name: "TownHeroBanner",
	models: ["homepage-hero"],
	inputs: [
		{ name: "title", type: "string", defaultValue: "Welcome to the Town of Harmony" },
		{ name: "subtitle", type: "string", defaultValue: "Where Harmony LIVES and SINGS!" },
		{ name: "image", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
		{ name: "ctaText", type: "string", defaultValue: "Discover Harmony" },
		{ name: "ctaHref", type: "url", defaultValue: "/history" },
	],
});

Builder.registerComponent(TownPageCta, {
	name: "TownPageCta",
	models: ["page-cta"],
	inputs: [
		{ name: "heading", type: "string", defaultValue: "Get Involved", required: true },
		{ name: "body", type: "longText", helperText: "Supporting text below the heading (optional)" },
		{ name: "ctaText", type: "string", defaultValue: "Learn More" },
		{ name: "ctaHref", type: "url", defaultValue: "/about" },
		{
			name: "variant",
			type: "string",
			defaultValue: "primary",
			enum: [
				{ label: "Primary (sage dark bg)", value: "primary" },
				{ label: "Secondary (light bg)", value: "secondary" },
			],
		},
	],
});
