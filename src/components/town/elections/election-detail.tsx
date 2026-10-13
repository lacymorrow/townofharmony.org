import { Calendar, ExternalLink, FileText, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { PayloadRichText, extractTextFromRichText } from "@/components/town/payload-rich-text";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getElectionBySlug } from "@/lib/town-data";
import { CandidateCard } from "./candidate-card";
import { VotingInfo } from "./voting-info";

interface ElectionDetailProps {
  slug: string;
}

export async function ElectionDetail({ slug }: ElectionDetailProps) {
  const election = await getElectionBySlug(slug);

  if (!election) {
    notFound();
  }

  const electionCandidates = election.candidates ?? [];

  const electionDate = new Date(election.electionDate);
  const isUpcoming = electionDate > new Date();
  const isToday = electionDate.toDateString() === new Date().toDateString();
  const isPast = electionDate < new Date();

  const getElectionStatus = () => {
    if (isToday) return { label: "Today", variant: "destructive" as const };
    if (isUpcoming) return { label: "Upcoming", variant: "default" as const };
    if (isPast) return { label: "Complete", variant: "secondary" as const };
    return { label: "Unknown", variant: "outline" as const };
  };

  const status = getElectionStatus();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group candidates by position
  const candidatesByPosition = electionCandidates.reduce(
    (acc, candidate) => {
      const position = candidate.position || "Unknown";
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    },
    {} as Record<string, typeof electionCandidates>
  );

  const sampleBallotUrl = election.sampleBallot ?? null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Header */}
      <div className="bg-sage-dark py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-4 text-4xl font-bold">{election.title}</h1>
              <div className="flex items-center gap-4 text-cream">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(electionDate)}
                </div>
                <Badge variant={status.variant} className="text-sm">
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          {election.description && (
            <div className="mt-4 max-w-3xl text-xl text-cream">
              <PayloadRichText
                content={election.description as any}
                className="prose prose-lg prose-invert max-w-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Election Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Election Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold text-[#2D2A24]">Election Date</h3>
                    <p className="text-[#4A4640]">{formatDate(electionDate)}</p>
                  </div>

                  {election.registrationDeadline && (
                    <div>
                      <h3 className="mb-2 font-semibold text-[#2D2A24]">Registration Deadline</h3>
                      <p className="text-[#4A4640]">
                        {formatDate(new Date(election.registrationDeadline))}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-2 font-semibold text-[#2D2A24]">Candidates</h3>
                    <p className="text-[#4A4640]">
                      {electionCandidates.length} candidate
                      {electionCandidates.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-[#2D2A24]">Polling Locations</h3>
                    <p className="text-[#4A4640]">
                      {Array.isArray(election.pollingLocations)
                        ? `${election.pollingLocations.length} location${election.pollingLocations.length !== 1 ? "s" : ""}`
                        : "Information not available"}
                    </p>
                  </div>
                </div>

                {/* External Links */}
                <div className="mt-6 flex flex-wrap gap-3 border-t pt-6">
                  {sampleBallotUrl && (
                    <a
                      href={sampleBallotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-stone px-3 py-2 text-sm text-sage hover:text-sage-dark"
                    >
                      <FileText className="h-4 w-4" />
                      Sample Ballot
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {election.resultsUrl && !isUpcoming && (
                    <a
                      href={election.resultsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600 hover:text-green-700"
                    >
                      <FileText className="h-4 w-4" />
                      Election Results
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Candidates by Position */}
            {Object.entries(candidatesByPosition).map(([position, positionCandidates]) => (
              <Card key={position}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {position}
                  </CardTitle>
                  <p className="text-sm text-[#4A4640]">
                    {positionCandidates.length} candidate
                    {positionCandidates.length !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {positionCandidates.map((candidate, index) => (
                      <CandidateCard key={candidate.id ?? index} candidate={candidate} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* No Candidates Message */}
            {electionCandidates.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-[#635E56]" />
                  <p className="text-[#635E56]">
                    No candidates have been registered for this election yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <VotingInfo election={election} />
          </div>
        </div>
      </div>
    </div>
  );
}
