"use server";

import { z } from "zod";
import { siteConfig } from "@/config/site-config";
import { resend } from "@/lib/resend";

const townContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type TownContactFormData = z.infer<typeof townContactSchema>;

const INQUIRY_TYPES: Record<string, string> = {
  general: "General Inquiry",
  utilities: "Water/Sewer Utilities",
  permits: "Permits & Zoning",
  taxes: "Taxes & Billing",
  parks: "Parks & Recreation",
  roads: "Roads & Infrastructure",
  complaint: "Complaint",
  other: "Other",
};

export async function submitTownContactForm(formData: TownContactFormData) {
  const parsed = townContactSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
  }

  const { firstName, lastName, email, phone, inquiryType, message } = parsed.data;
  const inquiryLabel = INQUIRY_TYPES[inquiryType] ?? inquiryType;

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
      subject: `Contact Form: ${inquiryLabel} — ${firstName} ${lastName}`,
      replyTo: email,
      html: `
<h2>New Contact Form Submission</h2>
<table style="border-collapse:collapse;">
<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name</td><td>${firstName} ${lastName}</td></tr>
<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td>${email}</td></tr>
${phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Phone</td><td>${phone}</td></tr>` : ""}
<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Inquiry Type</td><td>${inquiryLabel}</td></tr>
</table>
<h3>Message</h3>
<p>${message.replace(/\n/g, "<br>")}</p>
			`.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending town contact form email:", error);
    return {
      success: false,
      error: "Failed to send your message. Please try again or call Town Hall.",
    };
  }
}
