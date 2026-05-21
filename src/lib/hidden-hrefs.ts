/**
 * Client-side set of hrefs that should be hidden when their corresponding
 * feature flag is disabled.  Consumed by every component that renders
 * navigation links (header, footer, quick-links) so the mapping lives in
 * one place.
 */
export const BUILD_TIME_HIDDEN_HREFS = new Set<string>([
	...(process.env.NEXT_PUBLIC_FEATURE_SEWER_ENABLED !== "true" ? ["/sewer", "/pay/sewer"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_MAP_ENABLED !== "true" ? ["/map"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_EVENTS_ENABLED !== "true" ? ["/events"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_NEWS_ENABLED !== "true" ? ["/news"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_ALERTS_ENABLED !== "true" ? ["/emergency"] : []),
	...(process.env.NEXT_PUBLIC_FEATURE_BUSINESS_ENABLED !== "true" ? ["/business"] : []),
]);

export function isHrefHidden(href: string): boolean {
	const normalized = href.split("?")[0]?.replace(/\/$/, "") || "/";
	return BUILD_TIME_HIDDEN_HREFS.has(normalized);
}
