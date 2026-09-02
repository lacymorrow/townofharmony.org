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

// Builder field -> env -> default. Emails that fail validation are dropped and
// logged; if the whole override is invalid, we fall through to the next tier so
// a typo in the CMS never silently swallows inquiries (LAC-3347).
export const resolveRecipients = (
  builderValue: string | undefined | null,
  envValue: string | undefined,
  fallback: string,
  field: string
): string[] => {
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
    return valid.length > 0 ? valid : null;
  };

  return tryTier(builderValue, "builder") ?? tryTier(envValue, "env") ?? [fallback];
};
