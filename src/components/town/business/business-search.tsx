"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BusinessSearch() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams(searchParams?.toString() ?? "");

		if (searchQuery) {
			params.set("search", searchQuery);
		} else {
			params.delete("search");
		}
		params.delete("page"); // Reset to page 1

		router.push(`/business?${params.toString()}`);
	};

	const clearSearch = () => {
		setSearchQuery("");
		const params = new URLSearchParams(searchParams?.toString() ?? "");
		params.delete("search");
		params.delete("page");
		router.push(`/business?${params.toString()}`);
	};

	return (
		<form onSubmit={handleSearch} className="relative">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search businesses by name or description..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-10"
						aria-label="Search businesses"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={clearSearch}
							className="absolute right-3 top-1/2 -translate-y-1/2"
							aria-label="Clear search"
						>
							<X className="h-4 w-4 text-muted-foreground hover:text-foreground" aria-hidden="true" />
						</button>
					)}
				</div>
				<Button type="submit">Search</Button>
			</div>
		</form>
	);
}
