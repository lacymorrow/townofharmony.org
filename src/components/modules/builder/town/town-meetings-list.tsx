"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBuilderPaginatedData } from "@/lib/builder-data";
import { meetings as staticMeetings } from "@/data/town/meetings";
import type { TownMeeting } from "@/data/town/types";

interface TownMeetingsListProps {
	itemsPerPage?: number;
	showCalendar?: boolean;
}

const MEETING_TYPES = ["Council", "Planning", "Public Hearing"] as const;

const STATUS_OPTIONS = [
	{ value: "upcoming", label: "Upcoming" },
	{ value: "past", label: "Past" },
	{ value: "has-recordings", label: "Has Recordings" },
	{ value: "has-minutes", label: "Has Minutes" },
] as const;

const MONTHS = [
	{ value: "1", label: "January" },
	{ value: "2", label: "February" },
	{ value: "3", label: "March" },
	{ value: "4", label: "April" },
	{ value: "5", label: "May" },
	{ value: "6", label: "June" },
	{ value: "7", label: "July" },
	{ value: "8", label: "August" },
	{ value: "9", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
];

const safeArray = (arr: unknown): string[] => (Array.isArray(arr) ? arr : []);

const TYPE_BADGE_COLORS: Record<string, string> = {
	Council: "bg-sage/15 text-sage-dark border-sage/30",
	Planning: "bg-wheat/30 text-[#7A6520] border-wheat/50",
	"Public Hearing": "bg-barn-red/10 text-barn-red border-barn-red/20",
};

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
		<nav className="flex items-center justify-center gap-2 mt-8">
			<button
				type="button"
				onClick={() => onPageChange(page - 1)}
				disabled={page <= 1}
				className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				Previous
			</button>
			{pages.map((p) => (
				<button
					key={p}
					type="button"
					onClick={() => onPageChange(p)}
					className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
				className="px-3 py-2 text-sm font-medium rounded-md border border-stone bg-white text-sage-dark hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				Next
			</button>
		</nav>
	);
};

export const TownMeetingsList = ({
	itemsPerPage = 10,
	showCalendar = false,
}: TownMeetingsListProps) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const page = Number(searchParams?.get("page")) || 1;
	const type = searchParams?.get("type") || undefined;
	const month = searchParams?.get("month") || undefined;
	const year = searchParams?.get("year") || undefined;
	const status = searchParams?.get("status") || undefined;

	const { docs, totalPages } = useBuilderPaginatedData<TownMeeting>("town-meeting", {
		page,
		limit: itemsPerPage,
		fallbackData: staticMeetings,
		filter: (meeting) => {
			if (type && meeting.type !== type) return false;
			if (month || year) {
				const d = new Date(meeting.meetingDate);
				if (month && String(d.getMonth() + 1) !== month) return false;
				if (year && String(d.getFullYear()) !== year) return false;
			}
			if (status) {
				const today = new Date().toISOString().split("T")[0];
				const meetingDay = meeting.meetingDate.split("T")[0];
				if (status === "upcoming" && meetingDay! < today!) return false;
				if (status === "past" && meetingDay! >= today!) return false;
				if (status === "has-recordings" && !meeting.videoUrl && !meeting.audioUrl) return false;
				if (status === "has-minutes" && !meeting.minutes && !meeting.minutesUrl) return false;
			}
			return true;
		},
		clientSort: (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
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

	const currentYear = new Date().getFullYear();
	const years = [
		String(currentYear - 1),
		String(currentYear),
		String(currentYear + 1),
	];

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				{/* Filters */}
				<div className="mb-8 flex flex-wrap gap-4">
					<select
						value={type || ""}
						onChange={(e) =>
							updateParams({ type: e.target.value || undefined })
						}
						className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
					>
						<option value="">All Types</option>
						{MEETING_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>

					<select
						value={status || ""}
						onChange={(e) =>
							updateParams({ status: e.target.value || undefined })
						}
						className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
					>
						<option value="">All Meetings</option>
						{STATUS_OPTIONS.map((s) => (
							<option key={s.value} value={s.value}>
								{s.label}
							</option>
						))}
					</select>

					<select
						value={month || ""}
						onChange={(e) =>
							updateParams({
								month: e.target.value || undefined,
								year: e.target.value
									? year || String(currentYear)
									: undefined,
							})
						}
						className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
					>
						<option value="">All Months</option>
						{MONTHS.map((m) => (
							<option key={m.value} value={m.value}>
								{m.label}
							</option>
						))}
					</select>

					<select
						value={year || ""}
						onChange={(e) =>
							updateParams({ year: e.target.value || undefined })
						}
						className="px-3 py-2 rounded-lg border border-stone bg-white text-[#2D2A24] text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage"
					>
						<option value="">All Years</option>
						{years.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
				</div>

				{/* Calendar View Placeholder */}
				{showCalendar && (
					<div className="mb-8 p-6 bg-white border border-stone rounded-lg text-center text-[#635E56]">
						<p className="text-sm">
							Calendar view - meeting dates are highlighted below
						</p>
					</div>
				)}

				{/* Meetings List */}
				{docs.length > 0 ? (
					<div className="space-y-4">
						{docs.map((meeting) => {
							const meetingDate = new Date(meeting.meetingDate);
							const badgeClass =
								TYPE_BADGE_COLORS[meeting.type] ||
								"bg-stone text-[#4A4640] border-stone";

							return (
								<Link
									key={meeting.slug}
									href={`/meetings/${meeting.slug}`}
									className="group block bg-white rounded-lg border border-stone overflow-hidden hover:shadow-lg transition-shadow"
								>
									<div className="flex flex-col md:flex-row">
										{/* Date Badge */}
										<div className="flex-shrink-0 w-full md:w-28 bg-sage-dark text-white flex flex-col items-center justify-center py-4 md:py-0">
											<span className="text-sm font-medium uppercase">
												{meetingDate.toLocaleDateString("en-US", {
													month: "short",
												})}
											</span>
											<span className="text-3xl font-bold leading-tight">
												{meetingDate.getDate()}
											</span>
											<span className="text-sm opacity-80">
												{meetingDate.getFullYear()}
											</span>
										</div>

										{/* Meeting Content */}
										<div className="flex-1 p-5 md:py-4">
											<div className="flex flex-wrap items-center gap-2 mb-2">
												<span
													className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
												>
													{meeting.type}
												</span>
												{(meeting.videoUrl || meeting.audioUrl) && (
													<span className="bg-sage/10 text-sage-dark px-2 py-0.5 rounded-full text-xs">
														Recording Available
													</span>
												)}
												{(meeting.minutes || meeting.minutesUrl) && (
													<span className="bg-wheat/20 text-[#7A6520] px-2 py-0.5 rounded-full text-xs">
														Minutes Available
													</span>
												)}
											</div>
											<h2 className="text-lg font-semibold text-[#2D2A24] group-hover:text-sage-dark transition-colors mb-1">
												{meeting.title}
											</h2>
											<div className="flex flex-wrap gap-4 text-base text-[#635E56] mb-2">
												<span>{meeting.meetingTime}</span>
												<span>{meeting.location}</span>
											</div>
											{(() => {
												const attendees = safeArray(meeting.attendees);
												if (attendees.length === 0) return null;
												return (
													<p className="text-sm text-[#635E56]">
														Attendees: {attendees.slice(0, 3).join(", ")}
														{attendees.length > 3 && ` +${attendees.length - 3} more`}
													</p>
												);
											})()}
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-[#635E56] text-lg">No meetings found.</p>
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
