"use client";
import { Builder } from "@builder.io/react";
import { withSafeBlock } from "./components/town/safe-block";
import { TownAgendaMinutes } from "./components/modules/builder/town/town-agenda-minutes";
import { TownAnnouncementBar } from "./components/modules/builder/town/town-announcement-bar";
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
import { TownHeroBanner } from "./components/modules/builder/town/town-hero-banner";
import { TownHistoryTimeline } from "./components/modules/builder/town/town-history-timeline";
import { TownInteractiveMap } from "./components/modules/builder/town/town-interactive-map";
import { TownLatestNews } from "./components/modules/builder/town/town-latest-news";
import { TownMeetingDetail } from "./components/modules/builder/town/town-meeting-detail";
import { TownMeetingsList } from "./components/modules/builder/town/town-meetings-list";
import { TownNewsDetail } from "./components/modules/builder/town/town-news-detail";
import { TownNewsGrid } from "./components/modules/builder/town/town-news-grid";
import { TownPageCta } from "./components/modules/builder/town/town-page-cta";
import { TownPageHeader } from "./components/modules/builder/town/town-page-header";
import { TownPointsOfInterest } from "./components/modules/builder/town/town-points-of-interest";
import { TownQuickLinks } from "./components/modules/builder/town/town-quick-links";
import { TownResourcesList } from "./components/modules/builder/town/town-resources-list";
import { TownTeamMembers } from "./components/modules/builder/town/town-team-members";
import { TownUpcomingEvents } from "./components/modules/builder/town/town-upcoming-events";

// Every town block renders inside a SafeBlock so one bad Builder entry hides
// that block instead of crashing the page. Editors see a notice in preview.
const registerComponent = (
  component: Parameters<typeof Builder.registerComponent>[0],
  options: Parameters<typeof Builder.registerComponent>[1],
) => Builder.registerComponent(withSafeBlock(component, options.name), options);

// --- Homepage Components ---

registerComponent(TownHero, {
  name: "TownHero",
  inputs: [
    { name: "title", type: "string", defaultValue: "Welcome to Harmony" },
    { name: "subtitle", type: "string", defaultValue: "A community rooted in tradition" },
    { name: "image", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
    {
      name: "ctaText",
      type: "string",
      defaultValue: "Explore Our Town",
      friendlyName: "CTA Button Text",
    },
    { name: "ctaHref", type: "string", defaultValue: "/about", friendlyName: "CTA Button URL" },
  ],
});

registerComponent(TownQuickLinks, {
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

registerComponent(TownLatestNews, {
  name: "TownLatestNews",
  inputs: [
    {
      name: "limit",
      type: "number",
      defaultValue: 3,
      helperText: "Number of news articles to show",
    },
  ],
});

registerComponent(TownUpcomingEvents, {
  name: "TownUpcomingEvents",
  inputs: [
    { name: "limit", type: "number", defaultValue: 5, helperText: "Number of events to show" },
  ],
});

registerComponent(TownCommunitySpotlight, {
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

registerComponent(TownNewsGrid, {
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

registerComponent(TownEventsList, {
  name: "TownEventsList",
  inputs: [
    { name: "itemsPerPage", type: "number", defaultValue: 10, friendlyName: "Items Per Page" },
    { name: "showFilters", type: "boolean", defaultValue: true, friendlyName: "Show Filter Bar" },
  ],
});

registerComponent(TownMeetingsList, {
  name: "TownMeetingsList",
  inputs: [
    { name: "itemsPerPage", type: "number", defaultValue: 10, friendlyName: "Items Per Page" },
    {
      name: "showCalendar",
      type: "boolean",
      defaultValue: false,
      friendlyName: "Show Calendar View",
    },
  ],
});

registerComponent(TownBusinessDirectory, {
  name: "TownBusinessDirectory",
  inputs: [
    { name: "itemsPerPage", type: "number", defaultValue: 12, friendlyName: "Items Per Page" },
    { name: "showSearch", type: "boolean", defaultValue: true, friendlyName: "Show Search" },
  ],
});

registerComponent(TownElectionsList, {
  name: "TownElectionsList",
  inputs: [
    { name: "itemsPerPage", type: "number", defaultValue: 6, friendlyName: "Items Per Page" },
  ],
});

registerComponent(TownTeamMembers, {
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

registerComponent(TownPointsOfInterest, {
  name: "TownPointsOfInterest",
  inputs: [
    {
      name: "showCategoryFilter",
      type: "boolean",
      defaultValue: true,
      friendlyName: "Show Category Filter",
    },
  ],
});

registerComponent(TownHistoryTimeline, {
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

registerComponent(TownResourcesList, {
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

registerComponent(TownNewsDetail, {
  name: "TownNewsDetail",
  models: ["page"],
  inputs: [
    { name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
  ],
});

registerComponent(TownEventDetail, {
  name: "TownEventDetail",
  models: ["page"],
  inputs: [
    { name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
  ],
});

registerComponent(TownMeetingDetail, {
  name: "TownMeetingDetail",
  models: ["page"],
  inputs: [
    { name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
  ],
});

registerComponent(TownBusinessDetail, {
  name: "TownBusinessDetail",
  models: ["page"],
  inputs: [
    { name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
  ],
});

registerComponent(TownElectionDetail, {
  name: "TownElectionDetail",
  models: ["page"],
  inputs: [
    { name: "slug", type: "string", helperText: "Override slug (auto-detected from URL if empty)" },
  ],
});

// --- Utility / Section Components ---

registerComponent(TownPageHeader, {
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
    {
      name: "customBgColor",
      type: "color",
      friendlyName: "Custom Background Color",
      helperText: "Overrides the variant preset when set.",
      advanced: true,
    },
  ],
});

// Service cards are driven by the town-emergency-service data model — edit
// individual services there. The block renders its own page header (with the
// 911 call block built in), so pages using it don't need a TownPageHeader.
registerComponent(TownEmergencyServices, {
  name: "TownEmergencyServices",
  inputs: [
    {
      name: "title",
      type: "string",
      defaultValue: "Emergency Services",
    },
    {
      name: "subtitle",
      type: "string",
      defaultValue: "Emergency alerts, contacts, and preparedness",
    },
  ],
});

// TownEmergencyAlertsList removed — EmergencyBanner in the layout already
// shows active alerts on every page, making the Builder.io block redundant.

// Form labels, validation, and submit handler are owned by the component
// for security/consistency. Only recipient routing is exposed to town staff
// so they can re-point inquiries without a code deploy (LAC-3347). Server
// validates the addresses and falls back to env/default on a bad value.
registerComponent(TownContactForm, {
  name: "TownContactForm",
  inputs: [
    {
      name: "recipientEmail",
      type: "string",
      friendlyName: "Send Inquiries To",
      helperText:
        "Where inquiries go. One address, or several separated by commas. Leave blank to use the town default.",
    },
    {
      name: "bccEmail",
      type: "string",
      friendlyName: "BCC (hidden copy)",
      helperText:
        "Extra address(es) that get a hidden copy of every inquiry. Comma-separated. Leave blank to use the town default.",
      advanced: true,
    },
  ],
});

registerComponent(TownAgendaMinutes, {
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

registerComponent(TownInteractiveMap, {
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

registerComponent(TownAnnouncementBar, {
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

registerComponent(TownHeroBanner, {
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

registerComponent(TownPageCta, {
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
