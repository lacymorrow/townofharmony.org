import { cache } from "react";
import { news } from "@/data/town/news";
import { meetings } from "@/data/town/meetings";
import { teamMembers } from "@/data/town/team-members";
import { historyArticles } from "@/data/town/history";
import { pointsOfInterest } from "@/data/town/points-of-interest";
import { resources } from "@/data/town/resources";
import { emergencyServices } from "@/data/town/emergency-services";
import { announcements } from "@/data/town/announcements";
import { businesses } from "@/data/town/businesses";
import { elections } from "@/data/town/elections";
import { mapBusinesses } from "@/data/town/map-businesses";
import { settings, toTownSettings, type BuilderSettingsFlat } from "@/data/town/settings";
import { navigation } from "@/data/town/navigation";
import { homepage } from "@/data/town/homepage";
import type {
	TownAnnouncement,
	TownBusiness,
	TownElection,
	TownEmergencyService,
	TownEvent,
	TownHistoryArticle,
	TownMeeting,
	TownNews,
	TownPointOfInterest,
	TownResource,
	TownTeamMember,
} from "@/data/town/types";
import type { MapBusiness } from "@/lib/map-utils";
import { fetchBuilderContent, fetchBuilderEntry } from "@/lib/builder-data-server";
import { fetchBuilderEntries } from "@/lib/builder-content-fetch";
import { getTodayString, toDateOnly } from "@/lib/date-only";
import { logger } from "@/lib/logger";
import { findMeetingBySlug, getCanonicalMeetingSlug } from "@/lib/meeting-slug";
import { slugify } from "@/lib/utils/extract-headings";

/**
 * Server-side data access layer for town content.
 *
 * Each getter reads from Builder.io first and falls back to the bundled static
 * arrays in `src/data/town/*` when Builder returns nothing or errors. This
 * lets content editors change news/meetings/businesses/etc. in Builder without
 * a redeploy, while the static arrays keep the site working when Builder is
 * unreachable (network failure, missing API key, empty models pre-migration).
 */

/**
 * Build a request-cached resolver for a Builder.io data model.
 *
 * Fetches all entries in one call (models are small, so we paginate on our
 * side), preserves the Builder entry id when the model has no `id` field of
 * its own (needed for React keys, URL params, and by-id lookups), and returns
 * the static fallback when Builder is empty or fails.
 */
const buildBuilderListResolver = <T extends { id?: unknown }>(
	model: string,
	fallback: T[],
	options?: { limit?: number; sort?: Record<string, number> },
) =>
	cache(async (): Promise<T[]> => {
		try {
			const { results } = await fetchBuilderEntries<T>(model, {
				limit: options?.limit ?? 1000,
				sort: options?.sort,
			});
			if (results.length === 0) return fallback;
			return results.map((entry) => {
				const data = entry.data as T;
				if (data.id !== undefined && data.id !== null && data.id !== "") return data;
				return { ...data, id: entry.id } as T;
			});
		} catch (err) {
			logger.warn(
				`Failed to fetch ${model} from Builder.io — falling back to static data`,
				{ error: err instanceof Error ? err.message : String(err) },
			);
			return fallback;
		}
	});

const resolveNews = buildBuilderListResolver<TownNews>("town-news", news);
const resolveMeetingsRaw = buildBuilderListResolver<TownMeeting>("town-meeting", meetings);
// Editors enter recurring slugs ("town-council-meeting") in Builder, so raw
// slugs collide across months — canonicalize so every link is unique (LAC-3549).
const resolveMeetings = async (): Promise<TownMeeting[]> =>
	(await resolveMeetingsRaw()).map((m) => ({ ...m, slug: getCanonicalMeetingSlug(m) }));
const resolveTeamMembers = buildBuilderListResolver<TownTeamMember>(
	"town-team-member",
	teamMembers,
	{ sort: { priority: -1 } },
);
const resolveHistoryArticles = buildBuilderListResolver<TownHistoryArticle>(
	"town-history-article",
	historyArticles,
	{ sort: { priority: -1 } },
);
const resolvePointsOfInterest = buildBuilderListResolver<TownPointOfInterest>(
	"town-point-of-interest",
	pointsOfInterest,
);
const resolveResources = buildBuilderListResolver<TownResource>("town-resource", resources);
const resolveEmergencyServices = buildBuilderListResolver<TownEmergencyService>(
	"town-emergency-service",
	emergencyServices,
);
const resolveAnnouncements = buildBuilderListResolver<TownAnnouncement>(
	"town-announcement",
	announcements,
);
const resolveBusinesses = buildBuilderListResolver<TownBusiness>("town-business", businesses);
const resolveElections = buildBuilderListResolver<TownElection>("town-election", elections);
const resolveMapBusinesses = buildBuilderListResolver<MapBusiness>(
	"town-map-business",
	mapBusinesses,
);

