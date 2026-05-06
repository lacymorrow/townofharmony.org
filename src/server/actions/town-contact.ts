"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { siteConfig } from "@/config/site-config";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { logContactSubmission } from "@/server/services/contact-submission-service";

const INQUIRY_VALUES = [
	"general",
	"utilities",
	"permits",
	"taxes",
	"parks",
	"roads",
	"complaint",
	"other",
] as const;

const INQUIRY_LABELS: Record<(typeof INQUIRY_VALUES)[number], string> = {
	general: "General Inquiry",
	utilities: "Water/Sewer Utilities",
	permits: "Permits & Zoning",
	taxes: "Taxes & Billing",
	parks: "Parks & Recreation",
	roads: "Roads & Infrastructure",
	complaint: "Complaint",
	other: "Other",
};

const townContactSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	inquiryType: z.enum(INQUIRY_VALUES, { message: "Please select an inquiry type" }),
	message: z.string().min(10, "Message must be at least 10 characters"),
	turnstileToken: z.string().optional(),
});

export type TownContactFormData = z.infer<typeof townContactSchema>;

const esc = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function getClientIp(): Promise<string | undefined> {
	const h = await headers();
	return (
		h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		h.get("x-real-ip") ??
		undefined
	);
}

export async function submitTownContactForm(formData: TownContactFormData) {
	const ip = await getClientIp();

	const parsed = townContactSchema.safeParse(formData);
	if (!parsed.success) {
		const reason = parsed.error.errors[0]?.message ?? "Invalid form data";
		await logContactSubmission({
			formType: "town_contact",
			ip,
			status: "rejected",
			rejectionReason: `validation: ${reason}`.slice(0, 100),
		});
		return { success: false, error: reason };
	}

	const { firstName, lastName, email, phone, inquiryType, message, turnstileToken } = parsed.data;
	const inquiryLabel = INQUIRY_LABELS[inquiryType];

	if (isTurnstileConfigured()) {
		if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken))) {
			await logContactSubmission({
				formType: "town_contact",
				inquiryType,
				submitterEmail: email,
				ip,
				status: "rejected",
				rejectionReason: "turnstile_failed",
			});
			return { success: false, error: "Security check failed. Please try again." };
		}
	}

	if (!resend) {
		console.warn("Resend client not initialized - RESEND_API_KEY not set");
		await logContactSubmission({
			formType: "town_contact",
			inquiryType,
			submitterEmail: email,
			ip,
			status: "error",
			rejectionReason: "email_service_not_configured",
		});
		return {
			success: false,
			error: "Email service is not configured. Please call Town Hall directly.",
		};
	}

	try {
		await resend.emails.send({
			from: `Town of Harmony Contact Form <${siteConfig.email.noreply}>`,
			to: [siteConfig.email.support],
			subject: `Contact Form: ${inquiryLabel} — ${esc(firstName)} ${esc(lastName)}`,
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
		});

		await logContactSubmission({
			formType: "town_contact",
			inquiryType,
			submitterEmail: email,
			ip,
			status: "success",
		});

		return { success: true };
	} catch (error) {
		console.error("Error sending town contact form email:", error);
		await logContactSubmission({
			formType: "town_contact",
			inquiryType,
			submitterEmail: email,
			ip,
			status: "error",
			rejectionReason: "email_send_failed",
		});
		return {
			success: false,
			error: "Failed to send your message. Please try again or call Town Hall.",
		};
	}
}
