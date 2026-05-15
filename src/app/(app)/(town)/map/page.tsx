import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveMap } from "./interactive-map";
import { isFeatureEnabled } from "@/lib/preview-flags";

export const metadata: Metadata = {
	title: "Interactive Town Map",
	description:
		"Explore businesses, services, and points of interest in Harmony, NC with our interactive map. Find locations across the Town of Harmony, North Carolina.",
};

export default async function MapPage() {
	if (!await isFeatureEnabled("map")) {
		notFound();
	}
	return <InteractiveMap />;
}
