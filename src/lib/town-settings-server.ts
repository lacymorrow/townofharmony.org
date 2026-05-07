import { unstable_cache } from "next/cache";
import {
	type BuilderSettingsFlat,
	settings as staticSettings,
	toTownSettings,
} from "@/data/town/settings";
import type { TownSettings } from "@/data/town/types";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const BUILDER_CDN_BASE = "https://cdn.builder.io/api/v3/content";

async function _fetchBuilderSettings(): Promise<TownSettings> {
	if (!BUILDER_API_KEY) {
		return staticSettings;
	}

	try {
		const url = new URL(`${BUILDER_CDN_BASE}/town-settings`);
		url.searchParams.set("apiKey", BUILDER_API_KEY);
		url.searchParams.set("limit", "1");

		const res = await fetch(url.toString(), { next: { revalidate: 0 } });
		if (!res.ok) {
			return staticSettings;
		}

		const json = (await res.json()) as {
			results?: Array<{ data?: BuilderSettingsFlat }>;
		};
		const flat = json.results?.[0]?.data;
		if (!flat) {
			return staticSettings;
		}

		return toTownSettings(flat);
	} catch {
		return staticSettings;
	}
}

export const getBuilderSettings = unstable_cache(
	_fetchBuilderSettings,
	["town-settings"],
	{ revalidate: 3600, tags: ["town-settings"] },
);
