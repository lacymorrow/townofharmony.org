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
 * Builder field -> env -> default. Emails that fail validation are dropped and
 * logged; if the whole override is invalid, we fall through to the next tier so
 * a typo in the CMS never silently swallows inquiries (LAC-3347).
 *
 * SECURITY (LAC-3944): the Builder override reaches this function through the
 * payload of a public, unauthenticated server action, so it is attacker
 * controlled no matter how it was authored in the CMS. Validating its *shape*
 * was not enough: anyone could POST `recipientEmail` and have the town's
 * verified Resend domain deliver an attacker-written message, with an
 * attachment, to any address. That is an open relay, and it spends the town's
 * domain reputation.
 *
 * So the override is now a *selection* from the addresses the server already
 * knows (`envValue` plus `fallback`), never a way to introduce a new one.
 * Routing to a brand-new address is a one-line env change, which is the
 * trust boundary it should always have been behind.
 */
export const resolveRecipients = (
  builderValue: string | undefined | null,
  envValue: string | undefined,
  fallback: string,
  field: string
): string[] => {
  // The set a CMS-authored override is permitted to route to.
  const allowed = new Set(
    [...parseEmailList(envValue), fallback].map((addr) => addr.toLowerCase())
  );

  const tryTier = (raw: string | undefined | null, source: string): string[] | null => {
    const list = parseEmailList(raw);
    if (list.length === 0) return null;
    const valid = list.filter((addr) => EMAIL_RE.test(addr));
    const invalid = list.filter((addr) => !EMAIL_RE.test(addr));
    if (invalid.length > 0) {
      logger.warn("Ignoring malformed town-contact recipient(s)", {
        field,
        source,
        invalid,
      });
    }

    if (source !== "builder") {
      return valid.length > 0 ? valid : null;
    }

    // Anything the server has not been configured to mail is refused here.
    const permitted = valid.filter((addr) => allowed.has(addr.toLowerCase()));
    const refused = valid.filter((addr) => !allowed.has(addr.toLowerCase()));
    if (refused.length > 0) {
      logger.warn("Refusing town-contact recipient override not configured on the server", {
        field,
        source,
        refused,
      });
    }
    return permitted.length > 0 ? permitted : null;
  };

  return tryTier(builderValue, "builder") ?? tryTier(envValue, "env") ?? [fallback];
};
