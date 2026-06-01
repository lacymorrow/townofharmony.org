"use client";

import {
	Calendar,
	Clock,
	FileText,
	Globe,
	Home,
	Landmark,
	Mail,
	MapPin,
	Search,
	Star,
	Store,
	Users,
	X,
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
import { historyArticles } from "@/data/town/history";
import { navigation } from "@/data/town/navigation";
import { pointsOfInterest } from "@/data/town/points-of-interest";
import { resources } from "@/data/town/resources";
import { isSewerVisible } from "@/data/town/sewer-rates";
import { teamMembers } from "@/data/town/team-members";
import { isExternalUrl, isSafeUrl } from "@/lib/utils";

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
			href: isDoc ? `/resources/${resource.slug}` : (resource.externalUrl ?? `/resources#${resource.slug}`),
			openExternal: !isDoc && !!resource.externalUrl && isExternalUrl(resource.externalUrl),
			category: "Resources",
			icon: <FileText className="h-4 w-4" />,
		});
	}

	// Points of interest
	for (const poi of pointsOfInterest) {
		const safeLink = poi.link && isSafeUrl(poi.link) ? poi.link : undefined;
		results.push({
			id: `poi-${poi.id}`,
			title: poi.name,
			subtitle: `${poi.category} — ${poi.address}`,
			href: safeLink || `/points-of-interest#${poi.slug}`,
			openExternal: !!safeLink && isExternalUrl(safeLink),
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

// Builder.io CMS content fetching
const BUILDER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
	data: unknown;
	fetchedAt: number;
}

function getCached<T>(key: string): T | null {
	try {
		const cached = localStorage.getItem(key);
		if (cached) {
			const parsed: CachedData = JSON.parse(cached);
			if (Date.now() - parsed.fetchedAt < BUILDER_CACHE_TTL) {
				return parsed.data as T;
			}
		}
	} catch {
		// ignore cache errors
	}
	return null;
}

function setCache(key: string, data: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() } satisfies CachedData));
	} catch {
		// ignore storage errors
	}
}

interface BuilderPageEntry {
	title: string;
	description: string;
	urlPath: string;
}

const fetchBuilderPages = async (apiKey: string): Promise<BuilderPageEntry[]> => {
	const cached = getCached<BuilderPageEntry[]>("toh-builder-pages");
	if (cached) return cached;

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

		setCache("toh-builder-pages", pages);
		return pages;
	} catch {
		return [];
	}
};

interface BuilderEventEntry {
	title: string;
	slug: string;
	description: string;
}

const fetchBuilderEvents = async (apiKey: string): Promise<BuilderEventEntry[]> => {
	const cached = getCached<BuilderEventEntry[]>("toh-builder-events");
	if (cached) return cached;

	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/town-event");
		url.searchParams.set("apiKey", apiKey);
		url.searchParams.set("limit", "100");
		url.searchParams.set("fields", "data.title,data.slug,data.description");
		url.searchParams.set("noCache", "false");

		const res = await fetch(url.toString());
		if (!res.ok) return [];

		const data = await res.json();
		const entries: BuilderEventEntry[] = (data?.results ?? [])
			.filter((r: Record<string, unknown>) => r?.data)
			.map((r: { data: { title?: string; slug?: string; description?: string } }) => ({
				title: r.data.title || "Untitled Event",
				slug: r.data.slug || "",
				description: (r.data.description || "").replace(/<[^>]*>/g, ""),
			}))
			.filter((e: BuilderEventEntry) => e.slug);

		setCache("toh-builder-events", entries);
		return entries;
	} catch {
		return [];
	}
};

const SUGGESTED_LINKS = [
	{ title: "Town Meetings", href: "/meetings", icon: <Landmark className="h-4 w-4" /> },
	{ title: "Events", href: "/events", icon: <Calendar className="h-4 w-4" /> },
	{ title: "Our Team", href: "/our-team", icon: <Users className="h-4 w-4" /> },
	{ title: "History", href: "/history", icon: <Clock className="h-4 w-4" /> },
	{ title: "Contact Us", href: "/contact", icon: <Mail className="h-4 w-4" /> },
	{ title: "Resources", href: "/resources", icon: <FileText className="h-4 w-4" /> },
];

