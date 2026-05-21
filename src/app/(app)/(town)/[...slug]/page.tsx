/**
 * Catch-all page for Builder.io visual CMS pages within the town layout.
 * Inherits TownHeader + EmergencyBanner + TownFooter from (town)/layout.tsx.
 *
 * A small set of paths still has hardcoded Next.js routes (homepage, sewer,
 * map, pay/sewer/*, accessibility, privacy, resource reservation pages) —
 * these are excluded from generateStaticParams via EXPLICIT_ROUTES so Builder
 * doesn't accidentally shadow them. Everything else under (town) is served by
 * Builder.io content via this catch-all; unknown paths get noindex metadata
 * from generateMetadata and then notFound() in the page component.
 */

import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { getBuilderPageContent } from "@/lib/builder-data-server";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import "@/styles/builder-io.css";
import { type BuilderContent } from "@builder.io/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Paths handled by explicit Next.js routes — excluded from generateStaticParams
// so Builder.io doesn't shadow them.
const EXPLICIT_ROUTES = new Set([
	"/",
	"/about",
	"/accessibility",
	"/business",
	"/events",
	"/map",
	"/our-team",
	"/pay/sewer",
	"/pay/sewer/cancel",
	"/pay/sewer/success",
	"/privacy",
	"/resources/community-center-reservation",
	"/resources/park-reservation",
	"/contact",
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
	return getBuilderPageContent(urlPath) as Promise<BuilderContent | null>;
}

export async function generateMetadata({
	params: paramsPromise,
	searchParams: searchParamsPromise,
}: PageProps): Promise<Metadata> {
	const [params, searchParams] = await Promise.all([paramsPromise, searchParamsPromise]);
	const isPreview = "builder.preview" in searchParams;
	const content = await getBuilderContent(params.slug);

	// Return noindex with no canonical so Google drops these from the index.
	// Calling notFound() here causes Next.js to fall back to the root layout
	// metadata (homepage canonical + index:follow), which creates duplicate-
	// canonical and soft-404 GSC issues.
	if (!content && !isPreview) {
		return {
			title: "Page Not Found — Town of Harmony, NC",
			robots: { index: false, follow: false },
		};
	}

	const slugPath = `/${params.slug.join("/")}`;
	const lastSegment = params.slug[params.slug.length - 1] ?? "";
	const slugTitle = lastSegment
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
	const pageTitle = content?.data?.title ?? `${slugTitle} — Town of Harmony, NC`;
	const pageDescription =
		content?.data?.description ??
		`${pageTitle} — Town of Harmony, NC. Find local government information, services, and community resources in Harmony, North Carolina.`;

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

	return <RenderBuilderContent content={content ?? undefined} model="page" />;
}
