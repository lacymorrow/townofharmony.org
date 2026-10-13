"use client";

import { LightboxImage } from "@/components/ui/lightbox-image";
import { useBuilderData } from "@/lib/builder-data";
import { teamMembers as staticTeamMembers } from "@/data/town/team-members";
import type { TownTeamMember } from "@/data/town/types";

/**
 * Well-known team categories shown first, in this order. Categories entered
 * in Builder.io that aren't listed here still render, sorted alphabetically
 * after these — editors can add new categories without a code change.
 * Members with no category fall into an "Other" group so they're never
 * dropped from the page.
 */
const PREFERRED_CATEGORY_ORDER = ["Executive", "Town Council", "Staff"] as const;

const UNCATEGORIZED_LABEL = "Other";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Executive: "Town leadership responsible for daily operations and civic governance.",
  "Town Council": "Elected officials serving the citizens of Harmony through policy and oversight.",
  Staff: "Dedicated professionals managing essential town services.",
};

interface TownTeamMembersProps {
  limit?: number;
  categoryFilter?: string;
}

export const TownTeamMembers = ({ limit, categoryFilter }: TownTeamMembersProps = {}) => {
  const { data: allMembers, loading } = useBuilderData<TownTeamMember>("town-team-member", {
    sort: { priority: -1 },
    limit: 50,
    fallback: staticTeamMembers,
  });

  let members = allMembers.filter((m) => m.isActive);
  if (categoryFilter) {
    members = members.filter((m) => m.category === categoryFilter);
  }
  if (typeof limit === "number" && limit > 0) {
    members = members.slice(0, limit);
  }

  if (loading) {
    return (
      <section className="bg-cream py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-stone bg-white p-5">
                <div className="mb-4 flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-stone/30" />
                  <div className="flex-1">
                    <div className="mb-2 h-5 w-32 rounded bg-stone/40" />
                    <div className="h-3 w-20 rounded bg-stone/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const categoryOf = (m: TownTeamMember) => m.category?.trim() || UNCATEGORIZED_LABEL;
  const presentCategories = new Set(members.map(categoryOf));
  const preferredSet = new Set<string>(PREFERRED_CATEGORY_ORDER);
  const preferred = PREFERRED_CATEGORY_ORDER.filter((c) => presentCategories.has(c));
  const extras = [...presentCategories]
    .filter((c) => !preferredSet.has(c) && c !== UNCATEGORIZED_LABEL)
    .sort((a, b) => a.localeCompare(b));
  const orderedCategories = [...preferred, ...extras];
  if (presentCategories.has(UNCATEGORIZED_LABEL)) {
    orderedCategories.push(UNCATEGORIZED_LABEL);
  }

  const grouped = orderedCategories
    .map((category) => ({
      category,
      description: CATEGORY_DESCRIPTIONS[category] || "",
      members: members.filter((m) => categoryOf(m) === category),
    }))
    .filter((g) => g.members.length > 0);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        {grouped.map((section) => (
          <div key={section.category} className="mb-12 last:mb-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#2D2A24]">{section.category}</h2>
              {section.description && <p className="mt-1 text-[#4A4640]">{section.description}</p>}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.members.map((member) => (
                <div
                  key={member.name}
                  className="overflow-hidden rounded-lg border border-stone bg-white transition-shadow hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="mb-4 flex items-start gap-4">
                      {/* Avatar */}
                      {member.image ? (
                        <LightboxImage
                          src={member.image}
                          alt={member.name}
                          width={56}
                          height={56}
                          wrapperClassName="w-14 h-14 rounded-full flex-shrink-0"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-sage-dark text-white">
                          <span className="text-lg font-semibold">{getInitials(member.name)}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-[#2D2A24]">{member.name}</h3>
                        <p className="text-base font-medium text-sage-dark">{member.title}</p>
                        {member.department && (
                          <span className="mt-1 inline-block rounded-full bg-stone px-2 py-0.5 text-xs text-[#4A4640]">
                            {member.department}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 border-t border-stone pt-3">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="h-4 w-4 flex-shrink-0 text-[#635E56]"
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
                            className="truncate text-sage-dark hover:underline"
                          >
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.mayorSince && (
                        <p className="pt-1 text-sm text-[#635E56]">
                          Mayor since: {member.mayorSince}
                        </p>
                      )}
                      {member.termExpires && (
                        <p className="pt-1 text-sm text-[#635E56]">Term: {member.termExpires}</p>
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
