import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TOWN_CONTACT_BCC,
  DEFAULT_TOWN_CONTACT_TO,
  resolveRecipients,
} from "@/server/utils/town-contact-recipients";

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

/*
 * Routing is env -> default, and nothing else (LAC-4610). The caller-supplied
 * tier this function used to take is gone: it arrived in the payload of a
 * public, unauthenticated server action, so "authored in Builder" was never a
 * property the server could verify, and a POST could aim the town's verified
 * Resend domain at any mailbox. LAC-3944 reduced that override to a selection
 * from the server's own addresses; LAC-4610 removed the input. The payload-level
 * guard lives in town-contact-recipient-payload-ignored.test.ts.
 *
 * Every path below lands on a real town inbox. Mail is never dropped.
 */
describe("resolveRecipients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers the env-configured address", () => {
    expect(
      resolveRecipients("janet@example.com", DEFAULT_TOWN_CONTACT_TO, "recipientEmail")
    ).toEqual(["janet@example.com"]);
  });

  it("splits comma-separated env values and trims whitespace", () => {
    expect(
      resolveRecipients(
        " janet@example.com , clerk@example.com ",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["janet@example.com", "clerk@example.com"]);
  });

  it("keeps the valid env addresses when only some are malformed", () => {
    expect(
      resolveRecipients("janet@example.com, bogus", DEFAULT_TOWN_CONTACT_TO, "recipientEmail")
    ).toEqual(["janet@example.com"]);
  });

  it("falls through to the default when the env value is entirely malformed", () => {
    expect(resolveRecipients("not-an-email", DEFAULT_TOWN_CONTACT_TO, "recipientEmail")).toEqual([
      DEFAULT_TOWN_CONTACT_TO,
    ]);
  });

  it("falls through to the default when env is unset", () => {
    expect(resolveRecipients(undefined, DEFAULT_TOWN_CONTACT_TO, "recipientEmail")).toEqual([
      DEFAULT_TOWN_CONTACT_TO,
    ]);
  });

  it("falls through to the default when env is set to whitespace", () => {
    expect(resolveRecipients("   ", DEFAULT_TOWN_CONTACT_BCC, "bccEmail")).toEqual([
      DEFAULT_TOWN_CONTACT_BCC,
    ]);
  });

  // The reservation BCC has no default address: nobody is copied unless the
  // env var names someone (LAC-6293).
  it("returns no recipients when the fallback is null and env is unset", () => {
    expect(resolveRecipients(undefined, null, "bccEmail")).toEqual([]);
  });

  it("returns no recipients when the fallback is null and env is unusable", () => {
    expect(resolveRecipients("not-an-email", null, "bccEmail")).toEqual([]);
  });

  it("still honours a valid address when the fallback is null", () => {
    expect(resolveRecipients("clerk@example.com", null, "bccEmail")).toEqual(["clerk@example.com"]);
  });
});
