/**
 * What the town contact form accepts as an attachment. Shared by the form
 * (client checks, `accept` attribute, hint copy) and the server action (zod
 * schema) so the two can't drift.
 */
export const CONTACT_ATTACHMENT_TYPES = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export type ContactAttachmentType =
  (typeof CONTACT_ATTACHMENT_TYPES)[keyof typeof CONTACT_ATTACHMENT_TYPES];

export const CONTACT_ATTACHMENT_MIME_TYPES = [
  ...new Set(Object.values(CONTACT_ATTACHMENT_TYPES)),
] as [ContactAttachmentType, ...ContactAttachmentType[]];

export const CONTACT_ATTACHMENT_ACCEPT = Object.keys(CONTACT_ATTACHMENT_TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

export const CONTACT_ATTACHMENT_MAX_BYTES = 3 * 1024 * 1024;

export const CONTACT_ATTACHMENT_LABEL = "PDF, Word, JPG, or PNG";

/**
 * Resolves a picked file to an accepted MIME type, or null. Trusts the
 * extension when the browser reports no type, which happens for Word files on
 * machines without Office registered.
 */
export function resolveContactAttachmentType(file: {
  name: string;
  type: string;
}): ContactAttachmentType | null {
  if ((CONTACT_ATTACHMENT_MIME_TYPES as string[]).includes(file.type)) {
    return file.type as ContactAttachmentType;
  }
  if (file.type && file.type !== "application/octet-stream") return null;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return CONTACT_ATTACHMENT_TYPES[ext as keyof typeof CONTACT_ATTACHMENT_TYPES] ?? null;
}
