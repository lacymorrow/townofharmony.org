/**
 * Catch-all page for Builder.io visual CMS pages within the town layout.
 * Inherits TownHeader + EmergencyBanner + TownFooter from (town)/layout.tsx.
 *
 * A small set of paths still has hardcoded Next.js routes (homepage, sewer,
 * map, pay/sewer/*, accessibility, privacy, resource reservation pages) —
 * see EXPLICIT_ROUTES below. Everything else under (town) is served by
 * Builder.io content via this catch-all.
 *
 * generateStaticParams enumerates Builder.io paths at build time. With
 * dynamicParams = true, paths not in the list are rendered on-demand and
 * 404 if Builder has no matching content.
 */

import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import "@/styles/builder-io.css";
import { type BuilderContent } from "@builder.io/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Paths handled by explicit Next.js routes — these never reach this catch-all.
// Keep in sync with src/middleware.ts.
const EXPLICIT_ROUTES = new Set([
	"/",
	"/accessibility",
	"/map",
	"/pay/sewer",
	"/pay/sewer/cancel",
	"/pay/sewer/success",
	"/privacy",
	"/resources/community-center-reservation",
	"/resources/park-reservation",
	"/sewer",
]);

// Fallback used when the Builder.io API is unreachable at build time.
const STATIC_FALLBACK_PARAMS = [
	{ slug: ["agenda-minutes"] },
	{ slug: ["permits"] },
	{ slug: ["emergency", "alerts"] },
	{ slug: ["elections"] },
];

export const dynamicParams = true;

// ISR: regenerate known pages every hour so content edits appear without a full redeploy.
export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
	if (
		!env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED ||
		!env.NEXT_PUBLIC_BUILDER_API_KEY
	) {
		return STATIC_FALLBACK_PARAMS;
	}

	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/page");
		url.searchParams.set("apiKey", env.NEXT_PUBLIC_BUILDER_API_KEY);
		url.searchParams.set("limit", "100");
		url.searchParams.set("fields", "data.url");

		const res = await fetch(url.toString(), { cache: "no-store" });
		if (!res.ok) {
			return STATIC_FALLBACK_PARAMS;
		}

		const data = (await res.json()) as {
			results?: Array<{ data?: { url?: string } }>;
		};
		const results = data?.results ?? [];

		const params = results
			.map((page) => page.data?.url)
			.filter((pageUrl): pageUrl is string => typeof pageUrl === "string")
			// Exclude template definitions like /elections/:slug — actual instances
			// have concrete URLs (e.g. /elections/2024-board-election) and are included.
			.filter((pageUrl) => !pageUrl.includes(":"))
			.map((pageUrl) => pageUrl.toLowerCase().replace(/\/+$/, "") || "/")
			.filter((pageUrl) => !EXPLICIT_ROUTES.has(pageUrl))
			.map((pageUrl) => ({
				slug: pageUrl.replace(/^\//, "").split("/").filter(Boolean),
			}))
			// Exclude root path (handled by (town)/page.tsx)
			.filter((p) => p.slug.length > 0);

		return params.length > 0 ? params : STATIC_FALLBACK_PARAMS;
	} catch {
		return STATIC_FALLBACK_PARAMS;
	}
}

interface PageProps {
	params: Promise<{
		slug: string[];
	}>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getBuilderContent(
	slug: string[],
): Promise<BuilderContent | null> {
	if (
		!env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED ||
		!env.NEXT_PUBLIC_BUILDER_API_KEY
	) {
		return null;
	}

	const urlPath = `/${slug.join("/")}`;

	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/page");
		url.searchParams.set("apiKey", env.NEXT_PUBLIC_BUILDER_API_KEY);
		url.searchParams.set("userAttributes.urlPath", urlPath);
		url.searchParams.set("limit", "1");
		url.searchParams.set("noCache", "true");

		const res = await fetch(url.toString(), {
			next: { revalidate: 0 },
		});

		if (!res.ok) {
			return null;
		}

		const data = await res.json();
		const results = data?.results;
		if (!results || results.length === 0) {
			return null;
		}

		const page = results[0] as BuilderContent;

		// Guard against Builder.io returning wildcard-targeted pages for paths
		// that have no specific content. Template pages (data.url matches /:param)
		// use startsWith targeting and are exempt — we can't validate :slug segments
		// here. Regular pages must have data.url exactly matching the requested path
		// (after trailing-slash normalization). Pages with no data.url are also
		// rejected since they almost certainly came from over-broad targeting.
		const pageUrl = page.data?.url as string | undefined;
		const normalize = (u: string) => u.toLowerCase().replace(/\/+$/, "") || "/";
		const isTemplate = /\/:[^/]+/.test(pageUrl ?? "");
		if (!pageUrl || (!isTemplate && normalize(pageUrl) !== normalize(urlPath))) {
			return null;
		}

		return page;
	} catch {
		return null;
	}
}

export async function generateMetadata({
	params: paramsPromise,
	searchParams: searchParamsPromise,
}: PageProps): Promise<Metadata> {
	const [params, searchParams] = await Promise.all([paramsPromise, searchParamsPromise]);
	const isPreview = "builder.preview" in searchParams;
	const content = await getBuilderContent(params.slug);

	if (!content && !isPreview) {
		return notFound();
	}

	const slugPath = `/${params.slug.join("/")}`;
	const pageTitle = content?.data?.title ?? "Town of Harmony";
	const pageDescription =
		content?.data?.description ??
		`${pageTitle} - Town of Harmony, NC. Find local information, services, and community resources.`;

	return {
		title: pageTitle,
		description: pageDescription,
		alternates: {
			canonical: `${siteConfig.url}${slugPath}`,
		},
		openGraph: {
			title: pageTitle,
			description: pageDescription,
			url: `${siteConfig.url}${slugPath}`,
			...(content?.data?.ogImage && {
				images: [{ url: content.data.ogImage as string }],
			}),
			...(content?.data?.ogType && {
				type: content.data.ogType as "website" | "article" | "profile",
			}),
		},
	};
}

export default async function TownCatchAllPage({
	params: paramsPromise,
	searchParams: searchParamsPromise,
}: PageProps) {
	const [params, searchParams] = await Promise.all([paramsPromise, searchParamsPromise]);
	const isPreview = "builder.preview" in searchParams;
	const content = await getBuilderContent(params.slug);

	if (!content && !isPreview) {
		notFound();
	}

	return <RenderBuilderContent content={content} model="page" />;
}
