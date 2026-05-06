import type { TownAnnouncement } from "./types";

export const announcements: TownAnnouncement[] = [
	{
		id: 1,
		title: "Welcome to the New Town of Harmony Website",
		content:
			"Take a look around and let us know what you think via the Contact page.",
		link: "/contact",
		level: "info",
		isActive: true,
		createdAt: "2026-05-05",
	},
];
