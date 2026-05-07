"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const MEETING_TYPE_LABELS: Record<string, string> = {
	Council: "Board of Aldermen",
	Planning: "Planning",
	"Public Hearing": "Public Hearing",
};

const STATUS_LABELS: Record<string, string> = {
	upcoming: "Upcoming",
	past: "Past",
	"has-minutes": "Has Minutes",
	"has-recordings": "Has Recordings",
};

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

interface MeetingsFiltersProps {
	availableTypes: string[];
	availableYears: number[];
	availableStatuses: string[];
}

export function MeetingsFilters({ availableTypes, availableYears, availableStatuses }: MeetingsFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentType = searchParams?.get("type") || "all";
	const currentStatus = searchParams?.get("status") || "all";
	const currentMonth = searchParams?.get("month") || "all";
	const currentYear = searchParams?.get("year") || "all";

	const hasActiveFilters =
		currentType !== "all" ||
		currentStatus !== "all" ||
		currentMonth !== "all" ||
		currentYear !== "all";

	const updateFilters = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams?.toString() ?? "");
		if (value && value !== "all") {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.delete("page");
		router.push(`/meetings?${params.toString()}`);
	};

	const clearFilters = () => {
		router.push("/meetings");
	};

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-medium">Filters</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{availableTypes.length > 0 && (
					<div className="space-y-1.5">
						<Label htmlFor="type" className="text-xs">Meeting Type</Label>
						<Select value={currentType} onValueChange={(value) => updateFilters("type", value)}>
							<SelectTrigger id="type" aria-label="Filter by meeting type" className="h-9 text-sm">
								<SelectValue placeholder="All types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								{availableTypes.map((t) => (
									<SelectItem key={t} value={t}>
										{MEETING_TYPE_LABELS[t] ?? t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{availableStatuses.length > 0 && (
					<div className="space-y-1.5">
						<Label htmlFor="status" className="text-xs">Status</Label>
						<Select value={currentStatus} onValueChange={(value) => updateFilters("status", value)}>
							<SelectTrigger id="status" aria-label="Filter by status" className="h-9 text-sm">
								<SelectValue placeholder="All meetings" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All meetings</SelectItem>
								{availableStatuses.map((s) => (
									<SelectItem key={s} value={s}>
										{STATUS_LABELS[s] ?? s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{availableYears.length > 0 && (
					<div className="space-y-1.5">
						<Label htmlFor="year" className="text-xs">Year</Label>
						<Select value={currentYear} onValueChange={(value) => updateFilters("year", value)}>
							<SelectTrigger id="year" aria-label="Filter by year" className="h-9 text-sm">
								<SelectValue placeholder="All years" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All years</SelectItem>
								{availableYears.map((y) => (
									<SelectItem key={y} value={String(y)}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="space-y-1.5">
					<Label htmlFor="month" className="text-xs">Month</Label>
					<Select value={currentMonth} onValueChange={(value) => updateFilters("month", value)}>
						<SelectTrigger id="month" aria-label="Filter by month" className="h-9 text-sm">
							<SelectValue placeholder="All months" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All months</SelectItem>
							{MONTHS.map((m) => (
								<SelectItem key={m.value} value={m.value}>
									{m.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{hasActiveFilters && (
					<Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
						Clear filters
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
