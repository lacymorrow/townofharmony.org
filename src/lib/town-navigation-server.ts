import { unstable_cache } from "next/cache";
import {
	type BuilderNavigationFlat,
	navigation as staticNavigation,
	toTownNavigation,
} from "@/data/town/navigation";
import type { TownNavigation } from "@/data/town/types";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const BUILDER_CDN_BASE = "https://cdn.builder.io/api/v3/content";

async function _fetchBuilderNavigation(): Promise<TownNavigation> {
	if (!BUILDER_API_KEY) {
		return staticNavigation;
	}

	try {
		const url = new URL(`${BUILDER_CDN_BASE}/town-navigation`);
		url.searchParams.set("apiKey", BUILDER_API_KEY);
		url.searchParams.set("limit", "1");

		const res = await fetch(url.toString(), { next: { revalidate: 0 } });
		if (!res.ok) {
			return staticNavigation;
		}

		const json = (await res.json()) as {
			results?: Array<{ data?: BuilderNavigationFlat }>;
		};
		const flat = json.results?.[0]?.data;
		if (!flat) {
			return staticNavigation;
		}

		return toTownNavigation(flat);
	} catch {
		return staticNavigation;
	}
}

export const getBuilderNavigation = unstable_cache(
	_fetchBuilderNavigation,
	["town-navigation"],
	{ revalidate: 3600, tags: ["town-navigation"] },
);
