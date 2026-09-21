/**
 * Regression tests for LAC-3977: Janet (Copper Gate Media, 9/17) asked that
 * Last Name, Email, and Phone be required on every inquiry type of the
 * general contact form. This reverses the earlier 8/19 ask that last name be
 * optional and replaces the "email OR phone" rule with all three required.
 * These tests pin the server-side validation; the client mirrors it.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
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
  isTurnstileConfigured: () => false,
  verifyTurnstileToken: vi.fn(async () => true),
}));

vi.mock("@/server/utils/contact-rate-limit", () => ({
  getClientIp: vi.fn(async () => "203.0.113.7"),
  checkContactFormRateLimit: vi.fn(async () => ({ allowed: true })),
  validateSubmissionTiming: vi.fn(() => true),
}));

import { submitTownContactForm } from "@/server/actions/town-contact";

const validSubmission = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "704-555-0123",
  inquiryType: "general",
  message: "I have a question about my tax bill.",
  _loadedAt: "1000",
};

beforeEach(() => {
  vi.clearAllMocks();
  sendMock.mockResolvedValue({ id: "email-id" });
});

describe("submitTownContactForm required contact fields (LAC-3977)", () => {
  it("accepts a submission with last name, email, and phone all present", async () => {
    const result = await submitTownContactForm({ ...validSubmission });

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalled();
  });

  it.each([
    ["lastName", "Last name is required"],
    ["email", "Email is required"],
    ["phone", "Phone number is required"],
  ] as const)("rejects a submission missing %s", async (field, message) => {
    const { [field]: _omitted, ...rest } = validSubmission;

    const result = await submitTownContactForm(rest as never);

    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBe(message);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it.each([
    ["lastName", "Last name is required"],
    ["email", "Email is required"],
    ["phone", "Phone number is required"],
  ] as const)("rejects a submission with blank %s", async (field, message) => {
    const result = await submitTownContactForm({ ...validSubmission, [field]: "  " });

    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBe(message);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("still rejects a malformed email", async () => {
    const result = await submitTownContactForm({ ...validSubmission, email: "not-an-email" });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("still rejects an implausible phone number", async () => {
    const result = await submitTownContactForm({ ...validSubmission, phone: "123" });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
