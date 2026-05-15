import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	ExternalLink,
	FileText,
	MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VotingInfoProps {
	election: {
		electionDate: string;
		registrationDeadline?: string | null;
		earlyVotingStart?: string | null;
		earlyVotingEnd?: string | null;
		pollingLocations?: { name: string; address: string; hours?: string | null }[] | null;
		sampleBallot?: { url?: string | null } | number | string | null;
		resultsUrl?: string | null;
	};
}

interface PollingLocation {
	name: string;
	address: string;
	hours?: string | null;
	accessibility?: string;
	parking?: string;
}

export function VotingInfo({ election }: VotingInfoProps) {
	const electionDate = new Date(election.electionDate);
	const registrationDeadline = election.registrationDeadline
		? new Date(election.registrationDeadline)
		: null;
	const earlyVotingStart = election.earlyVotingStart ? new Date(election.earlyVotingStart) : null;
	const earlyVotingEnd = election.earlyVotingEnd ? new Date(election.earlyVotingEnd) : null;

	const isUpcoming = electionDate > new Date();
	const isToday = electionDate.toDateString() === new Date().toDateString();

	const pollingLocations: PollingLocation[] = Array.isArray(election.pollingLocations)
		? (election.pollingLocations as PollingLocation[])
		: [];

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Resolve sampleBallot URL from upload relation
	const sampleBallotUrl =
		typeof election.sampleBallot === "object" && election.sampleBallot !== null && "url" in election.sampleBallot
			? election.sampleBallot.url
			: typeof election.sampleBallot === "string"
				? election.sampleBallot
				: null;

	return (
		<div className="space-y-6">
			{/* Election Status */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Election Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start gap-3">
						<Calendar className="h-5 w-5 text-sage mt-0.5 flex-shrink-0" />
						<div>
							<p className="font-medium">Election Day</p>
							<p className="text-[#4A4640]">{formatDate(electionDate)}</p>
							{isToday && (
								<Badge variant="destructive" className="mt-1">
									<CheckCircle className="h-3 w-3 mr-1" />
									Today
								</Badge>
							)}
							{isUpcoming && (
								<Badge variant="default" className="mt-1">
									Upcoming
								</Badge>
							)}
						</div>
					</div>

					{pollingLocations[0]?.hours && (
						<div className="flex items-start gap-3">
							<Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
							<div>
								<p className="font-medium">Polling Hours</p>
								<p className="text-[#4A4640]">{pollingLocations[0].hours}</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Important Dates */}
			{(registrationDeadline || earlyVotingStart || earlyVotingEnd) && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5" />
							Important Dates
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{registrationDeadline && (
							<div className="flex items-start gap-3">
								<FileText className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
								<div>
									<p className="font-medium">Registration Deadline</p>
									<p className="text-[#4A4640]">{formatDate(registrationDeadline)}</p>
									{registrationDeadline < new Date() && (
										<Badge variant="secondary" className="mt-1">
											Registration Closed
										</Badge>
									)}
								</div>
							</div>
						)}

						{earlyVotingStart && earlyVotingEnd && (
							<div className="flex items-start gap-3">
								<Clock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
								<div>
									<p className="font-medium">Early Voting Period</p>
									<p className="text-[#4A4640]">
										{formatDate(earlyVotingStart)} - {formatDate(earlyVotingEnd)}
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Polling Locations */}
			{pollingLocations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5" />
							Polling Locations
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{pollingLocations.map((location, index) => (
							<div key={index} className="border rounded-lg p-4">
								<h4 className="font-semibold text-[#2D2A24] mb-2">{location.name}</h4>
								<div className="space-y-2 text-sm text-[#4A4640]">
									<p className="flex items-start gap-2">
										<MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
										{location.address}
									</p>
									{location.hours && (
										<p className="flex items-center gap-2">
											<Clock className="h-4 w-4 flex-shrink-0" />
											{location.hours}
										</p>
									)}
									{location.accessibility && (
										<p className="text-green-600">
											<strong>Accessibility:</strong> {location.accessibility}
										</p>
									)}
									{location.parking && (
										<p className="text-sage">
											<strong>Parking:</strong> {location.parking}
										</p>
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Sample Ballot & Resources */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Election Resources
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{sampleBallotUrl && (
						<a
							href={sampleBallotUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-sage hover:text-sage-dark bg-stone px-3 py-2 rounded-md"
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
							className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 bg-green-50 px-3 py-2 rounded-md"
						>
							<CheckCircle className="h-4 w-4" />
							Election Results
							<ExternalLink className="h-3 w-3" />
						</a>
					)}

					<div className="pt-2 border-t">
						<h4 className="font-medium text-[#2D2A24] mb-2">General Voter Resources</h4>
						<div className="space-y-1 text-sm">
							<a
								href="https://www.ncsbe.gov/registering/how-register"
								target="_blank"
								rel="noopener noreferrer"
								className="block text-sage hover:underline"
							>
								Register to Vote Online
							</a>
							<a
								href="https://www.ncsbe.gov/registering/checking-your-registration"
								target="_blank"
								rel="noopener noreferrer"
								className="block text-sage hover:underline"
							>
								Check Your Registration Status
							</a>
							<a
								href="https://www.ncsbe.gov/voting/vote-mail"
								target="_blank"
								rel="noopener noreferrer"
								className="block text-sage hover:underline"
							>
								Absentee Voting Information
							</a>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
