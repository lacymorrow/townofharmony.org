"use client";

import {
	Calendar,
	Clock,
	FileText,
	Globe,
	Home,
	Landmark,
	MapPin,
	Newspaper,
	Search,
	Star,
	Store,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { businesses } from "@/data/town/businesses";
import { events } from "@/data/town/events";
import { historyArticles } from "@/data/town/history";
import { navigation } from "@/data/town/navigation";
import { pointsOfInterest } from "@/data/town/points-of-interest";
import { resources } from "@/data/town/resources";
import { isSewerVisible } from "@/data/town/sewer-rates";
import { teamMembers } from "@/data/town/team-members";

const SEWER_HREFS = new Set(["/sewer", "/pay/sewer"]);

const RECENT_SEARCHES_KEY = "toh-recent-searches";
const MAX_RECENT = 5;

interface SearchResult {
	id: string;
	title: string;
	subtitle: string;
	href: string;
	openExternal?: boolean;
	category: string;
	icon: React.ReactNode;
}

const buildSearchIndex = (): SearchResult[] => {
	const results: SearchResult[] = [];
	const hideSewer = !isSewerVisible();

	// Navigation pages
	for (const item of navigation.mainNav) {
		if (hideSewer && SEWER_HREFS.has(item.href)) continue;
		results.push({
			id: `nav-${item.href}`,
			title: item.name,
			subtitle: "Page",
			href: item.href,
			category: "Pages",
			icon: <Home className="h-4 w-4" />,
		});
		if (item.children) {
			for (const child of item.children) {
				if (hideSewer && SEWER_HREFS.has(child.href)) continue;
				results.push({
					id: `nav-${child.href}`,
					title: child.name,
					subtitle: "Page",
					href: child.href,
					category: "Pages",
					icon: <Home className="h-4 w-4" />,
				});
			}
		}
	}

	// Quick links (dedupe with nav)
	const navHrefs = new Set(results.map((r) => r.href));
	for (const link of navigation.quickLinks) {
		if (hideSewer && SEWER_HREFS.has(link.href)) continue;
		if (!navHrefs.has(link.href)) {
			results.push({
				id: `quick-${link.href}`,
				title: link.title,
				subtitle: link.description,
				href: link.href,
				category: "Pages",
				icon: <Star className="h-4 w-4" />,
			});
		}
	}

	// Team members
	for (const member of teamMembers.filter((m) => m.isActive)) {
		results.push({
			id: `team-${member.id}`,
			title: member.name,
			subtitle: `${member.title} — ${member.category}`,
			href: "/our-team",
			category: "People",
			icon: <Users className="h-4 w-4" />,
		});
	}

	// Events
	for (const event of events) {
		results.push({
			id: `event-${event.id}`,
			title: event.title,
			subtitle: event.description.slice(0, 80),
			href: `/events/${event.slug}`,
			category: "Events",
			icon: <Calendar className="h-4 w-4" />,
		});
	}

	// History articles
	for (const article of historyArticles) {
		results.push({
			id: `history-${article.id}`,
			title: article.title,
			subtitle: article.era ? `${article.era} — ${article.description}` : article.description,
			href: `/history#${article.slug}`,
			category: "History",
			icon: <Clock className="h-4 w-4" />,
		});
	}

	// Resources
	for (const resource of resources) {
		const isDoc = resource.type === "document";
		results.push({
			id: `resource-${resource.id}`,
			title: resource.title,
			subtitle: resource.description.slice(0, 80),
			href: isDoc ? "/resources" : (resource.externalUrl ?? `/resources#${resource.slug}`),
			openExternal: !isDoc && !!resource.externalUrl?.startsWith("http"),
			category: "Resources",
			icon: <FileText className="h-4 w-4" />,
		});
	}

	// Points of interest
	for (const poi of pointsOfInterest) {
		results.push({
			id: `poi-${poi.id}`,
			title: poi.name,
			subtitle: `${poi.category} — ${poi.address}`,
			href: `/points-of-interest#${poi.slug}`,
			category: "Places",
			icon: <MapPin className="h-4 w-4" />,
		});
	}

	// Businesses
	for (const biz of businesses) {
		results.push({
			id: `biz-${biz.id}`,
			title: biz.name,
			subtitle: `${biz.category} — ${biz.address}`,
			href: "/business",
			category: "Businesses",
			icon: <Store className="h-4 w-4" />,
		});
	}

	return results;
};

// Builder.io CMS page fetching
const BUILDER_PAGES_CACHE_KEY = "toh-builder-pages";
const BUILDER_PAGES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface BuilderPageEntry {
	title: string;
	description: string;
	urlPath: string;
}

interface CachedBuilderPages {
	pages: BuilderPageEntry[];
	fetchedAt: number;
}

const fetchBuilderPages = async (apiKey: string): Promise<BuilderPageEntry[]> => {
	// Check cache first
	try {
		const cached = localStorage.getItem(BUILDER_PAGES_CACHE_KEY);
		if (cached) {
			const parsed: CachedBuilderPages = JSON.parse(cached);
			if (Date.now() - parsed.fetchedAt < BUILDER_PAGES_CACHE_TTL) {
				return parsed.pages;
			}
		}
	} catch {
		// ignore cache errors
	}

	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/page");
		url.searchParams.set("apiKey", apiKey);
		url.searchParams.set("limit", "100");
		url.searchParams.set("fields", "data.title,data.description,data.url");
		url.searchParams.set("noCache", "false");

		const res = await fetch(url.toString());
		if (!res.ok) return [];

		const data = await res.json();
		const pages: BuilderPageEntry[] = (data?.results ?? [])
			.filter((r: Record<string, unknown>) => r?.data)
			.map((r: { data: { title?: string; description?: string; url?: string } }) => ({
				title: r.data.title || "Untitled Page",
				description: r.data.description || "",
				urlPath: r.data.url || "/",
			}));

		// Cache results
		try {
			localStorage.setItem(
				BUILDER_PAGES_CACHE_KEY,
				JSON.stringify({ pages, fetchedAt: Date.now() } satisfies CachedBuilderPages),
			);
		} catch {
			// ignore storage errors
		}

		return pages;
	} catch {
		return [];
	}
};

