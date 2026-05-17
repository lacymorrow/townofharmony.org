import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveMap } from "./interactive-map";
import { isFeatureEnabled } from "@/lib/preview-flags";
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
	title: "Interactive Town Map",
	alternates: { canonical: `${siteConfig.url}/map` },
	description:
		"Explore businesses, services, and points of interest in Harmony, NC with our interactive map. Find locations across the Town of Harmony, North Carolina.",
};

export default async function MapPage() {
	if (!await isFeatureEnabled("map")) {
		notFound();
	}
	return <InteractiveMap />;
}
