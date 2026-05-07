"use server";

import { z } from "zod";
import { siteConfig } from "@/config/site-config";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";

const INQUIRY_VALUES = [
	"general",
	"sewer-residential",
	"sewer-commercial",
	"permits",
	"taxes",
	"parks",
	"roads",
	"suggestion",
	"other",
] as const;

const INQUIRY_LABELS: Record<(typeof INQUIRY_VALUES)[number], string> = {
	general: "General Inquiry",
	"sewer-residential": "Sewer Residential Service",
	"sewer-commercial": "Sewer Commercial Service",
	permits: "Permits & Zoning",
	taxes: "Taxes & Billing",
	parks: "Parks & Recreation",
	roads: "Roads & Infrastructure",
	suggestion: "Suggestion",
	other: "Other",
};

const ALLOWED_ATTACHMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

const attachmentSchema = z
	.object({
		filename: z.string(),
		content: z.string(),
		contentType: z.enum(ALLOWED_ATTACHMENT_TYPES),
	})
	.refine((data) => data.content.length * 0.75 <= MAX_ATTACHMENT_BYTES, {
		message: "File must be 3 MB or smaller.",
	});
const townContactSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	inquiryType: z.enum(INQUIRY_VALUES, { message: "Please select an inquiry type" }),
	message: z.string().min(10, "Message must be at least 10 characters"),
	attachment: attachmentSchema.optional(),
	turnstileToken: z.string().optional(),
	website: z.string().optional(),
});

export type TownContactFormData = z.infer<typeof townContactSchema>;

const esc = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function submitTownContactForm(formData: TownContactFormData) {
	const parsed = townContactSchema.safeParse(formData);
	if (!parsed.success) {
		return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
	}

	const { firstName, lastName, email, phone, inquiryType, message, attachment, turnstileToken, website } = parsed.data;

	const isLikelyBot = !!website;
	if (isLikelyBot) {
		console.warn("[honeypot] town contact form honeypot triggered — processing anyway");
	}
	const inquiryLabel = INQUIRY_LABELS[inquiryType];

	if (isTurnstileConfigured()) {
		if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken))) {
			return { success: false, error: "Security check failed. Please try again." };
		}
	}

	if (!resend) {
		console.warn("Resend client not initialized - RESEND_API_KEY not set");
		return {
			success: false,
			error: "Email service is not configured. Please call Town Hall directly.",
		};
	}

	try {
		await resend.emails.send({
			from: `Town of Harmony Contact Form <${siteConfig.email.noreply}>`,
			to: [siteConfig.email.support],
			subject: `${isLikelyBot ? "[POSSIBLE SPAM] " : ""}Contact Form: ${inquiryLabel} — ${esc(firstName)} ${esc(lastName)}`,
			replyTo: email,
			html: `
<h2>New Contact Form Submission</h2>
<table style="border-collapse:collapse;">
<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name</td><td>${esc(firstName)} ${esc(lastName)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td>${esc(email)}</td></tr>
${phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Phone</td><td>${esc(phone)}</td></tr>` : ""}
<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Inquiry Type</td><td>${esc(inquiryLabel)}</td></tr>
</table>
<h3>Message</h3>
<p>${esc(message).replace(/\n/g, "<br>")}</p>
      `.trim(),
			...(attachment
				? {
						attachments: [
							{
								filename: attachment.filename,
								content: attachment.content,
								contentType: attachment.contentType,
							},
						],
					}
				: {}),
		});
	} catch (error) {
		console.error("Error sending town contact form email:", error);
		return {
			success: false,
			error: "Failed to send your message. Please try again or call Town Hall.",
		};
	}

	try {
		await resend.emails.send({
			from: `Town of Harmony <${siteConfig.email.noreply}>`,
			to: [email],
			subject: "Your message to the Town of Harmony",
			html: `
<p>Dear ${esc(firstName)},</p>
<p>Thank you! Your message has been forwarded to the Town of Harmony.</p>
<p>We will respond to your inquiry within 2 business days.</p>
<p>Town of Harmony<br>
<a href="https://townofharmony.org">townofharmony.org</a></p>
      `.trim(),
		});
	} catch (error) {
		console.error("Error sending auto-reply email:", error);
	}

	return { success: true };
}
