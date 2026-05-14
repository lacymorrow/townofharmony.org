"use server";

import { siteConfig } from "@/config/site-config";
import { contactConfirmationEmail, esc } from "@/lib/email-templates";
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
		const isLikelyBot = !!formData.get("website");
		if (isLikelyBot) {
			logger.warn("Honeypot triggered", { context: "contact-form", action: "processing_anyway" });
		}

		if (isTurnstileConfigured()) {
			const token = formData.get("turnstileToken") as string | null;
			if (token) {
				if (!(await verifyTurnstileToken(token))) {
					logger.warn("[turnstile] contact form verification failed — allowing submission");
				}
			} else {
				logger.warn("[turnstile] no token provided — widget may have failed to load");
			}
		}

		const ip = await getClientIp();

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
			html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${esc(validatedData.name)}</p>
                ${validatedData.contactInfo ? `<p><strong>Contact:</strong> ${esc(validatedData.contactInfo)}</p>` : ""}
                <p><strong>Message:</strong></p>
                <p>${esc(validatedData.message).replace(/\n/g, "<br>")}</p>
                <p><strong>Newsletter:</strong> ${validatedData.newsletter ? "Yes" : "No"}</p>
            `,
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
