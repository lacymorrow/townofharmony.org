import type { TownNavigation } from "./types";

/**
 * Flat shape returned by Builder.io for the `town-navigation` data model.
 * Lists are flat (no nested children) for editor usability — the transform
 * below re-nests mainNav children via `parentName`, and footer links via
 * `category`.
 */
export interface BuilderNavigationFlat {
	mainNav?: Array<{ name?: string; href?: string; parentName?: string }>;
	topBarLinks?: Array<{ name?: string; href?: string; icon?: string }>;
	quickLinks?: Array<{
		title?: string;
		description?: string;
		href?: string;
		icon?: string;
		color?: string;
	}>;
	footerLinks?: Array<{ category?: string; name?: string; href?: string }>;
}

/** Re-nest the flat Builder shape into the structured TownNavigation tree. */
export const toTownNavigation = (flat: BuilderNavigationFlat): TownNavigation => {
	const mainNav = (flat.mainNav ?? []).filter((i) => i.name && i.href);
	const parents = mainNav.filter((i) => !i.parentName);
	const childrenByParent = new Map<string, { name: string; href: string }[]>();
	for (const item of mainNav) {
		if (!item.parentName) continue;
		const list = childrenByParent.get(item.parentName) ?? [];
		list.push({ name: item.name!, href: item.href! });
		childrenByParent.set(item.parentName, list);
	}

	const mainNavNested = parents.map((p) => {
		const children = childrenByParent.get(p.name!);
		return children
			? { name: p.name!, href: p.href!, children }
			: { name: p.name!, href: p.href! };
	});

	const footerByCategory = new Map<string, { name: string; href: string }[]>();
	const footerOrder: string[] = [];
	for (const link of flat.footerLinks ?? []) {
		if (!link.category || !link.name || !link.href) continue;
		if (!footerByCategory.has(link.category)) {
			footerByCategory.set(link.category, []);
			footerOrder.push(link.category);
		}
		footerByCategory.get(link.category)!.push({ name: link.name, href: link.href });
	}

	const hasMainNav = mainNavNested.length > 0;
	const hasFooter = footerOrder.length > 0;
	const hasQuickLinks = (flat.quickLinks ?? []).some((l) => l.title && l.href);
	const hasTopBar = (flat.topBarLinks ?? []).some((l) => l.name && l.href);

	return {
		mainNav: hasMainNav ? mainNavNested : navigation.mainNav,
		topBarLinks: hasTopBar
			? (flat.topBarLinks ?? [])
					.filter((l) => l.name && l.href)
					.map((l) => ({ name: l.name!, href: l.href!, icon: l.icon ?? "" }))
			: navigation.topBarLinks,
		quickLinks: hasQuickLinks
			? (flat.quickLinks ?? [])
					.filter((l) => l.title && l.href)
					.map((l) => ({
						title: l.title!,
						description: l.description ?? "",
						href: l.href!,
						icon: l.icon ?? "",
						color: l.color ?? "bg-sage",
					}))
			: navigation.quickLinks,
		footerLinks: hasFooter
			? footerOrder.map((c) => ({ category: c, links: footerByCategory.get(c)! }))
			: navigation.footerLinks,
	};
};

export const navigation: TownNavigation = {
	mainNav: [
		{
			name: "Home",
			href: "/",
		},
		{
			name: "Explore",
			href: "/map",
			children: [
				{ name: "Interactive Map", href: "/map" },
				{ name: "Points of Interest", href: "/points-of-interest" },
				{ name: "Events", href: "/events" },
			],
		},
		{
			name: "Town",
			href: "/our-team",
			children: [
				{ name: "Our Team", href: "/our-team" },
				{ name: "Agendas & Minutes", href: "/meetings" },
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
			category: "Explore",
			links: [
				{ name: "Interactive Map", href: "/map" },
				{ name: "Points of Interest", href: "/points-of-interest" },
				{ name: "Events", href: "/events" },
				{ name: "Business Directory", href: "/business" },
			],
		},
		{
			category: "Town",
			links: [
				{ name: "Our Team", href: "/our-team" },
				{ name: "Agendas & Minutes", href: "/meetings" },
				{ name: "History", href: "/history" },
				{ name: "Resources", href: "/resources" },
				{ name: "Emergency Services", href: "/emergency" },
				{ name: "Sewer Services", href: "/sewer" },
				{ name: "Contact Us", href: "/contact" },
			],
		},
	],
};
