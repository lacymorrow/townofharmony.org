import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About the Town of Harmony",
	description:
		"Learn about the Town of Harmony, North Carolina. Discover our history, government structure, community values, and what makes Harmony a great place to live.",
};

export default function AboutPage() {
	return (
		<main id="main-content" className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-3xl font-serif font-bold text-sage-dark mb-8">
				About Town of Harmony, NC
			</h1>

			<div className="prose prose-stone max-w-none space-y-6">
				<p className="text-lg text-[#4A4640]">
					Harmony is a small town located in Iredell County, North Carolina.
					Incorporated in 1905, the town has grown into a close-knit community
					proud of its history, natural beauty, and welcoming spirit.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Our Government
				</h2>
				<p>
					The Town of Harmony is governed by a Board of Aldermen and a Mayor.
					The board meets regularly to address town business, hear from
					residents, and make decisions that shape the community. All meetings
					are open to the public.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Community Services
				</h2>
				<p>
					We provide essential municipal services including sewer operations,
					public spaces, and community facilities. Our goal is to maintain a
					safe, clean, and welcoming environment for all residents and visitors.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Location
				</h2>
				<p>
					Harmony is located in southern Iredell County, approximately 35 miles
					north of Charlotte, North Carolina. The town sits near the crossroads
					of US-21 and NC-901.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Contact Us
				</h2>
				<p>
					Have questions about the Town of Harmony? Contact us at{" "}
					<a
						href="mailto:info@townofharmony.org"
						className="text-sage hover:text-sage-dark underline"
					>
						info@townofharmony.org
					</a>{" "}
					or call{" "}
					<a
						href="tel:7045462339"
						className="text-sage hover:text-sage-dark underline"
					>
						(704) 546-2339
					</a>
					.
				</p>
			</div>
		</main>
	);
}
