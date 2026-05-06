import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { contactSubmissions } from "@/server/db/schema";

export type SubmissionFormType = "contact" | "town_contact";
export type SubmissionStatus = "success" | "rejected" | "error";

export interface LogSubmissionInput {
  formType: SubmissionFormType;
  inquiryType?: string;
  submitterEmail?: string;
  ip?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
}

/** SHA-256 hex digest of a string — used for IP hashing */
async function sha256hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Partial-mask an email: "john.doe@example.com" → "jo**@example.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}**@${domain}`;
}

export async function logContactSubmission(input: LogSubmissionInput): Promise<void> {
  const submitterEmailPartial = input.submitterEmail
    ? maskEmail(input.submitterEmail)
    : undefined;

  const ipHash = input.ip ? await sha256hex(input.ip) : undefined;

  if (!db) {
    // Structured console log as fallback when DB is unavailable
    console.info("[contact-submission]", JSON.stringify({
      formType: input.formType,
      inquiryType: input.inquiryType ?? null,
      submitterEmailPartial: submitterEmailPartial ?? null,
      status: input.status,
      rejectionReason: input.rejectionReason ?? null,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  try {
    await db.insert(contactSubmissions).values({
      formType: input.formType,
      inquiryType: input.inquiryType,
      submitterEmailPartial,
      ipHash,
      status: input.status,
      rejectionReason: input.rejectionReason,
    });
  } catch (err) {
    // Never let logging failures bubble up to the caller
    console.error("[contact-submission] DB insert failed:", err);
  }
}

export async function getContactSubmissions(limit = 100) {
  if (!db) return [];
  return db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit);
}

export async function getContactSubmissionsByFormType(
  formType: SubmissionFormType,
  limit = 100
) {
  if (!db) return [];
  return db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.formType, formType))
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit);
}
