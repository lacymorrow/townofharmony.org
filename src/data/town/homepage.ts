import { mediaUrls } from "./media";
import type { TownHomepage } from "./types";

export const homepage: TownHomepage = {
	heroSlides: [
		{
			title: "Welcome to the Town of Harmony",
			subtitle: "Where Harmony LIVES and SINGS!",
			description:
				"Established in 1927, our charming town in Iredell County, North Carolina continues to be a beacon of community spirit and southern hospitality.",
			image: mediaUrls["hero-welcome"],
			ctaText: "Discover Our History",
			ctaHref: "/history",
		},
		{
			title: "Community Events & Activities",
			subtitle: "Join Us for Year-Round Celebrations",
			description:
				"From seasonal festivals to community gatherings, experience the vibrant spirit that makes Harmony special.",
			image: "",
			ctaText: "View Upcoming Events",
			ctaHref: "/events",
		},
		{
			title: "Town Meetings & Services",
			subtitle: "Your Voice Matters",
			description:
				"Stay informed with town meetings, access public records, and connect with your local government.",
			image: "",
			ctaText: "Meeting Agendas & Minutes",
			ctaHref: "/meetings",
		},
		{
			title: "Points of Interest",
			subtitle: "Explore Our Heritage",
			description:
				"Discover the landmarks and locations that tell the story of Harmony's rich history and bright future.",
			image: mediaUrls["hero-explore"],
			ctaText: "Explore Harmony",
			ctaHref: "/points-of-interest",
		},
	],
	spotlightCards: [
		{
			title: "Support Local Business",
			subtitle: "Shop Local, Support Harmony",
			description:
				"Our local businesses are the heart of our community. Find restaurants, shops, and services in our business directory.",
			gradient: "from-blue-500 to-blue-600",
			ctaText: "Browse Directory",
			ctaHref: "/business",
		},
		{
			title: "Rich History",
			subtitle: "Nearly 200 Years of Heritage",
			description:
				"Learn about Harmony's fascinating history, from our founding days to becoming the vibrant community we are today.",
			gradient: "from-amber-500 to-orange-600",
			ctaText: "Explore Our History",
			ctaHref: "/history",
		},
		{
			title: "Get Involved",
			subtitle: "Volunteer Opportunities",
			description:
				"Join committees, volunteer for events, or participate in community projects. Your involvement makes Harmony stronger.",
			gradient: "from-green-500 to-teal-600",
			ctaText: "Learn More",
			ctaHref: "/community/volunteer",
		},
	],
	stats: [
		{
			value: "543",
			label: "Population (2020)",
		},
		{
			value: "1927",
			label: "Established",
		},
	],
};
