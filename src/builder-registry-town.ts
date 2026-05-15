"use client";
import { Builder } from "@builder.io/react";
import { TownAgendaMinutes } from "./components/modules/builder/town/town-agenda-minutes";
import { TownInteractiveMap } from "./components/modules/builder/town/town-interactive-map";
import { TownBusinessDetail } from "./components/modules/builder/town/town-business-detail";
import { TownBusinessDirectory } from "./components/modules/builder/town/town-business-directory";
import { TownCommunitySpotlight } from "./components/modules/builder/town/town-community-spotlight";
import { TownContactForm } from "./components/modules/builder/town/town-contact-form";
import { TownElectionDetail } from "./components/modules/builder/town/town-election-detail";
import { TownElectionsList } from "./components/modules/builder/town/town-elections-list";
import { TownEmergencyAlertsList } from "./components/modules/builder/town/town-emergency-alerts-list";
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
		{ name: "ctaText", type: "string", defaultValue: "Explore Our Town" },
		{ name: "ctaHref", type: "string", defaultValue: "/about" },
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
		{ name: "linkHref", type: "string", defaultValue: "/history" },
		{ name: "image", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
	],
});

// --- Collection / Listing Components ---

Builder.registerComponent(TownNewsGrid, {
	name: "TownNewsGrid",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 9 },
		{ name: "showFilters", type: "boolean", defaultValue: true },
		{ name: "showSearch", type: "boolean", defaultValue: true },
	],
});

Builder.registerComponent(TownEventsList, {
	name: "TownEventsList",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 10 },
		{ name: "showFilters", type: "boolean", defaultValue: true },
	],
});

Builder.registerComponent(TownMeetingsList, {
	name: "TownMeetingsList",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 10 },
		{ name: "showCalendar", type: "boolean", defaultValue: false },
	],
});

Builder.registerComponent(TownBusinessDirectory, {
	name: "TownBusinessDirectory",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 12 },
		{ name: "showSearch", type: "boolean", defaultValue: true },
	],
});

Builder.registerComponent(TownElectionsList, {
	name: "TownElectionsList",
	inputs: [
		{ name: "itemsPerPage", type: "number", defaultValue: 6 },
	],
});

Builder.registerComponent(TownTeamMembers, {
	name: "TownTeamMembers",
	inputs: [
		{
			name: "categoryFilter",
			type: "string",
			helperText: "Show only one category (Executive / Board of Aldermen / Staff). Empty = all.",
		},
		{
			name: "limit",
			type: "number",
			helperText: "Max members to show. Empty = all active members.",
		},
	],
});

Builder.registerComponent(TownPointsOfInterest, {
	name: "TownPointsOfInterest",
	inputs: [
		{ name: "showCategoryFilter", type: "boolean", defaultValue: true },
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
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownEventDetail, {
	name: "TownEventDetail",
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownMeetingDetail, {
	name: "TownMeetingDetail",
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownBusinessDetail, {
	name: "TownBusinessDetail",
	inputs: [
		{ name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
	],
});

Builder.registerComponent(TownElectionDetail, {
	name: "TownElectionDetail",
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

Builder.registerComponent(TownEmergencyAlertsList, {
	name: "TownEmergencyAlertsList",
	inputs: [
		{ name: "showAll", type: "boolean", defaultValue: false, helperText: "Show all alerts, not just active ones" },
		{ name: "limit", type: "number", defaultValue: 10 },
	],
});

// Form labels, validation, and submit handler are owned by the component
// for security/consistency — no instance config exposed.
Builder.registerComponent(TownContactForm, {
	name: "TownContactForm",
	inputs: [],
});

Builder.registerComponent(TownAgendaMinutes, {
	name: "TownAgendaMinutes",
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
	inputs: [
		{
			name: "height",
			type: "string",
			defaultValue: "calc(100vh - 200px)",
			helperText: "CSS height (e.g. '500px', '70vh').",
		},
		{
			name: "minHeight",
			type: "string",
			defaultValue: "500px",
		},
	],
});
