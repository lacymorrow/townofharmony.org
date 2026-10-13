import { Card, CardContent } from "@/components/ui/card";
import { getElections } from "@/lib/town-data";
import { ElectionCard } from "./election-card";

const ITEMS_PER_PAGE = 6;

interface ElectionsListProps {
  page: number;
  status?: string;
  search?: string;
}

export async function ElectionsList({ page, status, search }: ElectionsListProps) {
  const statusFilter =
    status && status !== "all" ? (status as "upcoming" | "today" | "past") : undefined;

  const result = await getElections({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter,
    search: search || undefined,
  });

  const electionsData = result.docs;
  const total = result.totalDocs;

  if (electionsData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-[#635E56]">
            {search ? "No elections found matching your search criteria." : "No elections found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#4A4640]">
          Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} of{" "}
          {total} elections
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {electionsData.map((election) => (
          <ElectionCard
            key={election.id}
            election={election}
            candidateCount={election.candidates?.length || 0}
          />
        ))}
      </div>
    </>
  );
}
