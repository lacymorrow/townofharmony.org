"use client";

import { Calendar, CheckCircle, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const statusFilters = [
	{ value: "all", label: "All Elections", icon: Calendar },
	{ value: "upcoming", label: "Upcoming", icon: Calendar },
	{ value: "today", label: "Today", icon: CheckCircle },
	{ value: "past", label: "Past Elections", icon: Calendar },
];

interface ElectionsFiltersProps {
	currentStatus: string;
	currentSearch: string;
}

export function ElectionsFilters({ currentStatus, currentSearch }: ElectionsFiltersProps) {
	const router = useRouter();

	const handleStatusChange = (status: string) => {
		const params = new URLSearchParams();
		if (status && status !== "all") params.set("status", status);
		if (currentSearch) params.set("search", currentSearch);
		router.push(`/elections?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const search = formData.get("search") as string;

		const params = new URLSearchParams();
		if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
		if (search) params.set("search", search);
		router.push(`/elections?${params.toString()}`);
	};

	return (
		<div className="space-y-6">
			{/* Search */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-4 w-4" />
						Search Elections
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSearch}>
						<div className="flex gap-2">
							<Input
								name="search"
								placeholder="Search elections..."
								defaultValue={currentSearch}
								className="flex-1"
							/>
							<Button type="submit" size="icon" aria-label="Search elections">
								<Search className="h-4 w-4" />
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Status Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						Election Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2" role="group" aria-label="Filter by election status">
						{statusFilters.map((status) => {
							const Icon = status.icon;
							return (
								<button
									key={status.value}
									type="button"
									onClick={() => handleStatusChange(status.value)}
									aria-pressed={(currentStatus || "all") === status.value}
									className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-md transition-colors ${
										(currentStatus || "all") === status.value
											? "bg-stone text-[#2D2A24]"
											: "hover:bg-stone"
									}`}
								>
									<Icon className="h-4 w-4" aria-hidden="true" />
									{status.label}
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Quick Links */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Voter Resources
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm">
						<li>
							<a
								href="https://www.ncsbe.gov/registering/how-register"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sage hover:underline"
							>
								Register to Vote
							</a>
						</li>
						<li>
							<a
								href="https://www.ncsbe.gov/registering/checking-your-registration"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sage hover:underline"
							>
								Check Registration Status
							</a>
						</li>
						<li>
							<a
								href="https://www.ncsbe.gov/voting"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sage hover:underline"
							>
								Voter Education
							</a>
						</li>
						<li>
							<a
								href="https://www.ncsbe.gov/voting/vote-mail"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sage hover:underline"
							>
								Absentee Voting
							</a>
						</li>
					</ul>
				</CardContent>
			</Card>

			{/* Important Dates */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						Key Dates
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm text-[#4A4640]">
						<p>
							<strong>Registration Deadline:</strong>
							<br />
							21 days before each election
						</p>
						<p>
							<strong>Early Voting:</strong>
							<br />
							13 days before through 3 days before election
						</p>
						<p>
							<strong>Polling Hours:</strong>
							<br />
							6:30 AM - 7:30 PM on Election Day
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
