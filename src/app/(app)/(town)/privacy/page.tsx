import type { Metadata } from "next";
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Privacy policy for the Town of Harmony website. Learn how we collect, use, and protect your information.",
	alternates: {
		canonical: `${siteConfig.url}/privacy`,
	},
};

export default function PrivacyPage() {
	return (
		<main id="main-content" className="container mx-auto px-4 py-12 max-w-3xl">
			<h1 className="text-3xl font-serif font-bold text-sage-dark mb-8">
				Privacy Policy
			</h1>

			<div className="prose prose-stone max-w-none space-y-6">
				<p className="text-lg text-[#4A4640]">
					The Town of Harmony is committed to protecting the privacy of visitors
					to our website. This policy explains what information we collect and
					how it is used.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Information We Collect
				</h2>
				<p>
					We may collect anonymous usage data through our analytics service to
					understand how visitors use our website. This includes pages visited,
					time spent on the site, and general geographic location. No personally
					identifiable information is collected through analytics.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Contact Forms
				</h2>
				<p>
					When you submit a contact form, we collect the information you provide
					(such as your name, email address, and message). This information is
					used only to respond to your inquiry and is not shared with third
					parties.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Third-Party Services
				</h2>
				<p>
					Our website may contain links to external sites. We are not
					responsible for the privacy practices of other websites. We encourage
					you to review the privacy policies of any external sites you visit.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Public Records
				</h2>
				<p>
					As a municipal government, certain records are subject to public
					records laws under the North Carolina Public Records Act (N.C.G.S.
					Chapter 132). Information submitted through government forms may be
					considered public record.
				</p>

				<h2 className="text-xl font-semibold text-sage-dark mt-8">
					Contact Us
				</h2>
				<p>
					If you have questions about this privacy policy, please contact us at{" "}
					<a
						href="mailto:admin@townofharmony.org"
						className="text-sage hover:text-sage-dark underline"
					>
						admin@townofharmony.org
					</a>{" "}
					or call <a href="tel:7045462339" className="text-sage hover:text-sage-dark underline">(704) 546-2339</a>.
				</p>

				<p className="text-sm text-[#635E56] mt-12">
					Last updated: March 2026
				</p>
			</div>
		</main>
	);
}
