import { news } from "@/data/town/news";
import { events } from "@/data/town/events";
import { meetings } from "@/data/town/meetings";
import { teamMembers } from "@/data/town/team-members";
import { historyArticles } from "@/data/town/history";
import { pointsOfInterest } from "@/data/town/points-of-interest";
import { resources } from "@/data/town/resources";
import { emergencyServices } from "@/data/town/emergency-services";
import { announcements } from "@/data/town/announcements";
import { businesses } from "@/data/town/businesses";
import { elections } from "@/data/town/elections";
import { settings, toTownSettings, type BuilderSettingsFlat } from "@/data/town/settings";
import { navigation } from "@/data/town/navigation";
import { homepage } from "@/data/town/homepage";
import type { TownEvent } from "@/data/town/types";
import { fetchBuilderContent, fetchBuilderEntry } from "@/lib/builder-data-server";

/**
 * Static data access layer for town content.
 * All functions stay async to keep existing await calls valid.
 * Returns the same shapes as the previous Payload CMS queries.
 */

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

	let filtered = news.filter((n) => n.status === "published");

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
	return news.find((n) => n.slug === slug) ?? null;
};

/**
 * Increment view count on a news article (no-op for static data)
 */
export const incrementNewsViewCount = async (_id: number, _currentCount: number) => {
	// No-op for static data
};

/**
 * Resolve the event list: prefer Builder.io town-event entries, fall back to static data.
 */
const resolveEvents = async (): Promise<TownEvent[]> => {
	try {
		const { results } = await fetchBuilderContent<TownEvent>("town-event");
		if (results.length > 0) return results;
	} catch { /* fall through to static */ }
	return events;
};

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
 * Get a single event by slug
 */
export const getEventBySlug = async (slug: string) => {
	const builderEvent = await fetchBuilderEntry<TownEvent>("town-event", {
		"data.slug": slug,
	});
	if (builderEvent) return builderEvent;
	return events.find((e) => e.slug === slug) ?? null;
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

	let filtered = meetings.filter((m) => m.isPublic);

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
		const today = new Date().toISOString().split("T")[0]!;
		switch (status) {
			case "upcoming":
				filtered = filtered.filter((m) => (m.meetingDate.split("T")[0] ?? "") >= today);
				break;
			case "past":
				filtered = filtered.filter((m) => (m.meetingDate.split("T")[0] ?? "") <= today);
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
	return meetings.find((m) => m.slug === slug) ?? null;
};

/**
 * Get team members, sorted by category and sortOrder
 */
export const getTeamMembers = async () => {
	return teamMembers
		.filter((m) => m.isActive)
		.sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get history articles
 */
export const getHistoryArticles = async (type?: "period" | "landmark") => {
	let filtered = [...historyArticles];
	if (type) {
		filtered = filtered.filter((a) => a.type === type);
	}
	return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get points of interest
 */
export const getPointsOfInterest = async (category?: string) => {
	let filtered = [...pointsOfInterest];
	if (category) {
		filtered = filtered.filter((p) => p.category === category);
	}
	return filtered.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get resources
 */
export const getResources = async (options?: { type?: string; category?: string }) => {
	let filtered = [...resources];
	if (options?.type) {
		filtered = filtered.filter((r) => r.type === options.type);
	}
	if (options?.category) {
		filtered = filtered.filter((r) => r.category === options.category);
	}
	return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get emergency services
 */
export const getEmergencyServices = async () => {
	return [...emergencyServices].sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Get active announcements (emergency alerts)
 */
export const getActiveAnnouncements = async () => {
	const now = new Date().toISOString();
	return announcements.filter((a) => {
		if (!a.isActive) return false;
		if (a.startsAt && a.startsAt > now) return false;
		if (a.endsAt && a.endsAt < now) return false;
		return true;
	});
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

	let filtered = [...announcements];

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
export const getAnnouncementById = async (id: number) => {
	return announcements.find((a) => a.id === id) ?? null;
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

	let filtered = [...businesses];

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
	return businesses.find((b) => b.slug === slug) ?? null;
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

	let filtered = [...elections];
	const today = new Date().toISOString().split("T")[0]!;

	if (status === "upcoming") {
		filtered = filtered.filter((e) => (e.electionDate.split("T")[0] ?? "") > today);
	} else if (status === "today") {
		filtered = filtered.filter((e) => e.electionDate.split("T")[0] === today);
	} else if (status === "past") {
		filtered = filtered.filter((e) => (e.electionDate.split("T")[0] ?? "") < today);
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
	return elections.find((e) => e.slug === slug) ?? null;
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
	const publicMeetings = meetings.filter((m) => m.isPublic);

	const typeSet = new Set<string>();
	const yearSet = new Set<number>();
	const today = new Date().toISOString().split("T")[0]!;

	let hasUpcoming = false;
	let hasPast = false;
	let hasMinutes = false;
	let hasRecordings = false;

	for (const m of publicMeetings) {
		typeSet.add(m.type);
		const [yearStr] = m.meetingDate.split("-");
		if (yearStr) yearSet.add(Number(yearStr));

		const dateOnly = m.meetingDate.split("T")[0]!;
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
	const published = news.filter((n) => n.status === "published");

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
