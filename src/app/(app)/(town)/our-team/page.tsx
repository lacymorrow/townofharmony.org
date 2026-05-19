import type { Metadata } from "next";
import { type BuilderContent } from "@builder.io/sdk";
import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { TownTeamMembers } from "@/components/modules/builder/town/town-team-members";
import "@/styles/builder-io.css";

export const metadata: Metadata = {
	title: "Our Team | Town of Harmony, NC",
	description:
		"Meet the elected officials and staff of the Town of Harmony, North Carolina. Learn about our Board of Aldermen and town administration.",
	alternates: {
		canonical: `${siteConfig.url}/our-team`,
	},
	openGraph: {
		title: "Our Team — Town of Harmony, NC",
		description:
			"Meet the elected officials and staff of the Town of Harmony, North Carolina. Learn about our Board of Aldermen and town administration.",
		url: `${siteConfig.url}/our-team`,
	},
};

export const revalidate = 3600;

interface OurTeamPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getBuilderContent(): Promise<BuilderContent | null> {
	if (!env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED || !env.NEXT_PUBLIC_BUILDER_API_KEY) {
		return null;
	}
	try {
		const url = new URL("https://cdn.builder.io/api/v3/content/page");
		url.searchParams.set("apiKey", env.NEXT_PUBLIC_BUILDER_API_KEY);
		url.searchParams.set("userAttributes.urlPath", "/our-team");
		url.searchParams.set("limit", "1");
		url.searchParams.set("noCache", "true");
		const res = await fetch(url.toString(), { next: { revalidate: 0 } });
		if (!res.ok) return null;
		const data = (await res.json()) as { results?: BuilderContent[] };
		const page = data?.results?.[0];
		if (!page) return null;
		const pageUrl = page.data?.url as string | undefined;
		if (pageUrl && pageUrl !== "/our-team") return null;
		return page;
	} catch {
		return null;
	}
}

export default async function OurTeamPage({ searchParams }: OurTeamPageProps) {
	const sp = await searchParams;
	const isPreview = "builder.preview" in sp;
	const content = await getBuilderContent();

	if (content || isPreview) {
		return <RenderBuilderContent content={content ?? undefined} model="page" />;
	}

	return (
		<main id="main-content">
			<div className="container mx-auto px-4 pt-10 pb-2">
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
					Our Team
				</h1>
				<p className="text-[#4A4640] mt-2 max-w-2xl">
					Elected officials and staff serving the Town of Harmony.
				</p>
			</div>
			<TownTeamMembers />
		</main>
	);
}
