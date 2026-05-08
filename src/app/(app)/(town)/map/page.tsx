import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveMap } from "./interactive-map";
import { isFeatureEnabled } from "@/lib/preview-flags";

export const metadata: Metadata = {
	title: "Interactive Map | Town of Harmony, NC",
	description:
		"Explore businesses, services, and points of interest in Harmony, NC with our interactive town map.",
};

export default async function MapPage() {
	if (!await isFeatureEnabled("map")) {
		notFound();
	}
	return <InteractiveMap />;
}
