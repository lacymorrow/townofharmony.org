/*
 * SECURITY (LAC-3944): this module used to open with a `"use server"`
 * directive, which published `createTemporaryLink(userId)` and
 * `getTemporaryLinkData(userId)` as unauthenticated POST endpoints taking a
 * caller-supplied user id. Anyone could mint or read a temporary link for any
 * user. Its only consumer is an integration test that imports it directly.
 */
import { addMinutes } from "date-fns";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/server/db";
import { temporaryLinks } from "@/server/db/schema";

const EXPIRES_IN_MINUTES = 30;

export async function createTemporaryLink({
  data,
  userId,
  type,
  expiresInMinutes = EXPIRES_IN_MINUTES,
  metadata,
}: {
  data: string;
  userId: string;
  type: string;
  expiresInMinutes?: number;
  metadata?: string;
}) {
  return await db
    ?.insert(temporaryLinks)
    .values({
      userId,
      type,
      data,
      expiresAt: addMinutes(new Date(), expiresInMinutes),
      metadata,
    })
    .returning();
}

// TODO: First use should record the IP address, and any subsequent uses from a different IP should be blocked
// TODO: Add a check to see if the link has been used already (limit uses)
export async function getTemporaryLinkData(linkId: string, userId: string) {
  const link = await db?.query.temporaryLinks.findFirst({
    where: and(
      eq(temporaryLinks.id, linkId),
      eq(temporaryLinks.userId, userId),
      gt(temporaryLinks.expiresAt, new Date())
    ),
  });

  // Reset the expiresAt if the link is used, so it can be used again
  if (link) {
    await db
      ?.update(temporaryLinks)
      .set({ expiresAt: addMinutes(new Date(), EXPIRES_IN_MINUTES) })
      .where(eq(temporaryLinks.id, linkId));
    return link.data;
  }

  return null;
}
