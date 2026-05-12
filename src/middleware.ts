import { NextResponse, type NextRequest } from "next/server";

// Explicit routes handled by dedicated Next.js pages — always allow through.
const EXPLICIT_ROUTES = new Set([
	"/",
	"/accessibility",
	"/business",
	"/contact",
	"/emergency",
	"/events",
	"/history",
	"/map",
	"/meetings",
	"/news",
	"/our-team",
	"/pay/sewer",
	"/pay/sewer/cancel",
	"/pay/sewer/success",
	"/points-of-interest",
	"/privacy",
	"/resources",
	"/resources/community-center-reservation",
	"/resources/park-reservation",
	"/sewer",
]);

// Path prefixes that are NOT the town catch-all — bypass the Builder.io check.
const BYPASS_PREFIXES = [
	"/api/",
	"/_next/",
	"/builder.io/",
	"/blog/",
	"/changelog/",
	"/cms",
	"/cms-api/",
	"/connect/",
	"/settings/",
	"/download/",
	"/dev/",
	"/og/",
	"/opengraph-image",
	"/twitter-image",
	"/pages/",
	"/pay/",
	"/events/",
	"/meetings/",
	"/resources/",
];

/**
 * Returns true for paths that could reach the (town)/[...slug] catch-all and
 * therefore need a Builder.io content check before rendering starts.
 */
function isTownCatchAllCandidate(pathname: string): boolean {
	// Skip paths with file extensions (static assets)
	if (/\.\w{1,6}$/.test(pathname)) return false;
	// Skip known non-town prefixes
	if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) return false;
	// Skip explicit town routes
	if (EXPLICIT_ROUTES.has(pathname)) return false;
	return true;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const { pathname } = request.nextUrl;

	if (!isTownCatchAllCandidate(pathname)) {
		return NextResponse.next();
	}

	const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
	const builderEnabled = process.env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED;

	// If Builder.io is not configured, fail open to avoid breaking the site.
	if (!apiKey || !builderEnabled || builderEnabled === "false") {
		return NextResponse.next();
	}

	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/page");
		url.searchParams.set("apiKey", apiKey);
		url.searchParams.set("userAttributes.urlPath", pathname);
		url.searchParams.set("limit", "1");
		url.searchParams.set("fields", "data.url");

		const res = await fetch(url.toString(), {
			// Cache at the edge for 1 hour so repeated bot probes don't spam the API.
			next: { revalidate: 3600 },
		});

		if (res.ok) {
			const data = (await res.json()) as {
				results?: Array<{ data?: { url?: string } }>;
			};
			if (data?.results && data.results.length > 0) {
				return NextResponse.next();
			}
		}
	} catch {
		// Fail open on network errors — let the page render and call notFound().
		return NextResponse.next();
	}

	// No Builder.io content found for this path — return proper HTTP 404.
	// Rewrite to /_not-found which Next.js serves with HTTP 404 status natively.
	const notFoundUrl = request.nextUrl.clone();
	notFoundUrl.pathname = "/_not-found";
	return NextResponse.rewrite(notFoundUrl);
}

export const config = {
	matcher: [
		// Run on all paths except Next.js static assets and images.
		"/((?!_next/static|_next/image|favicon\\.ico|apple-icon|icon|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|rss\\.xml|humans\\.txt).*)",
	],
};
