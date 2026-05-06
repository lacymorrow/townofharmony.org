"use server";

import { siteConfig } from "@/config/site-config";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { contactFormSchema } from "@/types/contact";

export async function submitContactForm(formData: FormData) {
	try {
		if (isTurnstileConfigured()) {
			const token = formData.get("turnstileToken") as string | null;
			if (!token || !(await verifyTurnstileToken(token))) {
				return { success: false, error: "Security check failed. Please try again." };
			}
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

		const result = await resend.emails.send({
			from: `Contact Form <${siteConfig.email.noreply}>`,
			to: [siteConfig.email.support],
			subject: "New Contact Form Submission",
			replyTo: validatedData.contactInfo,
			html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${validatedData.name}</p>
                ${validatedData.contactInfo ? `<p><strong>Contact:</strong> ${validatedData.contactInfo}</p>` : ""}
                <p><strong>Message:</strong></p>
                <p>${validatedData.message.replace(/\n/g, "<br>")}</p>
                <p><strong>Newsletter:</strong> ${validatedData.newsletter ? "Yes" : "No"}</p>
            `,
		});

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
