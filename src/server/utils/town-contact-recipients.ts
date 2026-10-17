import { logger } from "@/lib/logger";

// Defaults reflect Janet's 2026-08 routing request (LAC-3312). Kept here — not
// in the server action — so unit tests can import them without pulling in the
// "use server" module.
export const DEFAULT_TOWN_CONTACT_TO = "exploreharmonync@gmail.com";
export const DEFAULT_TOWN_CONTACT_BCC = "harmonync@yadtel.net";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseEmailList = (value: string | undefined | null): string[] =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * Where a town form's mail goes: `TOWN_CONTACT_TO_EMAIL` /
 * `TOWN_CONTACT_BCC_EMAIL`, else the default above. Addresses that fail
 * validation are dropped and logged, and an env value that is entirely
 * unusable falls through to the default, so a typo in the Vercel dashboard
 * never silently swallows inquiries (LAC-3347).
 *
 * There is deliberately no caller-supplied tier. Until LAC-3944 the Builder
 * blocks took a `recipientEmail`, which reached this function inside the
 * payload of a public, unauthenticated server action — attacker controlled no
 * matter how it had been authored in the CMS. Anyone could POST a recipient and
 * have the town's verified Resend domain deliver an attacker-written message,
 * attachment included, to any mailbox. LAC-3944 cut the override down to a
 * selection from the addresses the server already knew; LAC-4610 removed the
 * inputs, because no Builder entry had ever set one and a field that only
 * accepts addresses the server is already configured for is not a control, it
 * is a control-shaped thing that quietly does nothing.
 *
 * Re-pointing is an env edit plus a redeploy. Handing no-deploy routing back to
 * town staff means reading the address server-side — fetch the Builder entry by
 * id with the server's key and read the field off the fetched entry — never
 * taking it from the payload (LAC-4610).
 */
export const resolveRecipients = (
  envValue: string | undefined,
  fallback: string,
  field: string
): string[] => {
  const configured = parseEmailList(envValue);
  if (configured.length === 0) return [fallback];

  const valid = configured.filter((addr) => EMAIL_RE.test(addr));
  const invalid = configured.filter((addr) => !EMAIL_RE.test(addr));
  if (invalid.length > 0) {
    logger.warn("Ignoring malformed town-contact recipient(s)", {
      field,
      source: "env",
      invalid,
    });
  }

  return valid.length > 0 ? valid : [fallback];
};
