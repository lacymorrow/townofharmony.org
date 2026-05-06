import type { TownAnnouncement } from "./types";

export const announcements: TownAnnouncement[] = [
	{
		id: 1,
		title: "New Website Launch",
		content:
			"Explore our redesigned site and share feedback via the Contact page.",
		link: "/contact",
		level: "info",
		isActive: true,
		createdAt: "2026-05-05",
	},
];
