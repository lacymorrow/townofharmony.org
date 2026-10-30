/**
 * Guard for LAC-3944 / LAC-4610: nothing in a town form's payload can decide
 * where the mail goes.
 *
 * Both of these actions are public and unauthenticated. They used to accept a
 * `recipientEmail` / `bccEmail` pair, authored as Builder inputs — but the
 * server received those values in the request body, so a POST could aim the
 * town's verified Resend domain (attachment included) at any mailbox. LAC-3944
 * reduced the override to a selection from the server's own addresses and
 * LAC-4610 removed the inputs, so routing is now env -> default only.
 *
 * These tests POST the old field names anyway, the way an attacker replaying
 * the old shape would, and assert the recipients are unchanged. If a
 * CMS-authored recipient is ever handed back to town staff, it has to be read
 * server-side from the Builder entry — this file should keep passing.
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
  communityCenterReservationConfirmationEmail: () => "<html></html>",
  communityCenterReservationNotificationEmail: () => "<html></html>",
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

import { submitCommunityCenterReservation } from "@/server/actions/community-center-reservation";
import { submitTownContactForm } from "@/server/actions/town-contact";
import {
  DEFAULT_TOWN_CONTACT_BCC,
  DEFAULT_TOWN_CONTACT_TO,
  DEFAULT_TOWN_RESERVATION_TO,
} from "@/server/utils/town-contact-recipients";

const ATTACKER_OVERRIDE = {
  recipientEmail: "attacker@evil.example",
  bccEmail: "attacker-bcc@evil.example",
};

// Not an example.com / test.com sender: those are the test-sentinel domains
// (LAC-4028) and get rerouted to our own inbox, which would hide the thing
// these tests are checking.
const RESIDENT_EMAIL = "jane@townresident.example";

const validTownSubmission = {
  firstName: "Jane",
  lastName: "Doe",
  email: RESIDENT_EMAIL,
  phone: "704-555-0123",
  inquiryType: "general",
  message: "I have a question about my tax bill.",
  turnstileToken: "good-token",
  _loadedAt: "1000",
};

const validReservation = {
  firstName: "Jane",
  email: RESIDENT_EMAIL,
  eventDate: "2026-10-01",
  startTime: "10:00",
  endTime: "14:00",
  eventPurpose: "Family reunion",
  expectedAttendance: 40,
  turnstileToken: "good-token",
  _loadedAt: "1000",
};

// An attacker POSTs JSON, not a typed call. The cast is the point: these keys
// are not on either action's input type any more, and the server has to ignore
// them regardless of what arrives on the wire.
const asRawPayload = <T>(payload: Record<string, unknown>): T => payload as T;

beforeEach(() => {
  vi.clearAllMocks();
  sendMock.mockResolvedValue({ id: "email-id" });
  isTurnstileConfiguredMock.mockReturnValue(true);
  verifyTurnstileTokenMock.mockResolvedValue(true);
});

describe("town form recipients ignore the request payload", () => {
  it("mails the town inbox when submitTownContactForm is POSTed a recipient override", async () => {
    const result = await submitTownContactForm(
      asRawPayload({ ...validTownSubmission, ...ATTACKER_OVERRIDE })
    );

    expect(result.success).toBe(true);
    const notification = sendMock.mock.calls[0][0];
    expect(notification.to).toEqual([DEFAULT_TOWN_CONTACT_TO]);
    expect(notification.bcc).toEqual([DEFAULT_TOWN_CONTACT_BCC]);
    expect(JSON.stringify(sendMock.mock.calls)).not.toContain("evil.example");
  });

  it("mails the town inbox when submitCommunityCenterReservation is POSTed a recipient override", async () => {
    const result = await submitCommunityCenterReservation(
      asRawPayload({ ...validReservation, ...ATTACKER_OVERRIDE })
    );

    expect(result.success).toBe(true);
    const notification = sendMock.mock.calls[0][0];
    // Reservations have their own recipient since LAC-6293, and no BCC.
    expect(notification.to).toEqual([DEFAULT_TOWN_RESERVATION_TO]);
    expect(notification.bcc).toEqual([]);
    expect(JSON.stringify(sendMock.mock.calls)).not.toContain("evil.example");
  });
});
