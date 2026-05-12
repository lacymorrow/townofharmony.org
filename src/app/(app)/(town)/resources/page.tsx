import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { resources } from "@/data/town/resources";

export const metadata: Metadata = {
	title: "Resources | Town of Harmony",
	description:
		"Documents, services, and helpful links for residents of the Town of Harmony, NC.",
};

export default function ResourcesPage() {
	const sorted = [...resources].sort((a, b) => a.sortOrder - b.sortOrder);

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				<header className="mb-8">
					<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
						Resources
					</h1>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{sorted.map((r) => {
						const isDocument = r.type === "document" && r.externalUrl;
						const opensInBrowser = !isDocument && r.externalUrl?.startsWith("http");
						const cardClass = "block bg-white rounded-lg border border-stone p-5 hover:border-sage transition-colors text-left w-full";
						const Wrapper = (
							{ children }: { children: React.ReactNode },
						) =>
							isDocument ? (
								<Link
									href={`/resources/${r.slug}`}
									className={cardClass}
									id={r.slug}
								>
									{children}
								</Link>
							) : r.externalUrl ? (
								opensInBrowser ? (
									<a
										href={r.externalUrl}
										target="_blank"
										rel="noopener noreferrer"
										className={cardClass}
									>
										{children}
									</a>
								) : (
									<Link
										href={r.externalUrl}
										className={cardClass}
									>
										{children}
									</Link>
								)
							) : (
								<div className="block bg-white rounded-lg border border-stone p-5">
									{children}
								</div>
							);

						return (
							<Wrapper key={r.id}>
								<p className="text-sm font-bold text-sage uppercase">
									{r.category}
								</p>
								<h2 className="text-lg font-serif font-bold text-sage-dark mt-1">
									{r.title}
									{r.externalUrl?.startsWith("http") && (
										<ExternalLink className="inline-block ml-1.5 w-4 h-4 text-sage align-middle" aria-hidden="true" />
									)}
								</h2>
								<p className="text-base text-[#4A4640] mt-2">{r.description}</p>
								{r.contactPhone && (
									<p className="mt-3 flex items-center gap-2">
										<span className="text-sm font-medium text-[#635E56]">Phone:</span>
										{r.externalUrl ? (
											<span className={`font-bold ${r.contactPhone === "911" ? "text-barn-red text-xl" : "text-sage text-lg"}`}>
												{r.contactPhone}
											</span>
										) : (
											<a
												href={`tel:${r.contactPhone.replace(/[^\d+]/g, "")}`}
												className={`font-bold hover:underline ${r.contactPhone === "911" ? "text-barn-red text-xl" : "text-sage text-lg"}`}
											>
												{r.contactPhone}
											</a>
										)}
									</p>
								)}
							</Wrapper>
						);
					})}
				</div>
			</div>
		</section>
	);
}
