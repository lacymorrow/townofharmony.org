"use server";

import { siteConfig } from "@/config/site-config";
import { contactConfirmationEmail, contactNotificationEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { addContactToAudience } from "@/server/actions/subscribe";
import {
	checkContactFormRateLimit,
	getClientIp,
	validateSubmissionTiming,
} from "@/server/utils/contact-rate-limit";
import { contactFormSchema } from "@/types/contact";

export async function submitContactForm(formData: FormData) {
	try {
		const ip = await getClientIp();

		// Fail closed (LAC-3546): the soft-fail from LAC-980/LAC-1265 let bots
		// POST the action directly with no token and still reach staff inboxes.
		if (formData.get("website")) {
			logger.warn("Honeypot triggered", { context: "contact-form", ip, action: "dropped" });
			// Fake success so bots don't learn to leave the field empty.
			return { success: true };
		}

		if (isTurnstileConfigured()) {
			const token = formData.get("turnstileToken") as string | null;
			if (!token) {
				logger.warn("Turnstile token missing", { context: "contact-form", ip, action: "rejected" });
				return {
					success: false,
					error: "The security check hasn't finished loading. Please wait a moment and try again.",
				};
			}
			if (!(await verifyTurnstileToken(token, ip))) {
				logger.warn("Turnstile verification failed", { context: "contact-form", ip, action: "rejected" });
				return {
					success: false,
					error: "The security check could not be verified. Please try again.",
				};
			}
		}

		const loadedAt = formData.get("_loadedAt") as string | null;
		if (!validateSubmissionTiming(loadedAt)) {
			logger.warn("Contact form rejected: submitted too quickly", { ip });
			return { success: false, error: "Please take a moment before submitting." };
		}

		const rateLimit = await checkContactFormRateLimit(ip, "contact-form");
		if (!rateLimit.allowed) {
			return { success: false, error: rateLimit.error };
		}

		const data = {
			name: formData.get("name"),
			contactInfo: formData.get("contactInfo"),
			message: formData.get("message"),
			newsletter: formData.get("newsletter") === "true",
		};

		const validatedData = contactFormSchema.parse(data);

		if (!resend) {
			console.warn("Resend client not initialized - RESEND_API_KEY not set");
			return { success: false, error: "Email service not configured" };
		}

		const isEmail = validatedData.contactInfo?.includes("@");
		const result = await resend.emails.send({
			from: `Contact Form <${siteConfig.email.noreply}>`,
			to: [siteConfig.email.support],
			subject: "New Contact Form Submission",
			...(isEmail && validatedData.contactInfo ? { replyTo: validatedData.contactInfo } : {}),
			html: contactNotificationEmail({
				name: validatedData.name,
				contactInfo: validatedData.contactInfo,
				message: validatedData.message,
				newsletter: validatedData.newsletter,
			}),
		});

		if (isEmail && validatedData.contactInfo) {
			try {
				await resend.emails.send({
					from: `${siteConfig.name} <${siteConfig.email.noreply}>`,
					to: [validatedData.contactInfo],
					subject: `We received your message — ${siteConfig.name}`,
					html: contactConfirmationEmail({
						name: validatedData.name,
						contactInfo: validatedData.contactInfo,
						message: validatedData.message,
					}),
				});
			} catch (error) {
				console.error("Error sending contact confirmation email:", error);
			}
		}

		if (validatedData.newsletter && isEmail && validatedData.contactInfo) {
			try {
				await addContactToAudience(validatedData.contactInfo);
			} catch (error) {
				console.error("Error subscribing to newsletter:", error);
			}
		}


		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error("Error submitting contact form:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send message",
		};
	}
}