const QUICK_LINK_HREFS = new Set(SUGGESTED_LINKS.map((l) => l.href));

interface RecentSearch {
	title: string;
	href: string;
	openExternal?: boolean;
}

const getRecentSearches = (): RecentSearch[] => {
	try {
		const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
		const parsed: unknown = stored ? JSON.parse(stored) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(r): r is RecentSearch =>
				!!r &&
				typeof r === "object" &&
				"href" in r &&
				typeof r.href === "string" &&
				"title" in r &&
				typeof r.title === "string" &&
				!QUICK_LINK_HREFS.has(r.href),
		);
	} catch {
		return [];
	}
};

const saveRecentSearch = (item: RecentSearch) => {
	if (QUICK_LINK_HREFS.has(item.href)) return;
	try {
		const recent = getRecentSearches().filter((r) => r.href !== item.href);
		recent.unshift(item);
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
	} catch {
		// ignore storage errors
	}
};

const removeRecentSearch = (href: string): RecentSearch[] => {
	const recent = getRecentSearches().filter((r) => r.href !== href);
	try {
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
	} catch {
		// ignore storage errors
	}
	return recent;
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

	// Fetch Builder.io CMS pages + events on first open
	useEffect(() => {
		if (!open || builderFetched.current) return;
		builderFetched.current = true;

		const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
		if (!apiKey) return;

		const staticHrefs = new Set(staticIndex.map((r) => r.href));

		Promise.all([fetchBuilderPages(apiKey), fetchBuilderEvents(apiKey)]).then(
			([pages, events]) => {
				const results: SearchResult[] = [];
				for (const [i, p] of pages.entries()) {
					if (!staticHrefs.has(p.urlPath)) {
						results.push({
							id: `builder-${i}`,
							title: p.title,
							subtitle: p.description || "CMS Page",
							href: p.urlPath,
							category: "Pages",
							icon: <Globe className="h-4 w-4" />,
						});
					}
				}
				for (const event of events) {
					const href = `/events/${event.slug}`;
					if (!staticHrefs.has(href)) {
						results.push({
							id: `event-${event.slug}`,
							title: event.title,
							subtitle: event.description.slice(0, 80),
							href,
							category: "Events",
							icon: <Calendar className="h-4 w-4" />,
						});
					}
				}
				if (results.length > 0) {
					setBuilderPages(results);
				}
			},
		);
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
				const bucket = groups[result.category] ?? [];
				bucket.push(result);
				groups[result.category] = bucket;
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
						{(groupedResults[category] ?? []).map((result) => (
							<CommandItem
								key={result.id}
								value={`${result.title} ${result.subtitle}`}
								onSelect={() => handleSelect(result)}
								className="gap-3"
							>
								<span className="text-sage-dark/60" aria-hidden="true">{result.icon}</span>
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
										<Search className="h-4 w-4 text-sage-dark/40" aria-hidden="true" />
										<span className="flex-1 truncate">{item.title}</span>
										<button
											type="button"
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setRecentSearches(removeRecentSearch(item.href));
											}}
											className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-sage-dark/40 opacity-60 hover:bg-sage-dark/10 hover:text-sage-dark hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-sage-dark/40"
										>
											<span className="sr-only">Remove {item.title} from recent searches</span>
											<X className="h-3.5 w-3.5" aria-hidden="true" />
										</button>
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
									<span className="text-sage-dark/60" aria-hidden="true">{link.icon}</span>
									<span>{link.title}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
			</CommandList>
			<div className="border-t border-[#DDD7CC] px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
				<span>
					<kbd className="rounded border border-[#DDD7CC] bg-stone px-1.5 py-0.5 font-mono text-xs">↑↓</kbd>{" "}
					navigate
				</span>
				<span>
					<kbd className="rounded border border-[#DDD7CC] bg-stone px-1.5 py-0.5 font-mono text-xs">↵</kbd>{" "}
					select
				</span>
				<span>
					<kbd className="rounded border border-[#DDD7CC] bg-stone px-1.5 py-0.5 font-mono text-xs">esc</kbd>{" "}
					close
				</span>
			</div>
		</CommandDialog>
	);
};
