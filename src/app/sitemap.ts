import type { MetadataRoute } from "next";
import { buildTimeFeatures } from "@/config/features-config";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";
import { isSewerPaymentEnabled, isSewerVisible } from "@/data/town/sewer-rates";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = siteConfig.url;

	const townRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${baseUrl}${routes.town.meetings}`,
			lastModified: new Date(),
			changeFrequency: "weekly",
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
		{
			url: `${baseUrl}${routes.town.ourTeam}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		...(buildTimeFeatures.BUSINESS_ENABLED
			? [
					{
						url: `${baseUrl}${routes.town.business}`,
						lastModified: new Date(),
						changeFrequency: "monthly" as const,
						priority: 0.7,
					},
				]
			: []),
		{
			url: `${baseUrl}${routes.town.pointsOfInterest}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.4,
		},
		{
			url: `${baseUrl}${routes.accessibility}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.4,
		},
	];

	if (buildTimeFeatures.EVENTS_ENABLED) {
		townRoutes.push({
			url: `${baseUrl}${routes.town.events}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		});
	}

	if (buildTimeFeatures.ALERTS_ENABLED) {
		townRoutes.push({
			url: `${baseUrl}${routes.town.emergency}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.9,
		});
	}

	if (buildTimeFeatures.NEWS_ENABLED) {
		townRoutes.push({
			url: `${baseUrl}${routes.town.news}`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		});
	}

	if (buildTimeFeatures.MAP_ENABLED) {
		townRoutes.push({
			url: `${baseUrl}${routes.town.map}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		});
	}

	if (isSewerVisible()) {
		townRoutes.push({
			url: `${baseUrl}${routes.town.sewer}`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		});
	}

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
