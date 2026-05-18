import { cookies } from "next/headers";
import { buildTimeFeatures } from "@/config/features-config";

const PREVIEW_COOKIE = "_toh_preview";

// Maps flag short name → { buildTimeFeatures key, hrefs it controls }
const FLAGS = {
	map: { featureKey: "MAP_ENABLED" as const, hrefs: ["/map"] },
	events: { featureKey: "EVENTS_ENABLED" as const, hrefs: ["/events"] },
	news: { featureKey: "NEWS_ENABLED" as const, hrefs: ["/news"] },
	alerts: { featureKey: "ALERTS_ENABLED" as const, hrefs: ["/emergency"] },
	sewer: { featureKey: "SEWER_ENABLED" as const, hrefs: ["/sewer", "/pay/sewer"] },
	business: { featureKey: "BUSINESS_ENABLED" as const, hrefs: ["/business"] },
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
	return buildTimeFeatures[FLAGS[name].featureKey] ?? false;
}

export async function getHiddenHrefs(): Promise<Set<string>> {
	const overrides = await getOverrides();
	const hidden: string[] = [];
	for (const [name, { featureKey, hrefs }] of Object.entries(FLAGS) as [FeatureFlagName, (typeof FLAGS)[FeatureFlagName]][]) {
		const enabled = name in overrides
			? (overrides[name] as boolean)
			: buildTimeFeatures[featureKey] ?? false;
		if (!enabled) hidden.push(...hrefs);
	}
	return new Set(hidden);
}

export { PREVIEW_COOKIE, FLAGS };
