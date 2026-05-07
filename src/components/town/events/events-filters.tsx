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

const CATEGORY_LABELS: Record<string, string> = {
	government: "Government",
	community: "Community",
	recreation: "Recreation",
	education: "Education",
	arts: "Arts & Culture",
	sports: "Sports",
	volunteer: "Volunteer",
	meetings: "Meetings",
	market: "Markets",
	festival: "Festival",
};

function formatCategoryLabel(value: string): string {
	return CATEGORY_LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMonthLabel(ym: string): string {
	const [year, month] = ym.split("-");
	if (!year || !month) return ym;
	const d = new Date(Number(year), Number(month) - 1, 1);
	return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

interface EventsFiltersProps {
	availableCategories: string[];
	availableMonths: string[];
}

export function EventsFilters({ availableCategories, availableMonths }: EventsFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentCategory = searchParams?.get("category") || "all";
	const currentMonth = searchParams?.get("month") || "all";

	const updateFilters = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams?.toString() ?? "");
		if (value && value !== "all") {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.delete("page");
		router.push(`/events?${params.toString()}`);
	};

	const clearFilters = () => {
		router.push("/events");
	};

	const hasActiveFilters = currentCategory !== "all" || currentMonth !== "all";

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="text-sm font-medium">Filters</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{availableCategories.length > 0 && (
					<div className="space-y-1.5">
						<Label htmlFor="category" className="text-xs">Category</Label>
						<Select
							value={currentCategory}
							onValueChange={(value) => updateFilters("category", value)}
						>
							<SelectTrigger id="category" aria-label="Filter by category" className="h-9 text-sm">
								<SelectValue placeholder="All categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All categories</SelectItem>
								{availableCategories.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{formatCategoryLabel(cat)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{availableMonths.length > 0 && (
					<div className="space-y-1.5">
						<Label htmlFor="month" className="text-xs">Month</Label>
						<Select value={currentMonth} onValueChange={(value) => updateFilters("month", value)}>
							<SelectTrigger id="month" aria-label="Filter by month" className="h-9 text-sm">
								<SelectValue placeholder="All months" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All months</SelectItem>
								{availableMonths.map((ym) => (
									<SelectItem key={ym} value={ym}>
										{formatMonthLabel(ym)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{hasActiveFilters && (
					<Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
						Clear filters
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
