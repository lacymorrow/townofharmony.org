/**
 * Client-side synchronous data access layer for town content.
 * Used by Builder.io "use client" components that cannot call async functions.
 * Mirrors src/lib/town-data.ts with synchronous equivalents.
 */

import { announcements } from "@/data/town/announcements";
import { businesses } from "@/data/town/businesses";
import { elections } from "@/data/town/elections";
import { emergencyServices } from "@/data/town/emergency-services";
import type { TownEvent } from "@/data/town/types";
import { historyArticles } from "@/data/town/history";
import { homepage } from "@/data/town/homepage";
import { mapBusinesses } from "@/data/town/map-businesses";
import { meetings } from "@/data/town/meetings";
import { navigation } from "@/data/town/navigation";
import { news } from "@/data/town/news";
import { pointsOfInterest } from "@/data/town/points-of-interest";
import { resources } from "@/data/town/resources";
import { settings } from "@/data/town/settings";
import { teamMembers } from "@/data/town/team-members";
import type { BusinessCategory, MapBusiness } from "@/lib/map-utils";

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

// --- News ---

export const getNewsSync = (options?: {
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

	filtered.sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	);

	return paginate(filtered, limit, page);
};

export const getNewsBySlugSync = (slug: string) => {
	return news.find((n) => n.slug === slug) ?? null;
};

// --- Events ---
// Events are fetched exclusively from Builder.io at runtime.
// These stubs remain for interface compatibility; callers should
// migrate to useBuilderData("town-event") or resolveEvents().

export const getEventsSync = (options?: {
	limit?: number;
	page?: number;
	category?: string;
	status?: string;
	month?: string;
	year?: string;
}) => {
	const { limit = 10, page = 1 } = options ?? {};
	return paginate([] as TownEvent[], limit, page);
};

export const getEventBySlugSync = (_slug: string) => {
	return null;
};

// --- Meetings ---

export const getMeetingsSync = (options?: {
	limit?: number;
	page?: number;
	type?: string;
	month?: string;
	year?: string;
	status?: string;
	hasRecordings?: boolean;
}) => {
	const { limit = 10, page = 1, type, month, year, status, hasRecordings } =
		options ?? {};

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
				filtered = filtered.filter(
					(m) => (m.meetingDate.split("T")[0] ?? "") >= today,
				);
				break;
			case "past":
				filtered = filtered.filter(
					(m) => (m.meetingDate.split("T")[0] ?? "") <= today,
				);
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

	filtered.sort(
		(a, b) =>
			new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
	);

	return paginate(filtered, limit, page);
};

export const getMeetingBySlugSync = (slug: string) => {
	return meetings.find((m) => m.slug === slug) ?? null;
};

// --- Team Members ---

export const getTeamMembersSync = () => {
	return teamMembers.filter((m) => m.isActive);
};

// --- History ---

export const getHistoryArticlesSync = (type?: "period" | "landmark") => {
	if (type) {
		return historyArticles.filter((a) => a.type === type);
	}
	return [...historyArticles];
};

// --- Points of Interest ---

export const getPointsOfInterestSync = (category?: string) => {
	let filtered = [...pointsOfInterest];
	if (category) {
		filtered = filtered.filter((p) => p.category === category);
	}
	return filtered.sort((a, b) => a.name.localeCompare(b.name));
};

// --- Resources ---

export const getResourcesSync = (options?: {
	type?: string;
	category?: string;
}) => {
	let filtered = [...resources];
	if (options?.type) {
		filtered = filtered.filter((r) => r.type === options.type);
	}
	if (options?.category) {
		filtered = filtered.filter((r) => r.category === options.category);
	}
	return filtered;
};

// --- Emergency Services ---

export const getEmergencyServicesSync = () => {
	return [...emergencyServices];
};

// --- Announcements ---

export const getActiveAnnouncementsSync = () => {
	const now = new Date().toISOString();
	return announcements.filter((a) => {
		if (!a.isActive) return false;
		if (a.startsAt && a.startsAt > now) return false;
		if (a.endsAt && a.endsAt < now) return false;
		return true;
	});
};

export const getAnnouncementsSync = (options?: {
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

	filtered.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	return paginate(filtered, limit, page);
};

export const getAnnouncementByIdSync = (id: number) => {
	return announcements.find((a) => a.id === id) ?? null;
};

// --- Businesses ---

export const getBusinessesSync = (options?: {
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

	filtered.sort((a, b) => {
		if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
		if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
		return a.name.localeCompare(b.name);
	});

	return paginate(filtered, limit, page);
};

export const getBusinessBySlugSync = (slug: string) => {
	return businesses.find((b) => b.slug === slug) ?? null;
};

// --- Elections ---

export const getElectionsSync = (options?: {
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

	filtered.sort(
		(a, b) =>
			new Date(b.electionDate).getTime() -
			new Date(a.electionDate).getTime(),
	);

	return paginate(filtered, limit, page);
};

export const getElectionBySlugSync = (slug: string) => {
	return elections.find((e) => e.slug === slug) ?? null;
};

// --- Map Businesses ---

export const getMapBusinessesSync = (options?: {
	limit?: number;
	page?: number;
	category?: BusinessCategory;
	search?: string;
}): { docs: MapBusiness[]; totalDocs: number; totalPages: number; page: number } => {
	const { limit = 100, page = 1, category, search } = options ?? {};

	let filtered = [...mapBusinesses];

	if (category) {
		filtered = filtered.filter((b) => b.category === category);
	}

	if (search) {
		filtered = filtered.filter(
			(b) => likeMatch(b.name, search) || likeMatch(b.description, search),
		);
	}

	filtered.sort((a, b) => a.name.localeCompare(b.name));

	return paginate(filtered, limit, page);
};

export const getMapBusinessByIdSync = (id: string): MapBusiness | null => {
	return mapBusinesses.find((b) => b.id === id) ?? null;
};

// --- Globals ---

export const getSettingsSync = () => settings;
export const getNavigationSync = () => navigation;
export const getHomepageSync = () => homepage;
