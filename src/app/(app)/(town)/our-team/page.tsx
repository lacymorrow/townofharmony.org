import type { Metadata } from "next";
import Image from "next/image";
import { type BuilderContent } from "@builder.io/sdk";
import { teamMembers } from "@/data/town/team-members";
import { env } from "@/env";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import "@/styles/builder-io.css";

export const metadata: Metadata = {
	title: "Our Team | Town of Harmony",
	description:
		"Meet the elected officials and staff of the Town of Harmony, North Carolina.",
};

const CATEGORIES = ["Executive", "Board of Aldermen", "Staff"] as const;

async function getBuilderOurTeamPage(): Promise<BuilderContent | null> {
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

interface OurTeamPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OurTeamPage({ searchParams }: OurTeamPageProps) {
	const sp = await searchParams;
	const isPreview = "builder.preview" in sp;
	const content = await getBuilderOurTeamPage();

	if (content || isPreview) {
		return <RenderBuilderContent content={content ?? undefined} model="page" />;
	}

	const active = teamMembers
		.filter((m) => m.isActive)
		.sort((a, b) => a.sortOrder - b.sortOrder);

	const getInitials = (name: string) =>
		name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				<header className="mb-10">
					<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
						Our Team
					</h1>
					<p className="text-[#4A4640] mt-2 max-w-2xl">
						Elected officials and staff serving the Town of Harmony.
					</p>
				</header>

				{CATEGORIES.map((category) => {
					const members = active.filter((m) => m.category === category);
					if (members.length === 0) return null;
					return (
						<div key={category} className="mb-12 last:mb-0">
							<h2 className="text-2xl font-bold text-[#2D2A24] mb-6 pb-2 border-b border-stone">
								{category}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{members.map((member) => (
									<div
										key={member.id}
										className="bg-white rounded-lg border border-stone p-5"
									>
										<div className="flex items-start gap-4 mb-3">
											{member.image ? (
												<Image
													src={member.image}
													alt={member.name}
													width={56}
													height={56}
													className="w-14 h-14 rounded-full object-cover"
												/>
											) : (
												<div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center font-semibold text-sage-dark">
													{getInitials(member.name)}
												</div>
											)}
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-[#2D2A24]">
													{member.name}
												</h3>
												<p className="text-base text-[#4A4640]">{member.title}</p>
											</div>
										</div>
										{member.phone && (
											<p className="text-base">
												<a
													href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
													className="text-[#4A4640] hover:text-sage-dark"
												>
													{member.phone}
												</a>
											</p>
										)}
										{member.mayorSince && (
											<p className="text-sm text-[#635E56] pt-1">
												Mayor since: {member.mayorSince}
											</p>
										)}
										{member.termExpires && (
											<p className="text-sm text-[#635E56] pt-1">
												Term: {member.termExpires}
											</p>
										)}
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
