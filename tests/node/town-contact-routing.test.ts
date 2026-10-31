/**
 * Regression guard for LAC-6294: a general website inquiry has to reach BOTH
 * Janet (Copper Gate Media, who runs the site for the town) and the town's
 * yadtel inbox.
 *
 * Before this, the yadtel address was a BCC and Janet was not a recipient at
 * all (LAC-3312). Production sets neither TOWN_CONTACT_*_EMAIL var, so the
 * defaults in town-contact-recipients.ts are what the town actually gets —
 * which is why these tests assert on the shipped default list and not on an
 * env value. The named-address assertions are deliberate: a list that still
 * has three entries but lost Janet's would pass a length check.
 *
 * Community Center reservations are a separate pair (LAC-6293) and must not
 * move with this; that is covered in community-center-reservation.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock, isTurnstileConfiguredMock, verifyTurnstileTokenMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  isTurnstileConfiguredMock: vi.fn(),
  verifyTurnstileTokenMock: vi.fn(),
}));

vi.mock("@/env", () => ({
  env: {},
}));

vi.mock("@/config/site-config", () => ({
  siteConfig: {
    name: "Town of Harmony",
    email: { noreply: "noreply@example.com", support: "support@example.com" },
  },
}));

vi.mock("@/lib/builder-data-server", () => ({
  fetchBuilderContent: vi.fn(async () => ({ results: [] })),
}));

vi.mock("@/lib/email-templates", () => ({
  townContactConfirmationEmail: () => "<html></html>",
  townContactNotificationEmail: () => "<html></html>",
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/lib/resend", () => ({
  resend: { emails: { send: sendMock } },
}));

vi.mock("@/lib/turnstile", () => ({
  isTurnstileConfigured: isTurnstileConfiguredMock,
  verifyTurnstileToken: verifyTurnstileTokenMock,
}));

vi.mock("@/server/utils/contact-rate-limit", () => ({
  getClientIp: vi.fn(async () => "203.0.113.7"),
  checkContactFormRateLimit: vi.fn(async () => ({ allowed: true })),
  validateSubmissionTiming: vi.fn(() => true),
}));

import { submitTownContactForm } from "@/server/actions/town-contact";
import { DEFAULT_TOWN_CONTACT_TO } from "@/server/utils/town-contact-recipients";

const JANET = "coppergatemedia@gmail.com";
const YADTEL = "harmonync@yadtel.net";

// Not an example.com / test.com sender: those are the test-sentinel domains
// (LAC-4028) and reroute to our own inbox, hiding what these tests check.
const validSubmission = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@townresident.example",
  phone: "704-555-0123",
  inquiryType: "general",
  message: "I have a question about my water bill.",
  turnstileToken: "good-token",
  _loadedAt: "1000",
};

beforeEach(() => {
  vi.clearAllMocks();
  sendMock.mockResolvedValue({ id: "email-id" });
  isTurnstileConfiguredMock.mockReturnValue(true);
  verifyTurnstileTokenMock.mockResolvedValue(true);
});

describe("general contact form default routing", () => {
  it("lists Janet and the yadtel inbox in the shipped defaults", () => {
    expect(DEFAULT_TOWN_CONTACT_TO).toContain(JANET);
    expect(DEFAULT_TOWN_CONTACT_TO).toContain(YADTEL);
  });

  it("mails both of them on a real submission, with nobody BCC'd", async () => {
    const result = await submitTownContactForm(validSubmission);

    expect(result.success).toBe(true);
    const notification = sendMock.mock.calls[0][0];
    expect(notification.to).toContain(JANET);
    expect(notification.to).toContain(YADTEL);
    expect(notification.bcc).toEqual([]);
  });

  it("still sends the resident their confirmation", async () => {
    await submitTownContactForm(validSubmission);

    const confirmation = sendMock.mock.calls[1][0];
    expect(confirmation.to).toEqual([validSubmission.email]);
  });
});
