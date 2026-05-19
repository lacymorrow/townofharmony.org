import type { Metadata } from "next";
import { siteConfig } from "@/config/site-config";
import { pointsOfInterest } from "@/data/town/points-of-interest";

export const metadata: Metadata = {
	title: "Points of Interest | Town of Harmony, NC",
	description:
		"Explore parks, landmarks, and notable locations in Harmony, NC. Find parks, community spaces, and local attractions in the Town of Harmony, North Carolina.",
	alternates: { canonical: `${siteConfig.url}/points-of-interest` },
	openGraph: {
		title: "Points of Interest in Harmony, NC",
		description:
			"Explore parks, landmarks, and notable locations in Harmony, NC. Find parks, community spaces, and local attractions in the Town of Harmony, North Carolina.",
		url: `${siteConfig.url}/points-of-interest`,
	},
};

export default function PointsOfInterestPage() {
	return (
		<section className="py-12 bg-cream">
			<div className="container mx-auto px-4">
				<header className="mb-8">
					<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
						Points of Interest
					</h1>
				</header>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{pointsOfInterest.map((p) => (
						<div
							key={p.id}
							className="bg-white rounded-lg border border-stone p-5"
						>
							<p className="text-sm font-bold text-sage uppercase">
								{p.category}
							</p>
							<h2 className="text-lg font-serif font-bold text-sage-dark mt-1">
								{p.name}
							</h2>
							<p className="text-base text-[#635E56] mt-1">{p.address}</p>
							<p className="text-[#2D2A24] text-base mt-2">{p.description}</p>
							<p className="text-sm text-[#635E56] mt-3">
								<strong>Hours:</strong> {p.hours}
							</p>
							{p.phone && (
								<p className="text-sm text-[#635E56] mt-1">
									<strong>Phone:</strong>{" "}
									<a
										href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}
										className="hover:underline"
									>
										{p.phone}
									</a>
								</p>
							)}
							{p.amenities.length > 0 && (
								<p className="text-sm text-[#635E56] mt-2">
									<strong>Amenities:</strong> {p.amenities.join(", ")}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
