import type { Metadata } from "next";
import { siteConfig } from "@/config/site-config";
import { getMapUrl } from "@/lib/map-utils";
import { getBuilderSettings } from "@/lib/town-settings-server";

export const metadata: Metadata = {
	title: "About Harmony, NC | Town of Harmony",
	description:
		"Learn about the Town of Harmony, North Carolina. Discover our history, government structure, community values, and what makes Harmony a great place to live.",
	alternates: { canonical: `${siteConfig.url}/about` },
	openGraph: {
		title: "About the Town of Harmony, NC",
		description:
			"Learn about the Town of Harmony, North Carolina. Discover our history, government structure, community values, and what makes Harmony a great place to live.",
		url: `${siteConfig.url}/about`,
	},
};

export default async function AboutPage() {
	const settings = await getBuilderSettings();
	return (
		<main id="main-content" className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-3xl font-serif font-bold text-sage-dark mb-8">
				About Town of Harmony, NC
			</h1>

			<div className="prose prose-stone max-w-none space-y-6">
				<p className="text-lg text-[#4A4640]">
					Harmony is a small town located in Iredell County, North Carolina.
					Incorporated in 1905, the town has grown into a close-knit community
					proud of its history, natural beauty, and welcoming spirit. With a
					population of roughly 500 residents, Harmony maintains the small-town
					character and neighborly atmosphere that make it a special place to
					call home.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Our Government
				</h2>
				<p>
					The Town of Harmony is governed by a Town Council and a Mayor.
					The Council meets regularly to address town business, hear from
					residents, and make decisions that shape the community. All meetings
					are open to the public and we encourage residents to attend and
					participate. Meeting agendas and minutes are posted to this website so
					every citizen can stay informed about local decisions.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Community & Parks
				</h2>
				<p>
					Harmony offers a rich community life centered around its parks and
					public gathering spaces. The Tomlinson-Moore Family Park provides
					picnic shelters, playgrounds, and open green space for families and
					community events throughout the year. The Harmony Community Center
					hosts local gatherings, private events, and serves as a hub for civic
					activity. The town's annual Farmers Market brings residents together
					and supports local agriculture and small business.
				</p>
				<p>
					The Thread Trail, a regional multi-use greenway, passes through the
					area and gives residents easy access to miles of walking and cycling
					paths. The Camp Meeting Grounds, a historic landmark, reflects the
					town's deep-rooted heritage and continues to host community events
					today.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Municipal Services
				</h2>
				<p>
					We provide essential municipal services to keep Harmony safe, clean,
					and functioning well. These include sewer operations for in-town and
					out-of-town properties, maintenance of public streets and common areas,
					and oversight of community facilities. Town Hall is open{" "}
					{settings.officeHours.weekday}, and staff are available to assist
					residents with billing questions, permits, and general inquiries.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Location
				</h2>
				<p>
					Harmony is located in southern Iredell County, approximately 35 miles
					north of Charlotte, North Carolina. The town sits near the crossroads
					of US-21 and NC-901, making it easily accessible while preserving its
					quiet, rural character. Nearby communities include Statesville to the
					north and Mooresville to the east.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Contact Us
				</h2>
				<p>
					Have questions about the Town of Harmony? We're here to help. Reach
					us at{" "}
					<a
						href={`mailto:${settings.contactInfo.email}`}
						className="text-sage hover:text-sage-dark underline"
					>
						{settings.contactInfo.email}
					</a>{" "}
					or call{" "}
					<a
						href={`tel:${settings.contactInfo.phone.replace(/\D/g, "")}`}
						className="text-sage hover:text-sage-dark underline"
					>
						{settings.contactInfo.phone}
					</a>
					. Town Hall is located at{" "}
					<a
						href={getMapUrl(settings.contactInfo.address)}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sage hover:text-sage-dark underline"
					>
						{settings.contactInfo.address}
					</a>
					.
				</p>
			</div>
		</main>
	);
}
