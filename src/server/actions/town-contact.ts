"use server";

import { z } from "zod";
import { siteConfig } from "@/config/site-config";
import { townContactConfirmationEmail, townContactNotificationEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import {
	checkContactFormRateLimit,
	getClientIp,
	validateSubmissionTiming,
} from "@/server/utils/contact-rate-limit";

const INQUIRY_VALUES = [
	"general",
	"sewer-residential",
	"sewer-nonresidential-intown",
	"sewer-nonresidential-outtown",
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
	"sewer-nonresidential-intown": "Sewer In-Town Nonresidential Service",
	"sewer-nonresidential-outtown": "Sewer Out-of-Town Nonresidential Service",
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

// _loadedAt is an anti-bot timing field kept outside the validated schema
export async function submitTownContactForm(
	formData: TownContactFormData & { _loadedAt?: string },
) {
	const { _loadedAt, ...rest } = formData;
	const parsed = townContactSchema.safeParse(rest);
	if (!parsed.success) {
		return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
	}

	const { firstName, lastName, email, phone, inquiryType, message, attachment, turnstileToken, website } = parsed.data;

	const isLikelyBot = !!website;
	if (isLikelyBot) {
		logger.warn("Honeypot triggered", { context: "town-contact-form", action: "processing_anyway" });
	}
	const inquiryLabel = INQUIRY_LABELS[inquiryType];

	if (isTurnstileConfigured()) {
		if (turnstileToken) {
			if (!(await verifyTurnstileToken(turnstileToken))) {
				logger.warn("Turnstile verification failed", { context: "town-contact-form", action: "allowing_submission" });
			}
		} else {
			logger.warn("Turnstile token missing", { context: "town-contact-form", reason: "widget_load_failure" });
		}
	}

	const ip = await getClientIp();

	if (!validateSubmissionTiming(_loadedAt)) {
		logger.warn("Town contact form rejected: submitted too quickly", { ip });
		return { success: false, error: "Please take a moment before submitting." };
	}

	const rateLimit = await checkContactFormRateLimit(ip, "town-contact-form");
	if (!rateLimit.allowed) {
		return { success: false, error: rateLimit.error };
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
			from: `${siteConfig.name} Contact Form <${siteConfig.email.noreply}>`,
			to: [siteConfig.email.support],
			subject: `Contact Form: ${inquiryLabel} — ${firstName.replace(/[\r\n]/g, " ")} ${lastName.replace(/[\r\n]/g, " ")}`,
			replyTo: email,
			html: townContactNotificationEmail({
				firstName,
				lastName,
				email,
				phone,
				inquiryType: inquiryLabel,
				message,
			}),
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
			from: `${siteConfig.name} <${siteConfig.email.noreply}>`,
			to: [email],
			subject: `Your inquiry has been received — ${siteConfig.name}`,
			html: townContactConfirmationEmail({
				firstName,
				lastName,
				email,
				phone,
				inquiryType: inquiryLabel,
				message,
			}),
		});
	} catch (error) {
		console.error("Error sending town contact confirmation email:", error);
	}

	return { success: true };
}
