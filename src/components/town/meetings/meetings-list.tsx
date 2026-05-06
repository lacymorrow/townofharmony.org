import { getMeetings } from "@/lib/town-data";
import { MeetingCard } from "./meeting-card";
import { MeetingsPagination } from "./meetings-pagination";

interface MeetingsListProps {
	type?: string;
	month?: string;
	year?: string;
	status?: string;
	page?: string;
	limit?: number;
}

const ITEMS_PER_PAGE = 10;

export async function MeetingsList({
	type,
	month,
	year,
	status,
	page = "1",
	limit = ITEMS_PER_PAGE,
}: MeetingsListProps) {
	const currentPage = Number.parseInt(page) || 1;

	const result = await getMeetings({
		limit,
		page: currentPage,
		type,
		month,
		year,
		status,
	});

	const meetingsData = result.docs;
	const totalCount = result.totalDocs;
	const totalPages = result.totalPages;
	const hasNextPage = currentPage < totalPages;
	const hasPrevPage = currentPage > 1;

	if (meetingsData.length === 0) {
		return (
			<div className="text-center py-12">
				<h3 className="text-lg font-semibold mb-2">No meetings found</h3>
				<p className="text-muted-foreground">Try adjusting your filters to see more meetings.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<p className="text-sm text-muted-foreground">
					Showing {meetingsData.length} of {totalCount} meetings
				</p>
			</div>

			<div className="grid gap-3">
				{meetingsData.map((meeting) => (
					<MeetingCard key={meeting.id} meeting={meeting as any} />
				))}
			</div>

			{totalPages > 1 && (
				<MeetingsPagination
					currentPage={currentPage}
					totalPages={totalPages}
					hasNextPage={hasNextPage}
					hasPrevPage={hasPrevPage}
				/>
			)}
		</div>
	);
}
