import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/server/db";
import type { ContactSubmission, NewContactSubmission } from "@/server/db/schema";
import { contactSubmissions } from "@/server/db/schema";

export type TownContactSendStatus = "pending" | "sent" | "failed";

export interface RecordTownContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  inquiryType: string;
  inquiryLabel: string;
  message: string;
  attachmentFilename?: string | null;
  ip?: string | null;
}

/**
 * Persist a town inquiry to the DB. Called BEFORE the Resend send so a
 * downstream email failure never loses the lead. Returns the row id (or null
 * if the DB is unavailable — in that case we still let the send attempt run).
 */
export async function recordTownContactSubmission(
  input: RecordTownContactInput
): Promise<string | null> {
  if (!db) {
    console.warn("[town-contact] DB not initialized — inquiry will not be persisted");
    return null;
  }
  try {
    const values: NewContactSubmission = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      inquiryType: input.inquiryType,
      inquiryLabel: input.inquiryLabel,
      message: input.message,
      attachmentFilename: input.attachmentFilename ?? null,
      ip: input.ip ?? null,
      sendStatus: "pending",
    };
    const [row] = await db
      .insert(contactSubmissions)
      .values(values)
      .returning({ id: contactSubmissions.id });
    return row?.id ?? null;
  } catch (err) {
    console.error("[town-contact] Failed to persist inquiry:", err);
    return null;
  }
}

export interface UpdateTownContactSendResultInput {
  id: string;
  status: TownContactSendStatus;
  resendMessageId?: string | null;
  error?: string | null;
}

export async function updateTownContactSendResult(
  input: UpdateTownContactSendResultInput
): Promise<void> {
  if (!db) return;
  try {
    await db
      .update(contactSubmissions)
      .set({
        sendStatus: input.status,
        resendMessageId: input.resendMessageId ?? null,
        sendError: input.error ?? null,
        sentAt: input.status === "sent" ? new Date() : null,
      })
      .where(eq(contactSubmissions.id, input.id));
  } catch (err) {
    console.error("[town-contact] Failed to update send result:", err);
  }
}

/**
 * Fetch submissions within [startInclusive, endExclusive). Ordered by
 * createdAt desc — the CSV export exposes them as an archive.
 */
export async function listTownContactSubmissionsInRange(
  startInclusive: Date,
  endExclusive: Date
): Promise<ContactSubmission[]> {
  if (!db) return [];
  return db
    .select()
    .from(contactSubmissions)
    .where(
      and(
        gte(contactSubmissions.createdAt, startInclusive),
        lt(contactSubmissions.createdAt, endExclusive)
      )
    )
    .orderBy(desc(contactSubmissions.createdAt));
}
