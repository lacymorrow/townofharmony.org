import type { Metadata } from "next";
import { historyArticles } from "@/data/town/history";

export const metadata: Metadata = {
	title: "History | Town of Harmony",
	description:
		"The history of the Town of Harmony, NC — incorporated 1927.",
};

export default function HistoryPage() {
	const periods = historyArticles
		.filter((a) => a.type === "period")
		.sort((a, b) => a.sortOrder - b.sortOrder);
	const landmarks = historyArticles
		.filter((a) => a.type === "landmark")
		.sort((a, b) => a.sortOrder - b.sortOrder);

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				<header className="mb-10 max-w-3xl">
					<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
						History of Harmony
					</h1>
					<p className="text-[#4A4640] mt-3">
						Harmony, North Carolina was incorporated <strong>1927</strong>.
						The town takes its name from the Harmony Hill Camp Meetings, which
						were first held in 1846 on the grounds of the present-day Harmony
						Elementary School. The town sits at the crossroads of Highway 21 N
						and Highway 901 in north Iredell County. As of the 2020 census,
						Harmony's population was 543.
					</p>
				</header>

				<h2 className="text-2xl font-bold text-[#2D2A24] mb-6">Timeline</h2>
				<ol className="space-y-6 mb-12">
					{periods.map((p) => (
						<li
							key={p.id}
							className="bg-white rounded-lg border border-stone p-5"
						>
							<p className="text-xs font-bold text-sage uppercase">{p.era}</p>
							<h3 className="text-xl font-serif font-bold text-sage-dark mt-1">
								{p.title}
							</h3>
							<p className="text-[#2D2A24] mt-2">{p.content}</p>
							{p.highlights && p.highlights.length > 0 && (
								<ul className="mt-3 space-y-1 list-disc list-inside text-sm text-[#4A4640]">
									{p.highlights.map((h) => (
										<li key={h}>{h}</li>
									))}
								</ul>
							)}
						</li>
					))}
				</ol>

				<h2 className="text-2xl font-bold text-[#2D2A24] mb-6">Landmarks</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{landmarks.map((l) => (
						<div
							key={l.id}
							className="bg-white rounded-lg border border-stone p-5"
						>
							{l.year && (
								<p className="text-xs font-bold text-sage uppercase">{l.year}</p>
							)}
							<h3 className="text-lg font-serif font-bold text-sage-dark mt-1">
								{l.title}
							</h3>
							{l.address && (
								<p className="text-sm text-[#635E56] mt-1">{l.address}</p>
							)}
							<p className="text-[#2D2A24] text-sm mt-2">{l.content}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
