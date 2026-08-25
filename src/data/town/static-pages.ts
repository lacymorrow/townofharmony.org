/**
 * Seed content for the `town-static-page` Builder.io data model.
 *
 * Editable prose for a small set of hardcoded routes (/about, /accessibility,
 * /privacy). The `body` field is HTML that Builder's rich text editor produces
 * and consumers render via sanitizeHtml + dangerouslySetInnerHTML.
 *
 * These are seed values only — the actual page components fall back to their
 * built-in JSX when Builder returns nothing, so this file is not read at
 * request time.
 *
 * Any contact info baked into the HTML here matches the current Town settings
 * at seed time. Once an editor changes copy in Builder, dynamic settings
 * substitution is lost — that's the intentional trade-off for editability.
 */

export interface TownStaticPage {
	slug: string;
	title: string;
	body: string;
}

export const staticPages: TownStaticPage[] = [
	{
		slug: "about",
		title: "About Town of Harmony, NC",
		body: `<p>Harmony is a small town located in Iredell County, North Carolina. Incorporated in 1927, the town has grown into a close-knit community proud of its history, natural beauty, and welcoming spirit. With a population of roughly 500 residents, Harmony maintains the small-town character and neighborly atmosphere that make it a special place to call home.</p>
<h2>Our Government</h2>
<p>The Town of Harmony is governed by a Town Council and a Mayor. The Council meets regularly to address town business, hear from residents, and make decisions that shape the community. All meetings are open to the public and we encourage residents to attend and participate. Meeting agendas and minutes are posted to this website so every citizen can stay informed about local decisions.</p>
<h2>Community &amp; Parks</h2>
<p>Harmony offers a rich community life centered around its parks and public gathering spaces. The Tomlinson-Moore Family Park provides picnic shelters, playgrounds, and open green space for families and community events throughout the year. The Harmony Community Center hosts local gatherings, private events, and serves as a hub for civic activity. The town's annual Farmers Market brings residents together and supports local agriculture and small business.</p>
<p>The Thread Trail, a regional multi-use greenway, passes through the area and gives residents easy access to miles of walking and cycling paths. The Camp Meeting Grounds, a historic landmark, reflects the town's deep-rooted heritage and continues to host community events today.</p>
<h2>Municipal Services</h2>
<p>We provide essential municipal services to keep Harmony safe, clean, and functioning well. These include sewer operations for in-town and out-of-town properties, maintenance of public streets and common areas, and oversight of community facilities. Town Hall is open Monday - Friday: 9:00 AM - 5:00 PM, and staff are available to assist residents with billing questions, permits, and general inquiries.</p>
<h2>Location</h2>
<p>Harmony is located in southern Iredell County, approximately 35 miles north of Charlotte, North Carolina. The town sits near the crossroads of US-21 and NC-901, making it easily accessible while preserving its quiet, rural character. Nearby communities include Statesville to the north and Mooresville to the east.</p>
<h2>Contact Us</h2>
<p>Have questions about the Town of Harmony? We're here to help. Reach us at <a href="mailto:info@townofharmony.org">info@townofharmony.org</a> or call <a href="tel:+17045462339">(704) 546-2339</a>. Town Hall is located at 3389 Harmony Hwy, Harmony, NC 28634.</p>`,
	},
	{
		slug: "accessibility",
		title: "Accessibility Statement",
		body: `<p>The Town of Harmony is committed to ensuring that our website is accessible to all visitors, including people with disabilities. We strive to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.</p>
<h2>Our Commitment</h2>
<p>As a municipal government website, we recognize our responsibility to provide equal access to information and services for all residents and visitors. We continuously work to improve the accessibility of our website.</p>
<h2>Accessibility Features</h2>
<ul>
<li>Keyboard navigation support throughout the site</li>
<li>Skip-to-content links for screen reader users</li>
<li>Descriptive alt text for images</li>
<li>Sufficient color contrast for text readability</li>
<li>Semantic HTML structure with proper heading hierarchy</li>
<li>Form labels and ARIA attributes for interactive elements</li>
<li>Responsive design that works across devices and screen sizes</li>
</ul>
<h2>Known Limitations</h2>
<p>Some content managed through our content management system may not fully meet all accessibility standards. We are working to address these issues. If you encounter any accessibility barriers, please let us know.</p>
<h2>Feedback and Assistance</h2>
<p>If you have difficulty accessing any part of our website or need information in an alternative format, please contact us:</p>
<ul>
<li>Contact: <a href="/contact">Contact form</a></li>
<li>Phone: <a href="tel:+17045462339">(704) 546-2339</a></li>
<li>Address: 3389 Harmony Hwy, Harmony, NC 28634</li>
</ul>
<p>We will make every effort to provide the information you need in an accessible format within a reasonable timeframe.</p>
<p><em>Last updated: March 2026</em></p>`,
	},
	{
		slug: "privacy",
		title: "Privacy Policy",
		body: `<p>The Town of Harmony is committed to protecting the privacy of visitors to our website. This policy explains what information we collect and how it is used.</p>
<h2>Information We Collect</h2>
<p>We may collect anonymous usage data through our analytics service to understand how visitors use our website. This includes pages visited, time spent on the site, and general geographic location. No personally identifiable information is collected through analytics.</p>
<h2>Contact Forms</h2>
<p>When you submit a contact form, we collect the information you provide (such as your name, email address, and message). This information is used only to respond to your inquiry and is not shared with third parties.</p>
<h2>Third-Party Services</h2>
<p>Our website may contain links to external sites. We are not responsible for the privacy practices of other websites. We encourage you to review the privacy policies of any external sites you visit.</p>
<h2>Public Records</h2>
<p>As a municipal government, certain records are subject to public records laws under the North Carolina Public Records Act (N.C.G.S. Chapter 132). Information submitted through government forms may be considered public record.</p>
<h2>Contact Us</h2>
<p>If you have questions about this privacy policy, please use our <a href="/contact">contact form</a> or call <a href="tel:+17045462339">(704) 546-2339</a>.</p>
<p><em>Last updated: March 2026</em></p>`,
	},
];
