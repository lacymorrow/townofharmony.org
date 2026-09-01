"use server";

import { z } from "zod";
import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { contactInquiryTypes } from "@/data/town/contact-inquiry-types";
import type { TownContactInquiryType } from "@/data/town/types";
import { fetchBuilderContent } from "@/lib/builder-data-server";
import { townContactConfirmationEmail, townContactNotificationEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import {
	checkContactFormRateLimit,
	getClientIp,
	validateSubmissionTiming,
} from "@/server/utils/contact-rate-limit";

/**
 * Inquiry types live in the Builder.io `town-contact-inquiry-type` data model
 * so town staff can manage them via the CMS. The local list in
 * `data/town/contact-inquiry-types.ts` is the fallback when Builder is
 * unreachable or returns no entries.
 */
async function loadInquiryTypes(): Promise<TownContactInquiryType[]> {
	try {
		// Sort matches the form's fetch so server-side validation sees the same
		// active list the client rendered. Order doesn't affect validation, but
		// keeping options aligned avoids surprises if we ever need to pick "the
		// first one" as a default.
		const { results } = await fetchBuilderContent<TownContactInquiryType>(
			"town-contact-inquiry-type",
			{ sort: { priority: -1 } },
		);
		const active = (results ?? []).filter(
			(t) => t?.value && t?.label && t?.isActive !== false,
		);
		if (active.length > 0) return active;
	} catch (err) {
		logger.warn("Failed to load inquiry types from Builder, using fallback", {
			error: err instanceof Error ? err.message : String(err),
		});
	}
	return contactInquiryTypes.filter((t) => t.isActive !== false);
}

// Town inquiries route to the shared staff inbox. Recipients are overridable
// via env (comma-separated) so town staff can re-point routing without a code
// deploy; defaults reflect Janet's 2026-08 request (LAC-3312).
const DEFAULT_TOWN_CONTACT_TO = "exploreharmonync@gmail.com";
const DEFAULT_TOWN_CONTACT_BCC = "harmonync@yadtel.net";

const parseEmailList = (value: string | undefined): string[] =>
	(value ?? "")
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);

const townContactToRecipients = (): string[] => {
	const configured = parseEmailList(env.TOWN_CONTACT_TO_EMAIL);
	return configured.length > 0 ? configured : [DEFAULT_TOWN_CONTACT_TO];
};

const townContactBccRecipients = (): string[] => {
	const configured = parseEmailList(env.TOWN_CONTACT_BCC_EMAIL);
	return configured.length > 0 ? configured : [DEFAULT_TOWN_CONTACT_BCC];
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

const countDigits = (value: string) => (value.match(/\d/g) ?? []).length;

const townContactSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().optional(),
		email: z
			.string()
			.trim()
			.email("Please enter a valid email address")
			.optional()
			.or(z.literal("").transform(() => undefined)),
		phone: z
			.string()
			.trim()
			.refine((value) => value.length === 0 || countDigits(value) >= 7, {
				message: "Please enter a valid phone number",
			})
			.transform((value) => (value.length === 0 ? undefined : value))
			.optional(),
		inquiryType: z.string().min(1, "Please select an inquiry type"),
		message: z.string().min(10, "Message must be at least 10 characters"),
		attachment: attachmentSchema.optional(),
		turnstileToken: z.string().optional(),
		website: z.string().optional(),
	})
	.refine((data) => Boolean(data.email) || Boolean(data.phone), {
		message: "Please provide an email address or a phone number so we can reply.",
		path: ["email"],
	});

export type TownContactFormData = z.infer<typeof townContactSchema>;

// _loadedAt is an anti-bot timing field kept outside the validated schema
export async function submitTownContactForm(
	formData: TownContactFormData & { _loadedAt?: string }
) {
	const { _loadedAt, ...rest } = formData;
	const parsed = townContactSchema.safeParse(rest);
	if (!parsed.success) {
		return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
	}

	const {
		firstName,
		lastName,
		email,
		phone,
		inquiryType,
		message,
		attachment,
		turnstileToken,
		website,
	} = parsed.data;

	const ip = await getClientIp();

	// Fail closed (LAC-3546): the soft-fail from LAC-980/LAC-1265 let bots
	// POST the action directly with no token and still reach staff inboxes.
	if (website) {
		logger.warn("Honeypot triggered", {
			context: "town-contact-form",
			ip,
			action: "dropped",
		});
		// Fake success so bots don't learn to leave the field empty.
		return { success: true };
	}

	if (isTurnstileConfigured()) {
		if (!turnstileToken) {
			logger.warn("Turnstile token missing", {
				context: "town-contact-form",
				ip,
				action: "rejected",
			});
			return {
				success: false,
				error:
					'Please check the "Verify you are human" box above the Send button, then try again. If it hasn\'t appeared yet, give it a moment — or call Town Hall.',
			};
		}
		if (!(await verifyTurnstileToken(turnstileToken))) {
			logger.warn("Turnstile verification failed", {
				context: "town-contact-form",
				ip,
				action: "rejected",
			});
			return {
				success: false,
				error:
					'The security check could not be verified. Please re-check the "Verify you are human" box and try again, or call Town Hall.',
			};
		}
	}

	if (!validateSubmissionTiming(_loadedAt)) {
		logger.warn("Town contact form rejected: submitted too quickly", { ip });
		return { success: false, error: "Please take a moment before submitting." };
	}

	// Bot checks come first so spam never costs a Builder.io fetch.
	const inquiryTypes = await loadInquiryTypes();
	const matched = inquiryTypes.find((t) => t.value === inquiryType);
	if (!matched) {
		return { success: false, error: "Please select an inquiry type" };
	}
	const inquiryLabel = matched.label;

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
			to: townContactToRecipients(),
			bcc: townContactBccRecipients(),
			subject: `Contact Form: ${inquiryLabel} — ${[firstName, lastName].filter(Boolean).join(" ").replace(/[\r\n]/g, " ")}`,
			...(email ? { replyTo: email } : {}),
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

	if (email) {
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
	}

	return { success: true };
}
