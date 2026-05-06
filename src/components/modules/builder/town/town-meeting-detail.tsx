"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBuilderEntry } from "@/lib/builder-data";
import { meetings as staticMeetings } from "@/data/town/meetings";
import type { TownMeeting } from "@/data/town/types";

interface TownMeetingDetailProps {
	slug?: string;
}

const typeColors: Record<string, string> = {
	Council: "bg-sage/15 text-sage-dark border-sage/30",
	Planning: "bg-wheat/30 text-sage-dark border-wheat/50",
	"Public Hearing": "bg-barn-red/10 text-barn-red border-barn-red/20",
};

export const TownMeetingDetail = ({
	slug: slugProp,
}: TownMeetingDetailProps) => {
	const pathname = usePathname();
	const slug =
		slugProp || pathname?.split("/").filter(Boolean).pop() || "";

	const staticFallback = staticMeetings.find((m) => m.slug === slug) ?? null;
	const { data: meeting, loading } = useBuilderEntry<TownMeeting>(
		"town-meeting",
		{ "data.slug": slug },
		{ fallback: staticFallback },
	);

	if (loading) {
		return (
			<section className="bg-warm-white py-12">
				<div className="container mx-auto px-4 max-w-3xl">
					<div className="animate-pulse space-y-4">
						<div className="h-4 w-32 bg-stone/40 rounded" />
						<div className="h-8 w-3/4 bg-stone/40 rounded" />
						<div className="h-48 bg-stone/20 rounded-xl" />
					</div>
				</div>
			</section>
		);
	}

	if (!meeting) {
		return (
			<section className="bg-warm-white py-16">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">
						Meeting not found
					</h1>
					<p className="text-sage-dark/70 mb-8">
						The meeting you are looking for could not be found.
					</p>
					<Link
						href="/meetings"
						className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
					>
						&larr; Back to Meetings
					</Link>
				</div>
			</section>
		);
	}

	const meetingDate = new Date(meeting.meetingDate).toLocaleDateString(
		"en-US",
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<section className="bg-warm-white py-12">
			<div className="container mx-auto px-4 max-w-3xl">
				{/* Back link */}
				<Link
					href="/meetings"
					className="inline-flex items-center gap-2 text-sage hover:text-sage-dark text-sm font-medium mb-8 transition-colors"
				>
					&larr; Back to Meetings
				</Link>

				{/* Type badge */}
				<div className="mb-4">
					<span
						className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${typeColors[meeting.type] || typeColors.Council}`}
					>
						{meeting.type}
					</span>
				</div>

				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark leading-tight mb-6">
					{meeting.title}
				</h1>

				{/* Meeting details card */}
				<div className="bg-cream border border-stone rounded-xl p-6 mb-8">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-4">
						Meeting Details
					</h2>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Date
							</dt>
							<dd className="text-sage-dark font-medium">
								{meetingDate}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Time
							</dt>
							<dd className="text-sage-dark font-medium">
								{meeting.meetingTime}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Location
							</dt>
							<dd className="text-sage-dark font-medium">
								{meeting.location}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Open to Public
							</dt>
							<dd className="text-sage-dark font-medium">
								{meeting.isPublic ? "Yes" : "No"}
							</dd>
						</div>
					</dl>
				</div>

				{/* Attendees */}
				{meeting.attendees.length > 0 && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Attendees
						</h2>
						<ul className="bg-cream border border-stone rounded-xl divide-y divide-stone">
							{meeting.attendees.map((attendee) => (
								<li
									key={attendee}
									className="px-5 py-3 text-sage-dark/85 text-base"
								>
									{attendee}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Agenda */}
				{meeting.agenda && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Agenda
						</h2>
						<div className="bg-cream border border-stone rounded-xl p-6">
							<pre className="whitespace-pre-wrap text-base text-sage-dark/85 leading-relaxed font-sans">
								{meeting.agenda}
							</pre>
						</div>
					</div>
				)}

				{/* Minutes */}
				{(meeting.minutes || meeting.minutesUrl) && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Meeting Minutes
						</h2>
						{meeting.minutes && (
							<div className="bg-cream border border-stone rounded-xl p-6 mb-3">
								<pre className="whitespace-pre-wrap text-base text-sage-dark/85 leading-relaxed font-sans">
									{meeting.minutes}
								</pre>
							</div>
						)}
						{meeting.minutesUrl && (
							<a
								href={meeting.minutesUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 bg-sage text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
							>
								Download Minutes (PDF)
							</a>
						)}
					</div>
				)}

				{/* Recordings */}
				{(meeting.videoUrl || meeting.audioUrl) && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Recordings
						</h2>
						<div className="flex flex-wrap gap-3">
							{meeting.videoUrl && (
								<a
									href={meeting.videoUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 bg-sage text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
								>
									Watch Video Recording
								</a>
							)}
							{meeting.audioUrl && (
								<a
									href={meeting.audioUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 bg-wheat text-sage-deep px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-wheat-light transition-colors"
								>
									Listen to Audio Recording
								</a>
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};
