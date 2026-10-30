/**
 * Regression tests for LAC-3315: the Community Center reservation form must
 * inherit the same fail-closed bot protection as the town contact form
 * (honeypot silently dropped, Turnstile enforced when configured) and route
 * requests to the town inbox with a distinct subject prefix so staff can
 * triage reservation requests apart from general inquiries.
 *
 * LAC-6293 moved reservations off the shared contact inbox: they now go to
 * harmonync@yadtel.net and nowhere else, via their own TOWN_RESERVATION_*
 * env pair, so re-pointing the contact form cannot move reservation mail.
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

vi.mock("@/lib/email-templates", () => ({
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

const validSubmission = {
  firstName: "Jane",
  email: "jane@harmonyresident.org",
  eventDate: "2026-10-01",
  startTime: "10:00",
  endTime: "14:00",
  eventPurpose: "Family reunion",
  expectedAttendance: 40,
  _loadedAt: "1000",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Keep the test-recipient resolution deterministic regardless of local env.
  process.env.CONTACT_TEST_RECIPIENT = "";
  sendMock.mockResolvedValue({ id: "email-id" });
  isTurnstileConfiguredMock.mockReturnValue(true);
  verifyTurnstileTokenMock.mockResolvedValue(true);
});

describe("submitCommunityCenterReservation bot protection", () => {
  it("silently drops submissions that fill the honeypot field", async () => {
    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      website: "https://spam.example.com",
    });

    expect(result.success).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects submissions without a Turnstile token when Turnstile is configured", async () => {
    const result = await submitCommunityCenterReservation({ ...validSubmission });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects submissions whose Turnstile token fails verification", async () => {
    verifyTurnstileTokenMock.mockResolvedValue(false);

    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      turnstileToken: "bad-token",
    });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("accepts a valid submission and emails the town inbox with a reservation subject", async () => {
    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(true);
    expect(verifyTurnstileTokenMock).toHaveBeenCalledWith("good-token");
    // Notification to the town inbox + confirmation to the submitter.
    expect(sendMock).toHaveBeenCalledTimes(2);

    const notification = sendMock.mock.calls[0][0];
    expect(notification.to).toEqual(["harmonync@yadtel.net"]);
    expect(notification.subject).toMatch(/^Community Center Reservation:/);
    expect(notification.replyTo).toBe("jane@harmonyresident.org");
  });

  it("routes reservations to the yadtel address only, with no BCC (LAC-6293)", async () => {
    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(true);

    const notification = sendMock.mock.calls[0][0];
    // The single recipient the town asked for.
    expect(notification.to).toEqual(["harmonync@yadtel.net"]);
    // No BCC default: unset TOWN_RESERVATION_BCC_EMAIL means nobody is copied.
    expect(notification.bcc).toEqual([]);
    // The general contact form's inbox must not appear anywhere on a
    // reservation — that shared routing is exactly what LAC-6293 removed.
    const allAddresses = JSON.stringify([notification.to, notification.bcc]);
    expect(allAddresses).not.toContain("exploreharmonync@gmail.com");
  });

  it("rejects an attendance count above the fire-code maximum", async () => {
    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      expectedAttendance: 500,
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("reroutes a test sender and sends no confirmation to the test domain", async () => {
    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      email: "test@test.com",
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(true);
    // One message only: the confirmation to test.com is suppressed.
    expect(sendMock).toHaveBeenCalledTimes(1);

    const notification = sendMock.mock.calls[0][0];
    expect(notification.to).toEqual(["admin@buildandserve.com"]);
    expect(notification.bcc).toEqual([]);
    expect(notification.subject).toMatch(/^\[TEST\] Community Center Reservation:/);
    // The town inbox must never appear on a test send.
    const allAddresses = JSON.stringify([notification.to, notification.bcc]);
    expect(allAddresses).not.toContain("harmonync@yadtel.net");
    expect(allAddresses).not.toContain("exploreharmonync@gmail.com");
    expect(allAddresses).not.toContain("townofharmony.org");
  });

  it("treats example.com senders as tests too", async () => {
    const result = await submitCommunityCenterReservation({
      ...validSubmission,
      email: "jane@example.com",
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toEqual(["admin@buildandserve.com"]);
  });

  it("rejects a submission with neither email nor phone", async () => {
    const { email: _email, ...withoutContact } = validSubmission;
    const result = await submitCommunityCenterReservation({
      ...withoutContact,
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
