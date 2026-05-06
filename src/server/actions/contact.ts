"use server";

import { headers } from "next/headers";
import { siteConfig } from "@/config/site-config";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { addAudienceUser } from "@/server/actions/resend-actions";
import { logContactSubmission } from "@/server/services/contact-submission-service";
import { contactFormSchema } from "@/types/contact";

async function getClientIp(): Promise<string | undefined> {
	const h = await headers();
	return (
		h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		h.get("x-real-ip") ??
		undefined
	);
}

export async function submitContactForm(formData: FormData) {
	const ip = await getClientIp();

	try {
		if (isTurnstileConfigured()) {
			const token = formData.get("turnstileToken") as string | null;
			if (!token || !(await verifyTurnstileToken(token))) {
				await logContactSubmission({
					formType: "contact",
					ip,
					status: "rejected",
					rejectionReason: "turnstile_failed",
				});
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
			await logContactSubmission({
				formType: "contact",
				submitterEmail: typeof validatedData.contactInfo === "string" ? validatedData.contactInfo : undefined,
				ip,
				status: "error",
				rejectionReason: "email_service_not_configured",
			});
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

		if (validatedData.newsletter && validatedData.contactInfo?.includes("@")) {
			try {
				await addAudienceUser(validatedData.contactInfo);
			} catch (error) {
				console.error("Error subscribing to newsletter:", error);
			}
		}

		await logContactSubmission({
			formType: "contact",
			submitterEmail: typeof validatedData.contactInfo === "string" ? validatedData.contactInfo : undefined,
			ip,
			status: "success",
		});

		return { success: true, data: result };
	} catch (error) {
		console.error("Error submitting contact form:", error);
		await logContactSubmission({
			formType: "contact",
			ip,
			status: "error",
			rejectionReason: error instanceof Error ? error.message.slice(0, 100) : "unknown_error",
		});
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send message",
		};
	}
}
