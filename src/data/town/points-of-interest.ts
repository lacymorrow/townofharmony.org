import type { TownPointOfInterest } from "./types";
import { mediaUrls } from "./media";

export const pointsOfInterest: TownPointOfInterest[] = [
	{
		id: 1,
		name: "Tomlinson-Moore Family Park",
		slug: "tomlinson-moore-family-park",
		category: "Parks",
		description:
			"Community park offering recreational facilities for all ages.",
		image: mediaUrls["poi-park"],
		address: "Harmony, NC 28634",
		hours: "Dawn to Dusk",

		amenities: ["Playground", "Picnic Shelters", "Restrooms"],
	},
	{
		id: 2,
		name: "Harmony Town Hall",
		slug: "town-hall",
		category: "Government",
		description:
			"The seat of town government and center of civic life in Harmony. Town Hall houses administrative offices and serves as the meeting place for the Town Council. Residents can access various town services here.",
		image: mediaUrls["poi-town-hall"],
		address: "3389 Harmony Hwy, Harmony, NC 28634",
		hours: "Monday - Friday: 9:00 AM - 5:00 PM",

		amenities: ["Accessible Entrance", "Public Meeting Room", "Parking"],
	},
	{
		id: 3,
		name: "Camp Meeting Grounds",
		slug: "camp-meeting-grounds-poi",
		category: "Historic Sites",
		description:
			"The original camp meeting grounds where the Harmony community first gathered. This historic site predates the town's incorporation and represents the spiritual and communal roots of Harmony. The grounds continue to host community events and celebrations.",
		image: mediaUrls["poi-camp-grounds"],
		address: "Harmony Highway, Harmony, NC 28634",
		hours: "Open during events",

		amenities: ["Historic Markers", "Open Grounds", "Parking"],
	},
	{
		id: 4,
		name: "Harmony Veterans Memorial",
		slug: "veterans-memorial",
		category: "Memorials",
		description:
			"A solemn memorial honoring the brave men and women from the Harmony community who served in the United States Armed Forces. The memorial features plaques, flags, and a peaceful garden setting for reflection.",
		image: mediaUrls["poi-memorial"],
		address: "Harmony, NC 28634",
		hours: "Open 24 hours",
		amenities: ["Memorial Plaques", "Flag Display", "Garden", "Benches"],
	},
	{
		id: 5,
		name: "Harmony Community Center",
		slug: "community-center-poi",
		category: "Government",
		description:
			"A multipurpose facility that serves as the heart of community activities. The center hosts meetings, classes, events, and social gatherings. Available for private rentals and community organization meetings.",
		image: mediaUrls["poi-community-center"],
		address: "187 Highland Point Ave, Harmony, NC 28634",
		hours: "10:00 AM - 10:00 PM (rentals)",

		amenities: ["Meeting Rooms", "Kitchen", "Stage", "Parking", "Accessible"],
	},
	{
		id: 6,
		name: "Harmony Elementary School",
		slug: "harmony-elementary",
		category: "Education",
		description:
			"Part of the Iredell-Statesville Schools district, Harmony Elementary serves the children of the Harmony community. The school has been a cornerstone of education in the area for generations.",
		image: mediaUrls["poi-school"],
		address: "Harmony, NC 28634",
		hours: "School hours: 7:30 AM - 2:30 PM",
		amenities: ["Playground", "Athletic Fields", "Library", "Parking"],
	},
	{
		id: 7,
		name: "Carolina Thread Trail",
		slug: "carolina-thread-trail",
		category: "Parks",
		description:
			"Part of a regional network of greenways and trails linking fifteen counties in North Carolina and South Carolina. The trail provides scenic walking and hiking opportunities through the Harmony countryside.",
		image: mediaUrls["poi-thread-trail"],
		address: "Harmony, NC 28634",
		hours: "Dawn to Dusk",
		amenities: ["Walking Trail", "Nature Views", "Trail Markers"],
	},
];
