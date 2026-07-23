import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveMap } from "./interactive-map";
import { isFeatureEnabled } from "@/lib/preview-flags";
import { siteConfig } from "@/config/site-config";
import { getMapBusinesses } from "@/lib/town-data";
import { getBuilderSettings } from "@/lib/town-settings-server";

export const metadata: Metadata = {
	title: "Interactive Town Map | Town of Harmony, NC",
	description:
		"Explore businesses, services, and points of interest in Harmony, NC with our interactive map. Find locations across the Town of Harmony, North Carolina.",
	alternates: {
		canonical: `${siteConfig.url}/map`,
	},
	openGraph: {
		title: "Interactive Map — Town of Harmony, NC",
		description:
			"Explore businesses, services, and points of interest in Harmony, NC with our interactive map. Find locations across the Town of Harmony, North Carolina.",
		url: `${siteConfig.url}/map`,
	},
};

export default async function MapPage() {
	if (!await isFeatureEnabled("map")) {
		notFound();
	}
	const [businesses, settings] = await Promise.all([
		getMapBusinesses(),
		getBuilderSettings(),
	]);
	return <InteractiveMap businesses={businesses} labels={settings.map} />;
}
