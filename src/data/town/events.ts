import type { TownEvent } from "./types";
import { mediaUrls } from "./media";

// Verified against the legacy townofharmony.org calendar (2026-04-28).
// Town Hall is the single source of truth for contact info; events
// coordinator (Spring in the Park / Farmers Market) uses 704-881-8094
// per legacy event pages.
export const events: TownEvent[] = [
	{
		id: 1,
		title: "Spring in the Park 2026",
		slug: "spring-in-the-park-2026",
		description:
			"Annual community celebration at Tomlinson-Moore Family Park featuring mini golf, carnival tents, games, food trucks, local vendors, and the Harmony's Got Talent contest.",
		content:
			"Spring in the Park 2026 returns Saturday, April 11. Highlights include mini golf, two carnival tents, games, food trucks and local vendors, and the Harmony's Got Talent contest (registrations accepted before April 4). Free vendor opportunities and sponsorships are available.",
		featuredImage: mediaUrls["event-spring-cleanup"] ?? null,
		eventDate: "2026-04-11T12:00:00",
		eventTime: "12:00 PM",
		endTime: "5:00 PM",
		location: "Tomlinson-Moore Family Park",
		locationAddress: "187 Highland Point Ave, Harmony, NC 28634",
		organizer: "Town of Harmony",
		contactEmail: "",
		contactPhone: "(704) 881-8094",
		status: "past",
		isRecurring: false,
		categories: ["community", "festival"],
		tags: ["spring", "festival", "family"],
	},
	{
		id: 2,
		title: "May Farmers Market 2026",
		slug: "farmers-market-may-2026",
		description:
			"The 2nd-Friday Farmers Market at the new Tomlinson-Moore Family Park location. Free vendor opportunities available; food trucks may register to participate.",
		content:
			"The Harmony Farmers Market returns Friday, May 8, 2026 from 4 PM to 7 PM at the new location: Tomlinson-Moore Family Park, 187 Highland Point Ave. Free vendor opportunities are available. Food trucks may register to participate.",
		featuredImage: mediaUrls["event-farmers-market"] ?? null,
		eventDate: "2026-05-08T16:00:00",
		eventTime: "4:00 PM",
		endTime: "7:00 PM",
		location: "Tomlinson-Moore Family Park",
		locationAddress: "187 Highland Point Ave, Harmony, NC 28634",
		organizer: "Town of Harmony",
		contactEmail: "",
		contactPhone: "(704) 881-8094",
		status: "past",
		isRecurring: true,
		categories: ["community", "recreation"],
		tags: ["farmers-market", "local"],
	},
	{
		id: 3,
		title: "June Farmers Market 2026",
		slug: "farmers-market-june-2026",
		description:
			"The 2nd-Friday Farmers Market at the new Tomlinson-Moore Family Park location. Free vendor opportunities available; food trucks may register to participate.",
		content:
			"The Harmony Farmers Market continues Friday, June 12, 2026 from 4 PM to 7 PM at Tomlinson-Moore Family Park, 187 Highland Point Ave. Free vendor opportunities are available. Food trucks may register to participate.",
		featuredImage: mediaUrls["event-farmers-market"] ?? null,
		eventDate: "2026-06-12T16:00:00",
		eventTime: "4:00 PM",
		endTime: "7:00 PM",
		location: "Tomlinson-Moore Family Park",
		locationAddress: "187 Highland Point Ave, Harmony, NC 28634",
		organizer: "Town of Harmony",
		contactEmail: "",
		contactPhone: "(704) 881-8094",
		status: "upcoming",
		isRecurring: true,
		categories: ["community", "recreation"],
		tags: ["farmers-market", "local"],
	},
	{
		id: 4,
		title: "HWY 21 — 3-Day Road Market 2026",
		slug: "hwy-21-road-market-2026",
		description:
			"Three-day road market along Highway 21 — \"Take a break from the Interstate.\"",
		content:
			"The HWY 21 3-Day Road Market runs July 24–26, 2026 along Highway 21 through Harmony. More information at takeabreakfromtheinterstate.org.",
		featuredImage: mediaUrls["event-farmers-market"] ?? null,
		eventDate: "2026-07-24T08:00:00",
		eventTime: "All day",
		endTime: "All day",
		location: "Highway 21",
		locationAddress: "Harmony, NC 28634",
		organizer: "Town of Harmony",
		contactEmail: "",
		contactPhone: "(704) 546-2339",
		status: "upcoming",
		isRecurring: false,
		categories: ["community"],
		tags: ["road-market", "summer"],
	},
];
