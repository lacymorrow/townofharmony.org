import type { Metadata } from "next";
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
	title: "Tomlinson-Moore Family Park Reservation | Town of Harmony, NC",
	description:
		"Reserve the Tomlinson-Moore Family Park picnic shelter in Harmony, NC. Find rental rules, availability, and contact information for park reservations.",
	alternates: {
		canonical: `${siteConfig.url}/resources/park-reservation`,
	},
	openGraph: {
		title: "Tomlinson-Moore Family Park Reservation",
		description:
			"Reserve the Tomlinson-Moore Family Park picnic shelter in Harmony, NC. Find rental rules, availability, and contact information for park reservations.",
		url: `${siteConfig.url}/resources/park-reservation`,
	},
};

export default function ParkReservationPage() {
	return (
		<article className="py-12 bg-cream">
			<div className="container mx-auto px-4 max-w-3xl">
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark mb-4">
					Tomlinson-Moore Family Park Reservation
				</h1>
				<p className="text-[#2D2A24] mb-6">
					The Tomlinson-Moore Family Park picnic shelter (187 Highland Point
					Ave) may be reserved for events. Reservation of the shelter does not
					include exclusive use of the park or the Community Center.
				</p>

				<div className="bg-white border border-stone rounded p-5 mb-8">
					<p className="font-semibold">Town Hall</p>
					<p>
						<a
							href="tel:7045462339"
							className="text-sage-dark hover:underline"
						>
							(704) 546-2339
						</a>
					</p>
					<p className="text-sm text-[#4A4640] mt-2">
						3389 Harmony Hwy, Harmony, NC 28634<br />
						Monday – Friday, 9:00 AM – 5:00 PM
					</p>
				</div>

				<h2 className="text-2xl font-serif font-bold text-sage-dark mb-3">
					Reservation Rules
				</h2>
				<ul className="list-disc list-inside space-y-1 text-[#2D2A24] mb-6">
					<li>Reservation must be submitted before the month of the event</li>
					<li>Park hours: dawn to dusk</li>
					<li>No alcohol, drugs, or firearms</li>
					<li>No animals, bicycles, or skateboards</li>
					<li>Only small stereo systems allowed</li>
					<li>Bouncy houses and similar apparatus are not permitted on town property at any time</li>
					<li>Up to 6 tables available; no exclusive use of park</li>
					<li>You must remove your event trash — do not use the park's trash cans</li>
					<li>Failure to comply forfeits deposit</li>
				</ul>

				<p className="text-[#2D2A24]">
					Report issues during your reservation to Town Hall at{" "}
					<a href="tel:7045462339" className="text-sage-dark hover:underline">
						(704) 546-2339
					</a>
					.
				</p>
			</div>
		</article>
	);
}
