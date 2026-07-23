"use client";

import { InteractiveMap } from "@/app/(app)/(town)/map/interactive-map";
import { useBuilderData } from "@/lib/builder-data";
import { mapBusinesses as fallbackMapBusinesses } from "@/data/town/map-businesses";
import { settings as staticSettings } from "@/data/town/settings";
import type { MapBusiness } from "@/lib/map-utils";

interface TownInteractiveMapProps {
	height?: string;
	minHeight?: string;
}

export const TownInteractiveMap = ({
	height = "calc(100vh - 200px)",
	minHeight = "500px",
}: TownInteractiveMapProps = {}) => {
	const { data: businesses } = useBuilderData<MapBusiness>("town-map-business", {
		fallback: fallbackMapBusinesses,
		limit: 1000,
	});

	return (
		<div style={{ height, minHeight }}>
			<InteractiveMap businesses={businesses} labels={staticSettings.map} />
		</div>
	);
};
