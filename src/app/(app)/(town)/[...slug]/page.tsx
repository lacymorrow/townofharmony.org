/**
 * Catch-all page for Builder.io visual CMS pages within the town layout.
 * Inherits TownHeader + EmergencyBanner + TownFooter from (town)/layout.tsx.
 *
 * Explicit static routes (e.g. /our-team, /events, /meetings) take precedence
 * over this catch-all and render from verified static data.
 */

import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import "@/styles/builder-io.css";
import { type BuilderContent } from "@builder.io/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
	params: Promise<{
		slug: string[];
	}>;
}

const shouldSkip = (slugString: string) => {
	return (
		slugString.startsWith("api/") ||
		slugString.includes(".") ||
		slugString.startsWith("_next/") ||
		slugString.startsWith("static/")
	);
};

async function getBuilderContent(
	slug: string[],
): Promise<BuilderContent | null> {
	if (!env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED || !env.NEXT_PUBLIC_BUILDER_API_KEY) {
		return null;
	}

	const slugString = slug.join("/");
	if (shouldSkip(slugString)) {
		return null;
	}

	const urlPath = `/${slugString}`;

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
		// that have no specific content. Template pages (data.url contains ":") use
		// startsWith targeting and are exempt — their URL matching is handled by
		// Builder.io's targeting rules. Regular pages must match exactly.
		const pageUrl = page.data?.url as string | undefined;
		if (pageUrl && !pageUrl.includes(":") && pageUrl !== urlPath) {
			return null;
		}

		return page;
	} catch {
		return null;
	}
}

export async function generateMetadata({
	params: paramsPromise,
}: PageProps): Promise<Metadata> {
	const params = await paramsPromise;
	const content = await getBuilderContent(params.slug);

	if (!content) {
		return notFound();
	}

	const slugPath = `/${params.slug.join("/")}`;
	const pageTitle = content.data?.title ?? "Town of Harmony";
	const pageDescription =
		content.data?.description ??
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
			...(content.data?.ogImage && {
				images: [{ url: content.data.ogImage as string }],
			}),
			...(content.data?.ogType && {
				type: content.data.ogType as
					| "website"
					| "article"
					| "profile",
			}),
		},
	};
}

export default async function TownCatchAllPage({
	params: paramsPromise,
}: PageProps) {
	const params = await paramsPromise;
	const content = await getBuilderContent(params.slug);

	if (!content) {
		notFound();
	}

	return <RenderBuilderContent content={content} model="page" />;
}
