"use server";

import { z } from "zod";
import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import {
  communityCenterReservationConfirmationEmail,
  communityCenterReservationNotificationEmail,
} from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import {
  checkContactFormRateLimit,
  getClientIp,
  validateSubmissionTiming,
} from "@/server/utils/contact-rate-limit";
import {
  DEFAULT_TOWN_CONTACT_BCC,
  DEFAULT_TOWN_CONTACT_TO,
  resolveRecipients,
} from "@/server/utils/town-contact-recipients";

// Fire-code maximum capacity for the Community Center (see the reservation
// rules on /resources/community-center-reservation).
const MAX_ATTENDANCE = 120;

const countDigits = (value: string) => (value.match(/\d/g) ?? []).length;

// Validation mirrors the town contact form (LAC-3315): name required, and at
// least one of email/phone so staff can reply. Reservation-specific fields are
// required so staff aren't chasing residents for basics.
const reservationSchema = z
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
    eventDate: z.string().min(1, "Please choose a date for your event"),
    startTime: z.string().min(1, "Please choose a start time"),
    endTime: z.string().min(1, "Please choose an end time"),
    eventPurpose: z.string().min(3, "Please describe the event or purpose"),
    expectedAttendance: z.coerce
      .number({ invalid_type_error: "Please enter the expected number of guests" })
      .int("Please enter a whole number")
      .min(1, "Please enter the expected number of guests")
      .max(MAX_ATTENDANCE, `The Community Center holds up to ${MAX_ATTENDANCE} guests (Fire Code)`),
    notes: z.string().optional(),
    turnstileToken: z.string().optional(),
    website: z.string().optional(),
    // Builder-block overrides. Malformed values are dropped in
    // resolveRecipients() rather than failing the submission.
    recipientEmail: z.string().optional(),
    bccEmail: z.string().optional(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Please provide an email address or a phone number so we can reply.",
    path: ["email"],
  });

export type CommunityCenterReservationFormData = z.infer<typeof reservationSchema>;

// _loadedAt is an anti-bot timing field kept outside the validated schema.
export async function submitCommunityCenterReservation(
  formData: CommunityCenterReservationFormData & { _loadedAt?: string }
) {
  const { _loadedAt, ...rest } = formData;
  const parsed = reservationSchema.safeParse(rest);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    eventDate,
    startTime,
    endTime,
    eventPurpose,
    expectedAttendance,
    notes,
    turnstileToken,
    website,
    recipientEmail,
    bccEmail,
  } = parsed.data;

  const ip = await getClientIp();

  // Fail closed (LAC-3546): honeypot hits get a fake success so bots don't
  // learn to leave the field empty, but nothing is emailed.
  if (website) {
    logger.warn("Honeypot triggered", {
      context: "community-center-reservation",
      ip,
      action: "dropped",
    });
    return { success: true };
  }

  if (isTurnstileConfigured()) {
    if (!turnstileToken) {
      logger.warn("Turnstile token missing", {
        context: "community-center-reservation",
        ip,
        action: "rejected",
      });
      return {
        success: false,
        error:
          'Please check the "Verify you are human" box above the Submit button, then try again. If it hasn\'t appeared yet, give it a moment — or call Town Hall.',
      };
    }
    if (!(await verifyTurnstileToken(turnstileToken))) {
      logger.warn("Turnstile verification failed", {
        context: "community-center-reservation",
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
    logger.warn("Community Center reservation rejected: submitted too quickly", { ip });
    return { success: false, error: "Please take a moment before submitting." };
  }

  const rateLimit = await checkContactFormRateLimit(ip, "community-center-reservation");
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

  // Same inbox config as town inquiries (LAC-3312 / PR #234): Builder override
  // -> env -> default. Reservation requests go to exploreharmonync@gmail.com.
  const toRecipients = resolveRecipients(
    recipientEmail,
    env.TOWN_CONTACT_TO_EMAIL,
    DEFAULT_TOWN_CONTACT_TO,
    "recipientEmail"
  );
  const bccRecipients = resolveRecipients(
    bccEmail,
    env.TOWN_CONTACT_BCC_EMAIL,
    DEFAULT_TOWN_CONTACT_BCC,
    "bccEmail"
  );

  const reservationFields = {
    firstName,
    lastName,
    email,
    phone,
    eventDate,
    startTime,
    endTime,
    eventPurpose,
    expectedAttendance,
    notes,
  };

  try {
    await resend.emails.send({
      from: `${siteConfig.name} Reservations <${siteConfig.email.noreply}>`,
      to: toRecipients,
      bcc: bccRecipients,
      // Distinct subject prefix so staff can triage reservation requests apart
      // from general inquiries (LAC-3315).
      subject: `Community Center Reservation: ${[firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .replace(/[\r\n]/g, " ")} — ${eventDate.replace(/[\r\n]/g, " ")}`,
      ...(email ? { replyTo: email } : {}),
      html: communityCenterReservationNotificationEmail(reservationFields),
    });
  } catch (error) {
    console.error("Error sending Community Center reservation email:", error);
    return {
      success: false,
      error: "Failed to send your request. Please try again or call Town Hall.",
    };
  }

  if (email) {
    try {
      await resend.emails.send({
        from: `${siteConfig.name} <${siteConfig.email.noreply}>`,
        to: [email],
        subject: `Your Community Center reservation request has been received — ${siteConfig.name}`,
        html: communityCenterReservationConfirmationEmail(reservationFields),
      });
    } catch (error) {
      console.error("Error sending Community Center reservation confirmation email:", error);
    }
  }

  return { success: true };
}
