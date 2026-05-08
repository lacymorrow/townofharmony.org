import { cookies } from "next/headers";

const PREVIEW_COOKIE = "_toh_preview";

// Maps flag short name → { env var that enables it, hrefs it controls }
const FLAGS = {
	map: { envKey: "NEXT_PUBLIC_FEATURE_MAP_ENABLED", hrefs: ["/map"] },
	events: { envKey: "NEXT_PUBLIC_FEATURE_EVENTS_ENABLED", hrefs: ["/events"] },
	news: { envKey: "NEXT_PUBLIC_FEATURE_NEWS_ENABLED", hrefs: ["/news"] },
	alerts: { envKey: "NEXT_PUBLIC_FEATURE_ALERTS_ENABLED", hrefs: ["/emergency"] },
	sewer: { envKey: "NEXT_PUBLIC_FEATURE_SEWER_ENABLED", hrefs: ["/sewer", "/pay/sewer"] },
} as const;

export type FeatureFlagName = keyof typeof FLAGS;

async function getOverrides(): Promise<Partial<Record<FeatureFlagName, boolean>>> {
	const store = await cookies();
	const raw = store.get(PREVIEW_COOKIE)?.value;
	if (!raw) return {};
	try {
		return JSON.parse(raw) as Partial<Record<FeatureFlagName, boolean>>;
	} catch {
		return {};
	}
}

export async function isFeatureEnabled(name: FeatureFlagName): Promise<boolean> {
	const overrides = await getOverrides();
	if (name in overrides) return overrides[name] as boolean;
	return process.env[FLAGS[name].envKey] === "true";
}

export async function getHiddenHrefs(): Promise<Set<string>> {
	const overrides = await getOverrides();
	const hidden: string[] = [];
	for (const [name, { envKey, hrefs }] of Object.entries(FLAGS) as [FeatureFlagName, (typeof FLAGS)[FeatureFlagName]][]) {
		const enabled = name in overrides
			? (overrides[name] as boolean)
			: process.env[envKey] === "true";
		if (!enabled) hidden.push(...hrefs);
	}
	return new Set(hidden);
}

export { PREVIEW_COOKIE, FLAGS };
