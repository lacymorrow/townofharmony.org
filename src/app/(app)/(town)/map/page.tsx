import type { Metadata } from "next";
import { InteractiveMap } from "./interactive-map";

export const metadata: Metadata = {
	title: "Interactive Map | Town of Harmony, NC",
	description:
		"Explore businesses, services, and points of interest in Harmony, NC with our interactive town map.",
};

export default function MapPage() {
	return <InteractiveMap />;
}