const paginate = <T>(items: T[], limit: number, page: number) => {
	const totalDocs = items.length;
	const totalPages = Math.ceil(totalDocs / limit);
	const start = (page - 1) * limit;
	const docs = items.slice(start, start + limit);
	return { docs, totalDocs, totalPages, page };
};

const likeMatch = (value: string | undefined, search: string): boolean => {
	if (!value) return false;
	return value.toLowerCase().includes(search.toLowerCase());
};

/**
 * Get published news articles
 */
export const getNews = async (options?: {
	limit?: number;
	page?: number;
	category?: string;
	search?: string;
}) => {
	const { limit = 10, page = 1, category, search } = options ?? {};

	const all = await resolveNews();
	let filtered = all.filter((n) => n.status === "published");

	if (category) {
		filtered = filtered.filter((n) => n.categories.includes(category));
	}

	if (search) {
		filtered = filtered.filter(
			(n) => likeMatch(n.title, search) || likeMatch(n.excerpt, search),
		);
	}

	filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

	return paginate(filtered, limit, page);
};

/**
 * Get a single news article by slug
 */
export const getNewsBySlug = async (slug: string) => {
	const all = await resolveNews();
	return all.find((n) => n.slug === slug) ?? null;
};

/**
 * Increment view count on a news article (no-op for static data)
 */
export const incrementNewsViewCount = async (_id: number, _currentCount: number) => {
	// No-op for static data
};

/** Derive a slug from the title when an editor leaves the slug field empty in Builder.io. */
const ensureEventSlug = (event: TownEvent): TownEvent => {
	if (event.slug && event.slug.trim() !== "") return event;
	const derived = event.title ? slugify(event.title) : "";
	return { ...event, slug: derived || String(event.id ?? "") };
};

/**
 * Fetch events exclusively from Builder.io's town-event data model.
 * Static data is not a valid fallback — events must reflect real, current information.
 *
 * Wrapped in `cache()` so multiple lookups in the same render share one fetch.
 * (Next.js fetch already dedupes at the network layer; this avoids the
 * `ensureEventSlug` map cost on repeat calls.)
 */
export const resolveEvents = cache(async (): Promise<TownEvent[]> => {
	const { results } = await fetchBuilderContent<TownEvent>("town-event", { limit: 1000 });
	return results.map(ensureEventSlug);
});

/**
 * Slug → event map, built once per render and reused by `getEventBySlug`
 * when an entry's stored slug doesn't match (e.g. editor left the field
 * blank and we fall back to a title-derived slug).
 */
const resolveEventBySlugMap = cache(async (): Promise<Map<string, TownEvent>> => {
	const all = await resolveEvents();
	const map = new Map<string, TownEvent>();
	for (const event of all) {
		if (event.slug) map.set(event.slug, event);
	}
	return map;
});

/**
 * Get upcoming events
 */
export const getEvents = async (options?: {
	limit?: number;
	page?: number;
	category?: string;
	status?: string;
	month?: string;
	year?: string;
}) => {
	const { limit = 10, page = 1, category, status, month, year } = options ?? {};

	let filtered = [...(await resolveEvents())];

	const now = new Date();
	if (status === "upcoming") {
		filtered = filtered.filter((e) => e.status !== "cancelled" && new Date(e.eventDate) >= now);
	} else if (status === "past") {
		filtered = filtered.filter((e) => new Date(e.eventDate) < now);
	} else if (status) {
		filtered = filtered.filter((e) => e.status === status);
	} else {
		filtered = filtered.filter((e) => e.status !== "cancelled" && new Date(e.eventDate) >= now);
	}

	if (category) {
		filtered = filtered.filter((e) => e.categories.includes(category));
	}

	if (month && year) {
		const monthNum = parseInt(month);
		const yearNum = parseInt(year);
		filtered = filtered.filter((e) => {
			const d = new Date(e.eventDate);
			return d.getMonth() + 1 === monthNum && d.getFullYear() === yearNum;
		});
	}

	filtered.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

	return paginate(filtered, limit, page);
};

