import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";
import { isSewerPaymentEnabled, isSewerVisible } from "@/data/town/sewer-rates";

/**
 * Town of Harmony sitemap
 *
 * Includes all public town routes. Dynamic pages (events, meetings, history)
 * are served via Builder.io catch-all and not enumerated here — Builder.io
 * pages should be added to the sitemap via the CMS or a future API-driven
 * approach once content is indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = siteConfig.url;

	// Core town pages — highest priority
	const townRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${baseUrl}${routes.town.events}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}${routes.town.meetings}`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}${routes.town.emergency}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}${routes.contact}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}${routes.town.history}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}${routes.town.resources}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		...(isSewerVisible()
			? [
					{
						url: `${baseUrl}${routes.town.sewer}`,
						lastModified: new Date(),
						changeFrequency: "monthly" as const,
						priority: 0.8,
					},
				]
			: []),
		{
			url: `${baseUrl}${routes.town.ourTeam}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}${routes.town.agendaMinutes}`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}${routes.town.business}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}${routes.town.map}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${baseUrl}${routes.town.pointsOfInterest}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
	];

	if (isSewerPaymentEnabled()) {
		townRoutes.push({
			url: `${baseUrl}${routes.town.sewerPayment}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		});
	}

	return townRoutes;
}
