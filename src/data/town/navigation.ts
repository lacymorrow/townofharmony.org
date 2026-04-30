import type { TownNavigation } from "./types";

export const navigation: TownNavigation = {
	mainNav: [
		{
			name: "Home",
			href: "/",
		},
		{
			name: "Agenda & Minutes",
			href: "/meetings",
			children: [
				{ name: "Town Meetings", href: "/meetings" },
				{ name: "Agendas & Minutes", href: "/agenda-minutes" },
			],
		},
		{
			name: "Explore",
			href: "/explore",
			children: [
				{ name: "Interactive Map", href: "/map" },
				{ name: "Points of Interest", href: "/points-of-interest" },
				{ name: "Events", href: "/events" },
				{ name: "News", href: "/news" },
			],
		},
		{
			name: "Town",
			href: "/town",
			children: [
				{ name: "Our Team", href: "/our-team" },
				{ name: "History", href: "/history" },
				{ name: "Resources", href: "/resources" },
				{ name: "Sewer Services", href: "/sewer" },
			],
		},
		{
			name: "Contact",
			href: "/contact",
		},
	],
	topBarLinks: [
		{
			name: "Events",
			href: "/events",
			icon: "Calendar",
		},
	],
	quickLinks: [
		{
			title: "Events",
			description: "Community events and activities",
			href: "/events",
			icon: "Calendar",
			color: "bg-purple-500",
		},
		{
			title: "Report an Issue",
			description: "Report problems or concerns",
			href: "/contact",
			icon: "AlertCircle",
			color: "bg-red-500",
		},
		{
			title: "Board of Aldermen",
			description: "Meeting schedules and agendas",
			href: "/meetings",
			icon: "Users",
			color: "bg-indigo-500",
		},
		{
			title: "Interactive Map",
			description: "Explore Harmony on the map",
			href: "/map",
			icon: "Map",
			color: "bg-sage",
		},
		{
			title: "Business Directory",
			description: "Find local businesses",
			href: "/business",
			icon: "Briefcase",
			color: "bg-orange-500",
		},
		{
			title: "Resident Resources",
			description: "Information for residents",
			href: "/resources",
			icon: "Home",
			color: "bg-teal-500",
		},
		{
			title: "Contact Us",
			description: "Get in touch with town offices",
			href: "/contact",
			icon: "Phone",
			color: "bg-pink-500",
		},
	],
	footerLinks: [
		{
			category: "Agenda & Minutes",
			links: [
				{ name: "Town Meetings", href: "/meetings" },
				{ name: "Agendas & Minutes", href: "/agenda-minutes" },
			],
		},
		{
			category: "Explore",
			links: [
				{ name: "Interactive Map", href: "/map" },
				{ name: "Points of Interest", href: "/points-of-interest" },
				{ name: "Events", href: "/events" },
				{ name: "News", href: "/news" },
				{ name: "Business Directory", href: "/business" },
			],
		},
		{
			category: "Town",
			links: [
				{ name: "Our Team", href: "/our-team" },
				{ name: "History", href: "/history" },
				{ name: "Resources", href: "/resources" },
				{ name: "Emergency Services", href: "/emergency" },
				{ name: "Sewer Services", href: "/sewer" },
				{ name: "Contact Us", href: "/contact" },
			],
		},
	],
};
