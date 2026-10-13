import type { Metadata } from "next";
import Image from "next/image";
import { teamMembers } from "@/data/town/team-members";

export const metadata: Metadata = {
  title: "Our Team | Town of Harmony",
  description: "Meet the elected officials and staff of the Town of Harmony, North Carolina.",
};

const CATEGORIES = ["Executive", "Town Council", "Staff"] as const;

export default function OurTeamPage() {
  const active = teamMembers.filter((m) => m.isActive);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        <header className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-sage-dark md:text-4xl">Our Team</h1>
          <p className="mt-2 max-w-2xl text-[#4A4640]">
            Elected officials and staff serving the Town of Harmony.
          </p>
        </header>

        {CATEGORIES.map((category) => {
          const members = active.filter((m) => m.category === category);
          if (members.length === 0) return null;
          return (
            <div key={category} className="mb-12 last:mb-0">
              <h2 className="mb-6 border-b border-stone pb-2 text-2xl font-bold text-[#2D2A24]">
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <div key={member.id} className="rounded-lg border border-stone bg-white p-5">
                    <div className="mb-3 flex items-start gap-4">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 font-semibold text-sage-dark">
                          {getInitials(member.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#2D2A24]">{member.name}</h3>
                        <p className="text-base text-[#4A4640]">{member.title}</p>
                      </div>
                    </div>
                    {member.mayorSince && (
                      <p className="pt-1 text-sm text-[#635E56]">
                        Mayor since: {member.mayorSince}
                      </p>
                    )}
                    {member.termExpires && (
                      <p className="pt-1 text-sm text-[#635E56]">Term: {member.termExpires}</p>
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
