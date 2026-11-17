/**
 * LAC-8326: the Resend SDK resolves with { data, error } and does not throw on
 * an API rejection. The action's try/catch never fired, so a rejected send
 * told the visitor "success" and no mail left. A rejected send must surface as
 * a failure so the visitor is told to call Town Hall.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("@/env", () => ({ env: {} }));
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
vi.mock("@/lib/resend", () => ({ resend: { emails: { send: sendMock } } }));
vi.mock("@/lib/turnstile", () => ({
  isTurnstileConfigured: () => true,
  verifyTurnstileToken: async () => true,
}));
vi.mock("@/server/utils/contact-rate-limit", () => ({
  getClientIp: vi.fn(async () => "203.0.113.7"),
  checkContactFormRateLimit: vi.fn(async () => ({ allowed: true })),
  validateSubmissionTiming: vi.fn(() => true),
}));

import { submitCommunityCenterReservation } from "@/server/actions/community-center-reservation";
import { submitTownContactForm } from "@/server/actions/town-contact";

const submission = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@townresident.example",
  phone: "704-555-0123",
  inquiryType: "general",
  message: "I have a question about my tax bill.",
  turnstileToken: "good-token",
  _loadedAt: "1000",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("town contact form reports a rejected Resend send", () => {
  it("returns failure when Resend resolves with an error", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "rate_limit_exceeded", message: "Too many requests", statusCode: 429 },
    });
    const result = await submitTownContactForm(submission);
    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error", expect.stringContaining("Town Hall"));
  });

  it("still succeeds when Resend resolves with data", async () => {
    sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null });
    const result = await submitTownContactForm(submission);
    expect(result.success).toBe(true);
  });
});

describe("community center reservation reports a rejected Resend send", () => {
  it("returns failure when Resend resolves with an error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad" } });
    const result = await submitCommunityCenterReservation({
      firstName: "Jane",
      email: "jane@townresident.example",
      eventDate: "2026-10-01",
      startTime: "10:00",
      endTime: "14:00",
      eventPurpose: "Family reunion",
      expectedAttendance: 40,
      turnstileToken: "good-token",
      _loadedAt: "1000",
    });
    expect(result.success).toBe(false);
  });
});