/**
 * Get a single event by slug from Builder.io.
 *
 * Direct path: query Builder by `data.slug` — O(1) on the CMS side.
 * Fallback path: only runs when the entry was saved without a slug field
 * (editors can leave it blank — the model marks slug optional). Uses the
 * request-cached slug map so the cost is one Builder fetch per render,
 * not one per missing-slug lookup, with O(1) lookup against the map.
 */
export const getEventBySlug = async (slug: string): Promise<TownEvent | null> => {
	const direct = await fetchBuilderEntry<TownEvent>("town-event", { "data.slug": slug });
	if (direct) return ensureEventSlug(direct);
	const bySlug = await resolveEventBySlugMap();
	const match = bySlug.get(slug);
	if (match) {
		logger.warn("Event resolved via slug-derivation fallback — Builder entry is missing data.slug", {
			slug,
			eventTitle: match.title,
			eventId: match.id,
		});
		return match;
	}
	return null;
};

/**
 * Get meetings
 */
export const getMeetings = async (options?: {
	limit?: number;
	page?: number;
	type?: string;
	month?: string;
	year?: string;
	status?: string;
	hasRecordings?: boolean;
}) => {
	const { limit = 10, page = 1, type, month, year, status, hasRecordings } = options ?? {};

	const allMeetings = await resolveMeetings();
	let filtered = allMeetings.filter((m) => m.isPublic);

	if (type) {
		filtered = filtered.filter((m) => m.type === type);
	}

	if (month && year) {
		const monthNum = parseInt(month);
		const yearNum = parseInt(year);
		filtered = filtered.filter((m) => {
			const d = new Date(m.meetingDate);
			return d.getMonth() + 1 === monthNum && d.getFullYear() === yearNum;
		});
	} else if (year) {
		const yearNum = parseInt(year);
		filtered = filtered.filter((m) => {
			const d = new Date(m.meetingDate);
			return d.getFullYear() === yearNum;
		});
	}

	if (status) {
		const today = getTodayString();
		switch (status) {
			case "upcoming":
				filtered = filtered.filter((m) => (toDateOnly(m.meetingDate) ?? "") >= today);
				break;
			case "past":
				filtered = filtered.filter((m) => (toDateOnly(m.meetingDate) ?? "") <= today);
				break;
			case "has-recordings":
				filtered = filtered.filter((m) => m.videoUrl || m.audioUrl);
				break;
			case "has-minutes":
				filtered = filtered.filter((m) => m.minutes || m.minutesUrl);
				break;
		}
	}

	if (hasRecordings) {
		filtered = filtered.filter((m) => m.videoUrl || m.audioUrl);
	}

	filtered.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());

	return paginate(filtered, limit, page);
};

/**
 * Get a single meeting by slug
 */
export const getMeetingBySlug = async (slug: string) => {
	const allMeetings = await resolveMeetings();
	return findMeetingBySlug(allMeetings, slug);
};

/**
 * Get team members, sorted by category
 */
export const getTeamMembers = async () => {
	const all = await resolveTeamMembers();
	return all.filter((m) => m.isActive);
};

/**
 * Get history articles
 */
export const getHistoryArticles = async (type?: "period" | "landmark") => {
	const all = await resolveHistoryArticles();
	if (type) {
		return all.filter((a) => a.type === type);
	}
	return [...all];
};

/**
 * Get points of interest
 */
