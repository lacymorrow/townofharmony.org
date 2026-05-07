import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveMap } from "./interactive-map";
import { env } from "@/env";

export const metadata: Metadata = {
	title: "Interactive Map | Town of Harmony, NC",
	description:
		"Explore businesses, services, and points of interest in Harmony, NC with our interactive town map.",
};

export default function MapPage() {
	if (!env.NEXT_PUBLIC_FEATURE_MAP_ENABLED) {
		notFound();
	}
	return <InteractiveMap />;
}
