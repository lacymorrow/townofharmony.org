"use client";

import { useBuilderData } from "@/lib/builder-data";
import { teamMembers as staticTeamMembers } from "@/data/town/team-members";
import type { TownTeamMember } from "@/data/town/types";

const CATEGORY_ORDER = [
	"Executive",
	"Town Council",
	"Staff",
] as const;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
	Executive:
		"Town leadership responsible for daily operations and civic governance.",
	"Town Council":
		"Elected officials serving the citizens of Harmony through policy and oversight.",
	Staff:
		"Dedicated professionals managing essential town services.",
};

interface TownTeamMembersProps {
	limit?: number;
	categoryFilter?: string;
}

export const TownTeamMembers = ({
	limit,
	categoryFilter,
}: TownTeamMembersProps = {}) => {
	const { data: allMembers, loading } = useBuilderData<TownTeamMember>(
		"town-team-member",
		{ sort: { "data.sortOrder": 1 }, limit: 50, fallback: staticTeamMembers },
	);

	let members = allMembers.filter((m) => m.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
	if (categoryFilter) {
		members = members.filter((m) => m.category === categoryFilter);
	}
	if (typeof limit === "number" && limit > 0) {
		members = members.slice(0, limit);
	}

	if (loading) {
		return (
			<section className="py-12 bg-cream">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="bg-white rounded-lg border border-stone p-5 animate-pulse">
								<div className="flex items-start gap-4 mb-4">
									<div className="w-14 h-14 rounded-full bg-stone/30" />
									<div className="flex-1">
										<div className="h-5 w-32 bg-stone/40 rounded mb-2" />
										<div className="h-3 w-20 bg-stone/20 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	const grouped = CATEGORY_ORDER.map((category) => ({
		category,
		description: CATEGORY_DESCRIPTIONS[category] || "",
		members: members.filter((m) => m.category === category),
	})).filter((g) => g.members.length > 0);

	const getInitials = (name: string) =>
		name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				{grouped.map((section) => (
					<div key={section.category} className="mb-12 last:mb-0">
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#2D2A24]">
								{section.category}
							</h2>
							{section.description && (
								<p className="text-[#4A4640] mt-1">{section.description}</p>
							)}
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{section.members.map((member) => (
								<div
									key={member.name}
									className="bg-white rounded-lg border border-stone overflow-hidden hover:shadow-md transition-shadow"
								>
									<div className="p-5">
										<div className="flex items-start gap-4 mb-4">
											{/* Avatar */}
											{member.image ? (
												<img
													src={member.image}
													alt={member.name}
													width={56}
													height={56}
													className="w-14 h-14 rounded-full object-cover flex-shrink-0"
												/>
											) : (
												<div className="w-14 h-14 rounded-full bg-sage-dark text-white flex items-center justify-center flex-shrink-0">
													<span className="text-lg font-semibold">
														{getInitials(member.name)}
													</span>
												</div>
											)}
											<div className="flex-1 min-w-0">
												<h3 className="text-lg font-semibold text-[#2D2A24]">
													{member.name}
												</h3>
												<p className="text-base font-medium text-sage-dark">
													{member.title}
												</p>
												{member.department && (
													<span className="inline-block mt-1 bg-stone text-[#4A4640] px-2 py-0.5 rounded-full text-xs">
														{member.department}
													</span>
												)}
											</div>
										</div>

										{/* Contact Info */}
										<div className="space-y-2 pt-3 border-t border-stone">
											{member.email && (
												<div className="flex items-center gap-2 text-sm">
													<svg
														className="w-4 h-4 text-[#635E56] flex-shrink-0"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
														/>
													</svg>
													<a
														href={`mailto:${member.email}`}
														className="text-sage-dark hover:underline truncate"
													>
														{member.email}
													</a>
												</div>
											)}
											{member.phone && (
												<div className="flex items-center gap-2 text-sm">
													<svg
														className="w-4 h-4 text-[#635E56] flex-shrink-0"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
														/>
													</svg>
													<a
														href={`tel:${member.phone}`}
														className="text-[#4A4640] hover:text-sage-dark"
													>
														{member.phone}
													</a>
												</div>
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
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
