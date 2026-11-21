/**
 * Regression tests for LAC-8826 (server half).
 *
 * The contact form renders the static `contactInquiryTypes` list until its own
 * Builder.io fetch resolves, so a visitor can pick a fallback-only value and
 * send it. The server validated `inquiryType` against the Builder list alone,
 * which on prod today does NOT contain `general` or `other` — the first and
 * last options of the fallback. Those submissions were refused with the same
 * "Please select an inquiry type" the client shows, so even once the client
 * stopped discarding the value, the send would still have died here.
 *
 * The existing contact suites all stub `fetchBuilderContent` to return no
 * results, which sends `loadInquiryTypes` down its own fallback path and makes
 * the two lists agree — which is why none of them caught this. These tests
 * deliberately return a Builder list that diverges from the fallback, the way
 * prod actually does.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { contactInquiryTypes } from "@/data/town/contact-inquiry-types";

const { sendMock, fetchBuilderContentMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  fetchBuilderContentMock: vi.fn(),
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
  fetchBuilderContent: fetchBuilderContentMock,
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

/** A trimmed copy of the live Builder list. No `general`, no `other`. */
const builderResults = [
  { value: "event vendor interest", label: "Event Vendor Interest", isActive: true },
  { value: "general inquiry | other", label: "General Inquiry | Other", isActive: true },
  { value: "permits", label: "Permits & Zoning", isActive: true },
  { value: "taxes", label: "Taxes & Billing", isActive: true },
];

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
  fetchBuilderContentMock.mockResolvedValue({ results: builderResults });
});

describe("submitTownContactForm inquiry type sources (LAC-8826)", () => {
  it("accepts a fallback-only value the Builder list does not carry", async () => {
    const result = await submitTownContactForm({ ...validSubmission });

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalled();
    // The label comes from the fallback entry the visitor actually saw.
    expect(sendMock.mock.calls[0][0].subject).toContain("General Inquiry");
  });

  it("accepts every active option the form can render from the fallback", async () => {
    for (const option of contactInquiryTypes.filter((t) => t.isActive !== false)) {
      sendMock.mockClear();

      const result = await submitTownContactForm({
        ...validSubmission,
        inquiryType: option.value,
      });

      expect(result, `fallback option ${option.value} must be accepted`).toMatchObject({
        success: true,
      });
      expect(sendMock).toHaveBeenCalled();
    }
  });

  it("prefers the Builder label when a value is in both lists", async () => {
    const result = await submitTownContactForm({ ...validSubmission, inquiryType: "permits" });

    expect(result.success).toBe(true);
    expect(sendMock.mock.calls[0][0].subject).toContain("Permits & Zoning");
  });

  it("accepts a Builder-only value", async () => {
    const result = await submitTownContactForm({
      ...validSubmission,
      inquiryType: "event vendor interest",
    });

    expect(result.success).toBe(true);
    expect(sendMock.mock.calls[0][0].subject).toContain("Event Vendor Interest");
  });

  it("still refuses a value that is in neither list", async () => {
    const result = await submitTownContactForm({
      ...validSubmission,
      inquiryType: "not-a-real-topic",
    });

    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBe("Please select an inquiry type");
    expect(sendMock).not.toHaveBeenCalled();
  });
});
