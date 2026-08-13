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

// Reservation requests route to the same shared staff inbox as town inquiries
// (Janet's 2026-08 ask, LAC-3315). Reuse the town contact env vars so staff
// can re-point routing for both forms with a single env change.
const DEFAULT_RESERVATION_TO = "exploreharmonync@gmail.com";
const DEFAULT_RESERVATION_BCC = "harmonync@yadtel.net";

const parseEmailList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const reservationToRecipients = (): string[] => {
  const configured = parseEmailList(env.TOWN_CONTACT_TO_EMAIL);
  return configured.length > 0 ? configured : [DEFAULT_RESERVATION_TO];
};

const reservationBccRecipients = (): string[] => {
  const configured = parseEmailList(env.TOWN_CONTACT_BCC_EMAIL);
  return configured.length > 0 ? configured : [DEFAULT_RESERVATION_BCC];
};

const COMMUNITY_CENTER_CAPACITY = 120;

const reservationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date"),
  requestedTime: z.string().min(1, "Please describe the requested time"),
  eventPurpose: z.string().min(3, "Please describe the event or purpose"),
  expectedAttendance: z
    .number({ invalid_type_error: "Expected attendance must be a number" })
    .int("Expected attendance must be a whole number")
    .min(1, "Expected attendance must be at least 1")
    .max(
      COMMUNITY_CENTER_CAPACITY,
      `The Community Center's Fire Code capacity is ${COMMUNITY_CENTER_CAPACITY} people`
    ),
  notes: z.string().optional(),
  turnstileToken: z.string().optional(),
  website: z.string().optional(),
});

export type TownReservationFormData = z.infer<typeof reservationSchema>;

export async function submitTownReservationForm(
  formData: TownReservationFormData & { _loadedAt?: string }
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
    requestedDate,
    requestedTime,
    eventPurpose,
    expectedAttendance,
    notes,
    turnstileToken,
    website,
  } = parsed.data;

  if (website) {
    logger.warn("Honeypot triggered", {
      context: "town-reservation-form",
      action: "processing_anyway",
    });
  }

  if (isTurnstileConfigured()) {
    if (turnstileToken) {
      if (!(await verifyTurnstileToken(turnstileToken))) {
        logger.warn("Turnstile verification failed", {
          context: "town-reservation-form",
          action: "allowing_submission",
        });
      }
    } else {
      logger.warn("Turnstile token missing", {
        context: "town-reservation-form",
        reason: "widget_load_failure",
      });
    }
  }

  const ip = await getClientIp();

  if (!validateSubmissionTiming(_loadedAt)) {
    logger.warn("Town reservation form rejected: submitted too quickly", { ip });
    return { success: false, error: "Please take a moment before submitting." };
  }

  const rateLimit = await checkContactFormRateLimit(ip, "town-reservation-form");
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

  const emailPayload = {
    firstName,
    lastName,
    email,
    phone,
    requestedDate,
    requestedTime,
    eventPurpose,
    expectedAttendance,
    notes,
  };

  try {
    await resend.emails.send({
      from: `${siteConfig.name} Community Center <${siteConfig.email.noreply}>`,
      to: reservationToRecipients(),
      bcc: reservationBccRecipients(),
      subject: `Community Center Reservation: ${requestedDate} — ${firstName.replace(/[\r\n]/g, " ")} ${lastName.replace(/[\r\n]/g, " ")}`,
      replyTo: email,
      html: communityCenterReservationNotificationEmail(emailPayload),
    });
  } catch (error) {
    console.error("Error sending community center reservation email:", error);
    return {
      success: false,
      error: "Failed to send your reservation request. Please try again or call Town Hall.",
    };
  }

  try {
    await resend.emails.send({
      from: `${siteConfig.name} <${siteConfig.email.noreply}>`,
      to: [email],
      subject: `Community Center reservation request received — ${siteConfig.name}`,
      html: communityCenterReservationConfirmationEmail(emailPayload),
    });
  } catch (error) {
    console.error("Error sending community center reservation confirmation email:", error);
  }

  return { success: true };
}