const SUGGESTED_LINKS = [
	{ title: "Town Meetings", href: "/meetings", icon: <Landmark className="h-4 w-4" /> },
	{ title: "Events", href: "/events", icon: <Calendar className="h-4 w-4" /> },
	{ title: "Our Team", href: "/our-team", icon: <Users className="h-4 w-4" /> },
	{ title: "History", href: "/history", icon: <Clock className="h-4 w-4" /> },
	{ title: "Contact Us", href: "/contact", icon: <Newspaper className="h-4 w-4" /> },
	{ title: "Resources", href: "/resources", icon: <FileText className="h-4 w-4" /> },
];

interface RecentSearch {
	title: string;
	href: string;
	openExternal?: boolean;
}

const getRecentSearches = (): RecentSearch[] => {
	try {
		const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
};

const saveRecentSearch = (item: RecentSearch) => {
	try {
		const recent = getRecentSearches().filter((r) => r.href !== item.href);
		recent.unshift(item);
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
	} catch {
		// ignore storage errors
	}
};

interface TownSearchProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const TownSearch = ({ open, onOpenChange }: TownSearchProps) => {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
	const [builderPages, setBuilderPages] = useState<SearchResult[]>([]);
	const builderFetched = useRef(false);

	const staticIndex = useMemo(() => buildSearchIndex(), []);

	// Combine static + Builder.io results
	const searchIndex = useMemo(
		() => [...staticIndex, ...builderPages],
		[staticIndex, builderPages],
	);

	useEffect(() => {
		if (open) {
			setRecentSearches(getRecentSearches());
			setQuery("");
		}
	}, [open]);

	// Fetch Builder.io CMS pages on first open
	useEffect(() => {
		if (!open || builderFetched.current) return;
		builderFetched.current = true;

		const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
		if (!apiKey) return;

		// Collect existing static hrefs to deduplicate
		const staticHrefs = new Set(staticIndex.map((r) => r.href));

		fetchBuilderPages(apiKey).then((pages) => {
			const results: SearchResult[] = pages
				.filter((p) => !staticHrefs.has(p.urlPath))
				.map((p, i) => ({
					id: `builder-${i}`,
					title: p.title,
					subtitle: p.description || "CMS Page",
					href: p.urlPath,
					category: "Pages",
					icon: <Globe className="h-4 w-4" />,
				}));
			if (results.length > 0) {
				setBuilderPages(results);
			}
		});
	}, [open, staticIndex]);

	// Cmd+K / Ctrl+K
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				onOpenChange(!open);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onOpenChange]);

	const handleSelect = useCallback(
		(result: { title: string; href: string; openExternal?: boolean }) => {
			saveRecentSearch({ title: result.title, href: result.href, openExternal: result.openExternal });
			onOpenChange(false);
			if (result.openExternal) {
				window.open(result.href, "_blank", "noopener,noreferrer");
			} else {
				router.push(result.href);
			}
		},
		[router, onOpenChange],
	);

	const hasQuery = query.trim().length > 0;

	// Group results by category
	const groupedResults = useMemo(() => {
		if (!hasQuery) return {};
		const groups: Record<string, SearchResult[]> = {};
		for (const result of searchIndex) {
			const text = `${result.title} ${result.subtitle}`.toLowerCase();
			if (text.includes(query.toLowerCase())) {
				if (!groups[result.category]) {
					groups[result.category] = [];
				}
				groups[result.category].push(result);
			}
		}
		return groups;
	}, [query, hasQuery, searchIndex]);

	const categoryOrder = ["Pages", "People", "Events", "History", "Resources", "Places", "Businesses"];
	const sortedCategories = Object.keys(groupedResults).sort((a, b) => {
		const indexA = categoryOrder.indexOf(a);
		const indexB = categoryOrder.indexOf(b);
		return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
	});
	const totalResults = Object.values(groupedResults).reduce((sum, arr) => sum + arr.length, 0);

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<DialogTitle className="sr-only">Search Town of Harmony</DialogTitle>
			<CommandInput
				placeholder="Search pages, people, events..."
				value={query}
				onValueChange={setQuery}
			/>
			<CommandList className="max-h-[400px]">
				{hasQuery && totalResults === 0 && (
					<CommandEmpty>No results found for &ldquo;{query}&rdquo;</CommandEmpty>
				)}

				{/* Search results */}
				{sortedCategories.map((category) => (
					<CommandGroup key={category} heading={category}>
						{groupedResults[category].map((result) => (
							<CommandItem
								key={result.id}
								value={`${result.title} ${result.subtitle}`}
								onSelect={() => handleSelect(result)}
								className="gap-3"
							>
								<span className="text-sage-dark/60">{result.icon}</span>
								<div className="flex flex-col gap-0.5 overflow-hidden">
									<span className="truncate font-medium">{result.title}</span>
									<span className="truncate text-xs text-muted-foreground">
										{result.subtitle}
									</span>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				))}

				{/* Empty state: recent + suggestions */}
				{!hasQuery && (
					<>
						{recentSearches.length > 0 && (
							<CommandGroup heading="Recent">
								{recentSearches.map((item) => (
									<CommandItem
										key={item.href}
										value={item.title}
										onSelect={() => handleSelect(item)}
										className="gap-3"
									>
										<Search className="h-4 w-4 text-sage-dark/40" />
										<span>{item.title}</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
						{recentSearches.length > 0 && <CommandSeparator />}
						<CommandGroup heading="Quick Links">
							{SUGGESTED_LINKS.map((link) => (
								<CommandItem
									key={link.href}
									value={link.title}
									onSelect={() => handleSelect(link)}
									className="gap-3"
								>
									<span className="text-sage-dark/60">{link.icon}</span>
									<span>{link.title}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
			</CommandList>
			<div className="border-t border-[#DDD7CC] px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
				<span>
					<kbd className="rounded border border-[#DDD7CC] bg-stone px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>{" "}
					navigate
				</span>
				<span>
					<kbd className="rounded border border-[#DDD7CC] bg-stone px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>{" "}
					select
				</span>
				<span>
					<kbd className="rounded border border-[#DDD7CC] bg-stone px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>{" "}
					close
				</span>
			</div>
		</CommandDialog>
	);
};
