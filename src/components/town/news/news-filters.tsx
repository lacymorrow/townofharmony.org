"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CATEGORY_LABELS: Record<string, string> = {
	announcements: "Announcements",
	"public-safety": "Public Safety",
	community: "Community",
	government: "Government",
	events: "Events",
	"public-works": "Public Works",
};

function formatMonthLabel(ym: string): string {
	const [year, month] = ym.split("-");
	if (!year || !month) return ym;
	const d = new Date(Number(year), Number(month) - 1, 1);
	return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

interface NewsFiltersProps {
	currentCategory: string;
	currentSearch: string;
	availableCategories: string[];
	availableMonths: string[];
}

export function NewsFilters({ currentCategory, currentSearch, availableCategories, availableMonths }: NewsFiltersProps) {
	const router = useRouter();

	const handleCategoryChange = (category: string) => {
		const params = new URLSearchParams();
		if (category) params.set("category", category);
		if (currentSearch) params.set("search", currentSearch);
		router.push(`/news?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const search = formData.get("search") as string;

		const params = new URLSearchParams();
		if (currentCategory) params.set("category", currentCategory);
		if (search) params.set("search", search);
		router.push(`/news?${params.toString()}`);
	};

	return (
		<div className="space-y-6">
			{/* Search */}
			<Card>
				<CardHeader>
					<CardTitle>Search</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSearch}>
						<div className="flex gap-2">
							<Input
								name="search"
								placeholder="Search news..."
								defaultValue={currentSearch}
								className="flex-1"
								aria-label="Search news"
							/>
							<Button type="submit" size="icon" aria-label="Search news">
								<Search className="h-4 w-4" />
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Categories — only shown when there are published articles with categories */}
			{availableCategories.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Categories</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<button
								onClick={() => handleCategoryChange("")}
								className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
									currentCategory === ""
										? "bg-stone text-[#2D2A24]"
										: "hover:bg-stone"
								}`}
							>
								All Categories
							</button>
							{availableCategories.map((value) => (
								<button
									key={value}
									onClick={() => handleCategoryChange(value)}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
										currentCategory === value
											? "bg-stone text-[#2D2A24]"
											: "hover:bg-stone"
									}`}
								>
									{CATEGORY_LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1)}
								</button>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Archive — only shown when there are published articles */}
			{availableMonths.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Archive</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm">
							{availableMonths.map((ym) => (
								<li key={ym}>
									<a href={`/news?month=${ym}`} className="text-sage hover:underline">
										{formatMonthLabel(ym)}
									</a>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
