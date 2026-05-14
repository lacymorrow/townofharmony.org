import type { Metadata } from "next";
import Link from "next/link";
import { businesses } from "@/data/town/businesses";

export const metadata: Metadata = {
	title: "Business Directory | Town of Harmony",
	description:
		"Civic and community listings in Harmony, NC. For the full local business directory, see the interactive map.",
};

export default function BusinessDirectoryPage() {
	const featured = businesses.filter((b) => b.isFeatured);
	const others = businesses.filter((b) => !b.isFeatured);

	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				<header className="mb-8">
					<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
						Civic Directory
					</h1>
					<p className="text-[#4A4640] mt-2">
						Civic and community organizations serving Harmony. For local
						restaurants, retail, services and more, see the{" "}
						<Link href="/map" className="text-sage-dark underline">
							interactive map
						</Link>
						.
					</p>
				</header>

				{[...featured, ...others].map((b) => (
					<div
						key={b.id}
						className="bg-white rounded-lg border border-stone p-5 mb-4"
					>
						<p className="text-sm font-bold text-sage uppercase">
							{b.category}
						</p>
						<h2 className="text-lg font-serif font-bold text-sage-dark mt-1">
							{b.name}
						</h2>
						<p className="text-[#2D2A24] text-base mt-1">{b.description}</p>
						<dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm text-[#4A4640]">
							<div>
								<dt className="font-semibold inline">Address: </dt>
								<dd className="inline">
									{b.address}, {b.city}, {b.stateCode} {b.zipCode}
								</dd>
							</div>
							<div>
								<dt className="font-semibold inline">Phone: </dt>
								<dd className="inline">
									<a
										href={`tel:${b.phone.replace(/[^0-9+]/g, "")}`}
										className="hover:underline"
									>
										{b.phone}
									</a>
								</dd>
							</div>
							<div>
								<dt className="font-semibold inline">Hours: </dt>
								<dd className="inline">{b.hours}</dd>
							</div>
							{b.website && (
								<div>
									<dt className="font-semibold inline">Website: </dt>
									<dd className="inline">
										<a
											href={b.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sage-dark hover:underline"
										>
											{b.website}
										</a>
									</dd>
								</div>
							)}
						</dl>
					</div>
				))}
			</div>
		</section>
	);
}