export const getPointsOfInterest = async (category?: string) => {
	const all = await resolvePointsOfInterest();
	let filtered = [...all];
	if (category) {
		filtered = filtered.filter((p) => p.category === category);
	}
	return filtered.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get resources
 */
export const getResources = async (options?: { type?: string; category?: string }) => {
	const all = await resolveResources();
	let filtered = [...all];
	if (options?.type) {
		filtered = filtered.filter((r) => r.type === options.type);
	}
	if (options?.category) {
		filtered = filtered.filter((r) => r.category === options.category);
	}
	return filtered;
};

/**
 * Get emergency services
 */
export const getEmergencyServices = async () => {
	const all = await resolveEmergencyServices();
	return [...all];
};

/**
 * Get active announcements (emergency alerts). Powers the site-wide
 * EmergencyBanner in the town layout.
 */
export const getActiveAnnouncements = async () => {
	const all = await resolveAnnouncements();
	const now = new Date().toISOString();
	return all.filter((a) => {
		if (!a.isActive) return false;
		if (a.startsAt && a.startsAt > now) return false;
		if (a.endsAt && a.endsAt < now) return false;
		return true;
	});
};

/**
 * Get map businesses for the interactive map page.
 */
export const getMapBusinesses = async (): Promise<MapBusiness[]> => {
	return [...(await resolveMapBusinesses())];
};

/**
 * Get all announcements (for listing page)
 */
export const getAnnouncements = async (options?: {
	limit?: number;
	page?: number;
	level?: string;
	activeOnly?: boolean;
}) => {
	const { limit = 10, page = 1, level, activeOnly } = options ?? {};

	const all = await resolveAnnouncements();
	let filtered = [...all];

	if (level) {
		filtered = filtered.filter((a) => a.level === level);
	}

	if (activeOnly) {
		const now = new Date().toISOString();
		filtered = filtered.filter((a) => {
			if (!a.isActive) return false;
			if (a.startsAt && a.startsAt > now) return false;
			if (a.endsAt && a.endsAt < now) return false;
			return true;
		});
	}

	filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return paginate(filtered, limit, page);
};

/**
 * Get a single announcement by ID
 */
export const getAnnouncementById = async (id: number | string) => {
	const all = await resolveAnnouncements();
	return all.find((a) => String(a.id) === String(id)) ?? null;
};

/**
 * Get businesses
 */
export const getBusinesses = async (options?: {
	limit?: number;
	page?: number;
	category?: string;
	search?: string;
	featured?: boolean;
}) => {
	const { limit = 10, page = 1, category, search, featured } = options ?? {};

	const all = await resolveBusinesses();
	let filtered = [...all];

	if (category) {
		filtered = filtered.filter((b) => b.category === category);
	}

	if (search) {
		filtered = filtered.filter(
			(b) => likeMatch(b.name, search) || likeMatch(b.description, search),
		);
	}

	if (featured) {
		filtered = filtered.filter((b) => b.isFeatured);
	}

	// Sort: featured first, then verified, then alphabetical
	filtered.sort((a, b) => {
		if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
		if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
		return a.name.localeCompare(b.name);
	});

	return paginate(filtered, limit, page);
};

/**
 * Get a single business by slug
 */
export const getBusinessBySlug = async (slug: string) => {
	const all = await resolveBusinesses();
	return all.find((b) => b.slug === slug) ?? null;
};

/**
 * Get elections
 */
export const getElections = async (options?: {
	limit?: number;
	page?: number;
	status?: "upcoming" | "today" | "past";
	search?: string;
}) => {
	const { limit = 10, page = 1, status, search } = options ?? {};

	const all = await resolveElections();
	let filtered = [...all];
	const today = getTodayString();

	if (status === "upcoming") {
		filtered = filtered.filter((e) => (toDateOnly(e.electionDate) ?? "") > today);
	} else if (status === "today") {
		filtered = filtered.filter((e) => toDateOnly(e.electionDate) === today);
	} else if (status === "past") {
		filtered = filtered.filter((e) => (toDateOnly(e.electionDate) ?? "") < today);
	}

	if (search) {
		filtered = filtered.filter(
			(e) => likeMatch(e.title, search) || likeMatch(e.description, search),
		);
	}

	filtered.sort((a, b) => new Date(b.electionDate).getTime() - new Date(a.electionDate).getTime());

	return paginate(filtered, limit, page);
};

/**
 * Get a single election by slug
 */
export const getElectionBySlug = async (slug: string) => {
	const all = await resolveElections();
	return all.find((e) => e.slug === slug) ?? null;
};

/**
 * Derive available filter options for events from the actual data.
 * Only categories/months that have at least one upcoming event are returned.
 */
export const getEventFilterOptions = async () => {
	const now = new Date();
	const allEvents = await resolveEvents();
	const upcomingEvents = allEvents.filter((e) => e.status !== "cancelled" && new Date(e.eventDate) >= now);

	const categorySet = new Set<string>();
	const monthSet = new Set<string>();

	for (const e of upcomingEvents) {
		for (const cat of e.categories) categorySet.add(cat);
		// Extract year/month directly from the date string to avoid timezone shifts
		const [year, month] = e.eventDate.split("-");
		if (year && month) monthSet.add(`${year}-${month}`);
	}

	return {
		categories: [...categorySet].sort(),
		months: [...monthSet].sort(),
	};
};

/**
 * Derive available filter options for meetings from the actual data.
 * Only types/years/statuses that match at least one public meeting are returned.
 */
export const getMeetingFilterOptions = async () => {
	const allMeetings = await resolveMeetings();
	const publicMeetings = allMeetings.filter((m) => m.isPublic);

	const typeSet = new Set<string>();
	const yearSet = new Set<number>();
	const today = getTodayString();

	let hasUpcoming = false;
	let hasPast = false;
	let hasMinutes = false;
	let hasRecordings = false;

	for (const m of publicMeetings) {
		typeSet.add(m.type);
		const dateOnly = toDateOnly(m.meetingDate);
		if (!dateOnly) continue;
		const yearStr = dateOnly.slice(0, 4);
		yearSet.add(Number(yearStr));

		if (!hasUpcoming && dateOnly >= today) hasUpcoming = true;
		if (!hasPast && dateOnly < today) hasPast = true;
		if (!hasMinutes && (m.minutes || m.minutesUrl)) hasMinutes = true;
		if (!hasRecordings && (m.videoUrl || m.audioUrl)) hasRecordings = true;
	}

	const statuses: string[] = [];
	if (hasUpcoming) statuses.push("upcoming");
	if (hasPast) statuses.push("past");
	if (hasMinutes) statuses.push("has-minutes");
	if (hasRecordings) statuses.push("has-recordings");

	return {
		types: [...typeSet].sort(),
		years: [...yearSet].sort((a, b) => b - a),
		statuses,
	};
};

/**
 * Derive available filter options for news from the actual data.
 * Only categories/months that have at least one published article are returned.
 */
export const getNewsFilterOptions = async () => {
	const allNews = await resolveNews();
	const published = allNews.filter((n) => n.status === "published");

	const categorySet = new Set<string>();
	const monthSet = new Set<string>();

	for (const n of published) {
		for (const cat of n.categories) categorySet.add(cat);
		const [year, month] = n.publishedAt.split("-");
		if (year && month) monthSet.add(`${year}-${month}`);
	}

	return {
		categories: [...categorySet].sort(),
		months: [...monthSet].sort().reverse(),
	};
};

/**
 * Get an editable prose body for a hardcoded static page (e.g. /about,
 * /accessibility, /privacy). Returns null when Builder.io has no matching
 * entry — the caller should render its built-in fallback copy in that case.
 *
 * The `town-static-page` model is intentionally kept separate from the
 * Builder visual page catch-all so the routes stay hardcoded and Builder
 * only supplies the body copy.
 */
export const getStaticPage = cache(
	async (slug: string): Promise<{ title: string; body: string } | null> => {
		try {
			const entry = await fetchBuilderEntry<{ slug?: string; title?: string; body?: string }>(
				"town-static-page",
				{ "data.slug": slug },
			);
			if (!entry) return null;
			const title = entry.title?.trim();
			const body = entry.body?.trim();
			if (!title && !body) return null;
			return { title: title ?? "", body: body ?? "" };
		} catch (err) {
			logger.warn("Failed to fetch town-static-page from Builder.io — falling back", {
				slug,
				error: err instanceof Error ? err.message : String(err),
			});
			return null;
		}
	},
);

// --- Globals ---

/**
 * Get settings global — fetches from Builder.io with static fallback.
 */
export const getSettings = async () => {
	try {
		const builderSettings = await fetchBuilderEntry<BuilderSettingsFlat>(
			"town-settings",
			{},
		);
		if (builderSettings) {
			return toTownSettings(builderSettings);
		}
	} catch (err) {
		console.error("Failed to fetch settings from Builder.io:", err);
	}
	return settings;
};

/**
 * Get navigation global
 */
export const getNavigation = async () => {
	return navigation;
};

/**
 * Get homepage global
 */
export const getHomepage = async () => {
	return homepage;
};
