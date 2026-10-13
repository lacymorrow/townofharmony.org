"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBuilderPaginatedData } from "@/lib/builder-data";
import { htmlToPlainText } from "@/lib/html-to-text";
import { elections as staticElections } from "@/data/town/elections";
import type { TownElection } from "@/data/town/types";

interface TownElectionsListProps {
  itemsPerPage?: number;
}

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "past", label: "Past" },
] as const;

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-stone bg-white px-3 py-2 text-sm font-medium text-sage-dark transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            p === page
              ? "bg-sage-dark text-white"
              : "border border-stone bg-white text-sage-dark hover:bg-cream"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-stone bg-white px-3 py-2 text-sm font-medium text-sage-dark transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

const getStatusBadge = (electionDate: string) => {
  const today = new Date().toISOString().split("T")[0];
  const dateStr = electionDate.split("T")[0];

  if (dateStr === today) {
    return (
      <span className="animate-pulse rounded-full border border-barn-red/30 bg-barn-red/15 px-2.5 py-0.5 text-xs font-bold uppercase text-barn-red">
        Election Day
      </span>
    );
  }
  if (dateStr! > today!) {
    return (
      <span className="rounded-full border border-sage/30 bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-sage-dark">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-full border border-stone bg-stone px-2.5 py-0.5 text-xs font-medium text-[#635E56]">
      Completed
    </span>
  );
};

export const TownElectionsList = ({ itemsPerPage = 6 }: TownElectionsListProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams?.get("page")) || 1;
  const status = (searchParams?.get("status") as "upcoming" | "today" | "past") || undefined;
  const search = searchParams?.get("search") || undefined;

  const { docs, totalPages } = useBuilderPaginatedData<TownElection>("town-election", {
    page,
    limit: itemsPerPage,
    fallbackData: staticElections,
    search,
    searchFields: ["title", "description"],
    filter: status
      ? (election) => {
          const today = new Date().toISOString().split("T")[0];
          const electionDay = election.electionDate.split("T")[0];
          if (status === "today") return electionDay === today;
          if (status === "upcoming") return electionDay! > today!;
          if (status === "past") return electionDay! < today!;
          return true;
        }
      : undefined,
    clientSort: (a, b) => new Date(b.electionDate).getTime() - new Date(a.electionDate).getTime(),
  });

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="max-w-sm flex-1">
            <input
              type="text"
              placeholder="Search elections..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateParams({
                    search: (e.target as HTMLInputElement).value || undefined,
                  });
                }
              }}
              className="w-full rounded-lg border border-stone bg-white px-4 py-2.5 text-[#2D2A24] placeholder:text-[#635E56] focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateParams({ status: undefined })}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !status
                  ? "bg-sage-dark text-white"
                  : "border border-stone bg-white text-[#4A4640] hover:bg-stone"
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => updateParams({ status: s.value })}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  status === s.value
                    ? "bg-sage-dark text-white"
                    : "border border-stone bg-white text-[#4A4640] hover:bg-stone"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Elections Grid */}
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((election) => {
              const electionDate = new Date(election.electionDate);

              return (
                <Link
                  key={election.slug}
                  href={`/elections/${election.slug}`}
                  className="group overflow-hidden rounded-lg border border-stone bg-white transition-shadow hover:shadow-lg"
                >
                  {/* Header */}
                  <div className="bg-sage-dark p-4 text-white">
                    <div className="mb-2 flex items-center justify-between">
                      {getStatusBadge(election.electionDate)}
                      <span className="text-sm opacity-80">
                        {election.candidates.length} candidate
                        {election.candidates.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold">{election.title}</h2>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <p className="mb-4 line-clamp-2 text-base text-[#4A4640]">
                      {htmlToPlainText(election.description)}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#635E56]">Election Date</span>
                        <span className="font-medium text-[#2D2A24]">
                          {electionDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#635E56]">Registration Deadline</span>
                        <span className="font-medium text-[#2D2A24]">
                          {new Date(election.registrationDeadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#635E56]">Early Voting</span>
                        <span className="font-medium text-[#2D2A24]">
                          {new Date(election.earlyVotingStart).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(election.earlyVotingEnd).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Polling Locations Count */}
                    {election.pollingLocations.length > 0 && (
                      <p className="mt-3 text-sm text-[#635E56]">
                        {election.pollingLocations.length} polling location
                        {election.pollingLocations.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-[#635E56]">No elections found.</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => updateParams({ page: String(p) })}
        />
      </div>
    </section>
  );
};
