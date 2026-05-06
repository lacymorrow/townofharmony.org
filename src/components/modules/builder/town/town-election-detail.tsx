"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBuilderEntry } from "@/lib/builder-data";
import { elections as staticElections } from "@/data/town/elections";
import type { TownElection } from "@/data/town/types";

interface TownElectionDetailProps {
	slug?: string;
}

const formatDate = (dateStr: string) =>
	new Date(dateStr).toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

const formatShortDate = (dateStr: string) =>
	new Date(dateStr).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

export const TownElectionDetail = ({
	slug: slugProp,
}: TownElectionDetailProps) => {
	const pathname = usePathname();
	const slug =
		slugProp || pathname?.split("/").filter(Boolean).pop() || "";

	const staticFallback = staticElections.find((e) => e.slug === slug) ?? null;
	const { data: election, loading } = useBuilderEntry<TownElection>(
		"town-election",
		{ "data.slug": slug },
		{ fallback: staticFallback },
	);

	if (loading) {
		return (
			<section className="bg-warm-white py-12">
				<div className="container mx-auto px-4 max-w-4xl">
					<div className="animate-pulse space-y-4">
						<div className="h-4 w-32 bg-stone/40 rounded" />
						<div className="h-8 w-3/4 bg-stone/40 rounded" />
						<div className="h-48 bg-stone/20 rounded-xl" />
					</div>
				</div>
			</section>
		);
	}

	if (!election) {
		return (
			<section className="bg-warm-white py-16">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">
						Election not found
					</h1>
					<p className="text-sage-dark/70 mb-8">
						The election you are looking for could not be found.
					</p>
					<Link
						href="/elections"
						className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
					>
						&larr; Back to Elections
					</Link>
				</div>
			</section>
		);
	}

	// Group candidates by position
	const candidatesByPosition = election.candidates.reduce<
		Record<string, typeof election.candidates>
	>((acc, candidate) => {
		const position = candidate.position;
		if (!acc[position]) {
			acc[position] = [];
		}
		acc[position].push(candidate);
		return acc;
	}, {});

	return (
		<section className="bg-warm-white py-12">
			<div className="container mx-auto px-4 max-w-4xl">
				{/* Back link */}
				<Link
					href="/elections"
					className="inline-flex items-center gap-2 text-sage hover:text-sage-dark text-sm font-medium mb-8 transition-colors"
				>
					&larr; Back to Elections
				</Link>

				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark leading-tight mb-4">
					{election.title}
				</h1>

				{/* Description */}
				<p className="text-lg text-sage-dark/80 leading-relaxed mb-8">
					{election.description}
				</p>

				{/* Key dates card */}
				<div className="bg-cream border border-stone rounded-xl p-6 mb-8">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-4">
						Key Dates
					</h2>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Election Day
							</dt>
							<dd className="text-sage-dark font-bold text-lg">
								{formatDate(election.electionDate)}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Voter Registration Deadline
							</dt>
							<dd className="text-sage-dark font-medium">
								{formatShortDate(election.registrationDeadline)}
							</dd>
						</div>
						{election.earlyVotingStart && (
							<div>
								<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
									Early Voting Begins
								</dt>
								<dd className="text-sage-dark font-medium">
									{formatShortDate(
										election.earlyVotingStart,
									)}
								</dd>
							</div>
						)}
						{election.earlyVotingEnd && (
							<div>
								<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
									Early Voting Ends
								</dt>
								<dd className="text-sage-dark font-medium">
									{formatShortDate(election.earlyVotingEnd)}
								</dd>
							</div>
						)}
					</dl>
				</div>

				{/* Polling locations */}
				{election.pollingLocations.length > 0 && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Polling Locations
						</h2>
						<div className="space-y-3">
							{election.pollingLocations.map((location) => (
								<div
									key={location.name}
									className="bg-cream border border-stone rounded-xl p-5"
								>
									<h3 className="font-semibold text-sage-dark mb-1">
										{location.name}
									</h3>
									<p className="text-base text-sage-dark/70 mb-1">
										{location.address}
									</p>
									<p className="text-base text-sage-dark/70">
										<span className="font-medium text-sage-dark/80">
											Hours:
										</span>{" "}
										{location.hours}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Candidates */}
				{election.candidates.length > 0 && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-4">
							Candidates
						</h2>
						{Object.entries(candidatesByPosition).map(
							([position, candidates]) => (
								<div key={position} className="mb-6 last:mb-0">
									<h3 className="text-sm font-semibold uppercase tracking-wide text-sage-dark/60 mb-3 border-b border-stone pb-2">
										{position}
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{candidates
											.sort(
												(a, b) =>
													a.sortOrder - b.sortOrder,
											)
											.map((candidate) => (
												<div
													key={`${candidate.name}-${candidate.position}`}
													className="bg-cream border border-stone rounded-xl p-5"
												>
													<h4 className="font-serif font-bold text-sage-dark text-lg mb-1">
														{candidate.name}
													</h4>
													<span className="inline-block bg-wheat/30 text-sage-dark px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3">
														{candidate.party}
													</span>
													<p className="text-base text-sage-dark/75 leading-relaxed">
														{candidate.bio}
													</p>
												</div>
											))}
									</div>
								</div>
							),
						)}
					</div>
				)}

				{/* Results URL */}
				{election.resultsUrl && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Election Results
						</h2>
						<a
							href={election.resultsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
						>
							View Official Results &rarr;
						</a>
					</div>
				)}
			</div>
		</section>
	);
};
