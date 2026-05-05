import type { TownAnnouncement } from "./types";

export const announcements: TownAnnouncement[] = [
	{
		id: 1,
		title: "Welcome to Our New Website",
		content:
			"Welcome to the redesigned Town of Harmony website. We invite you to explore our updated pages and share feedback via the Contact page.",
		link: "/contact",
		level: "info",
		isActive: true,
		createdAt: "2026-05-05",
	},
];
