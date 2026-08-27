/**
 * Regression tests for LAC-3546: bots were breaching the contact forms because
 * honeypot hits and failed/missing Turnstile tokens were logged but allowed
 * through (fail-open behavior from LAC-980/LAC-1265). These tests pin the
 * fail-closed behavior: honeypot hits are silently dropped and Turnstile is
 * enforced whenever it is configured.
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
  contactConfirmationEmail: () => "<html></html>",
  contactNotificationEmail: () => "<html></html>",
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

vi.mock("@/server/actions/subscribe", () => ({
  addContactToAudience: vi.fn(),
}));

import { submitContactForm } from "@/server/actions/contact";
import { submitTownContactForm } from "@/server/actions/town-contact";

const validTownSubmission = {
  firstName: "Jane",
  email: "jane@example.com",
  inquiryType: "general",
  message: "I have a question about my tax bill.",
  _loadedAt: "1000",
};

const buildContactFormData = (overrides: Record<string, string> = {}): FormData => {
  const form = new FormData();
  form.set("name", "Jane Doe");
  form.set("contactInfo", "jane@example.com");
  form.set("message", "I have a question about my tax bill.");
  form.set("_loadedAt", "1000");
  for (const [key, value] of Object.entries(overrides)) {
    form.set(key, value);
  }
  return form;
};

beforeEach(() => {
  vi.clearAllMocks();
  sendMock.mockResolvedValue({ id: "email-id" });
  isTurnstileConfiguredMock.mockReturnValue(true);
  verifyTurnstileTokenMock.mockResolvedValue(true);
});

describe("submitTownContactForm bot protection", () => {
  it("silently drops submissions that fill the honeypot field", async () => {
    const result = await submitTownContactForm({
      ...validTownSubmission,
      website: "https://spam.example.com",
    });

    // Bots get a fake success so they don't learn to skip the field.
    expect(result.success).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects submissions without a Turnstile token when Turnstile is configured", async () => {
    const result = await submitTownContactForm({ ...validTownSubmission });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects submissions whose Turnstile token fails verification", async () => {
    verifyTurnstileTokenMock.mockResolvedValue(false);

    const result = await submitTownContactForm({
      ...validTownSubmission,
      turnstileToken: "bad-token",
    });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("accepts submissions with a valid Turnstile token and passes the client IP", async () => {
    const result = await submitTownContactForm({
      ...validTownSubmission,
      turnstileToken: "good-token",
    });

    expect(result.success).toBe(true);
    expect(verifyTurnstileTokenMock).toHaveBeenCalledWith("good-token", "203.0.113.7");
    expect(sendMock).toHaveBeenCalled();
  });

  it("still accepts submissions when Turnstile is not configured", async () => {
    isTurnstileConfiguredMock.mockReturnValue(false);

    const result = await submitTownContactForm({ ...validTownSubmission });

    expect(result.success).toBe(true);
    expect(verifyTurnstileTokenMock).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalled();
  });
});

describe("submitContactForm bot protection", () => {
  it("silently drops submissions that fill the honeypot field", async () => {
    const result = await submitContactForm(
      buildContactFormData({ website: "https://spam.example.com" })
    );

    expect(result.success).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects submissions without a Turnstile token when Turnstile is configured", async () => {
    const result = await submitContactForm(buildContactFormData());

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects submissions whose Turnstile token fails verification", async () => {
    verifyTurnstileTokenMock.mockResolvedValue(false);

    const result = await submitContactForm(buildContactFormData({ turnstileToken: "bad-token" }));

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("accepts submissions with a valid Turnstile token", async () => {
    const result = await submitContactForm(buildContactFormData({ turnstileToken: "good-token" }));

    expect(result.success).toBe(true);
    expect(verifyTurnstileTokenMock).toHaveBeenCalledWith("good-token", "203.0.113.7");
    expect(sendMock).toHaveBeenCalled();
  });
});
