// Sentinel contract for client-site contact forms (LAC-4028 / LAC-4202).
//
// A submission whose sender address is at test.com or example.com (incl.
// test@test.com) is a TEST. The real contact-form pipeline still runs —
// validation, Turnstile, rate limit, Resend send — but the message is
// rerouted to an inbox we control and the subject is prefixed with
// `[TEST] `. Any secondary mail on that path (confirmation / auto-reply)
// is suppressed entirely so a real domain never receives spam from us.
//
// Mirrors the susanmorrow.us contract in services/send-email.js (PR #56).

const TEST_SENDER_DOMAINS = new Set(["test.com", "example.com"]);
const DEFAULT_TEST_RECIPIENT = "admin@buildandserve.com";

const normalize = (email: string | undefined | null): string =>
  (email ?? "").trim().toLowerCase();

const senderDomain = (email: string): string | null => {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1);
};

export const isTestSender = (email: string | undefined | null): boolean => {
  const domain = senderDomain(normalize(email));
  return domain !== null && TEST_SENDER_DOMAINS.has(domain);
};

// Admin env var first (same convention as susanmorrow's CONTACT_TEST_RECIPIENT
// fallback chain), then the fleet-wide default inbox.
export const resolveTestRecipient = (): string => {
  const fromEnv = (process.env.CONTACT_TEST_RECIPIENT ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)[0];
  return fromEnv || DEFAULT_TEST_RECIPIENT;
};

export const TEST_SUBJECT_PREFIX = "[TEST] ";
