"use client";

import { InteractiveMap } from "@/app/(app)/(town)/map/interactive-map";

interface TownInteractiveMapProps {
	height?: string;
	minHeight?: string;
}

export const TownInteractiveMap = ({
	height = "calc(100vh - 200px)",
	minHeight = "500px",
}: TownInteractiveMapProps = {}) => {
	return (
		<div style={{ height, minHeight }}>
			<InteractiveMap />
		</div>
	);
};
