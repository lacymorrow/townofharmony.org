import type { Metadata } from "next";
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
	title: "Accessibility Statement | Town of Harmony, NC",
	description:
		"Accessibility statement for the Town of Harmony website. We are committed to making our website accessible to all users in Harmony, North Carolina.",
	alternates: {
		canonical: `${siteConfig.url}/accessibility`,
	},
	openGraph: {
		title: "Accessibility Statement — Town of Harmony, NC",
		description:
			"Accessibility statement for the Town of Harmony website. We are committed to making our website accessible to all users in Harmony, North Carolina.",
		url: `${siteConfig.url}/accessibility`,
	},
};

export default function AccessibilityPage() {
	return (
		<main id="main-content" className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-3xl font-serif font-bold text-sage-dark mb-8">
				Accessibility Statement
			</h1>

			<div className="prose prose-stone max-w-none space-y-6">
				<p className="text-lg text-[#4A4640]">
					The Town of Harmony is committed to ensuring that our website is
					accessible to all visitors, including people with disabilities. We
					strive to meet or exceed the Web Content Accessibility Guidelines
					(WCAG) 2.1 Level AA standards.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Our Commitment
				</h2>
				<p>
					As a municipal government website, we recognize our responsibility to
					provide equal access to information and services for all residents and
					visitors. We continuously work to improve the accessibility of our
					website.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Accessibility Features
				</h2>
				<ul className="list-disc pl-6 space-y-2">
					<li>Keyboard navigation support throughout the site</li>
					<li>Skip-to-content links for screen reader users</li>
					<li>Descriptive alt text for images</li>
					<li>Sufficient color contrast for text readability</li>
					<li>Semantic HTML structure with proper heading hierarchy</li>
					<li>Form labels and ARIA attributes for interactive elements</li>
					<li>Responsive design that works across devices and screen sizes</li>
				</ul>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Known Limitations
				</h2>
				<p>
					Some content managed through our content management system may not
					fully meet all accessibility standards. We are working to address
					these issues. If you encounter any accessibility barriers, please let
					us know.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Feedback and Assistance
				</h2>
				<p>
					If you have difficulty accessing any part of our website or need
					information in an alternative format, please contact us:
				</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						Contact:{" "}
						<a href="/contact" className="text-sage hover:text-sage-dark underline">
							Contact form
						</a>
					</li>
					<li>
						Phone:{" "}
						<a
							href="tel:7045462339"
							className="text-sage hover:text-sage-dark underline"
						>
							(704) 546-2339
						</a>
					</li>
					<li>
						Address: 3389 Harmony Hwy, Harmony, NC 28634
					</li>
				</ul>
				<p>
					We will make every effort to provide the information you need in an
					accessible format within a reasonable timeframe.
				</p>

				<p className="text-sm text-[#635E56] mt-12">
					Last updated: March 2026
				</p>
			</div>
		</main>
	);
}
