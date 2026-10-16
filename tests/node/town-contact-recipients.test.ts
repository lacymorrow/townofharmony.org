import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TOWN_CONTACT_BCC,
  DEFAULT_TOWN_CONTACT_TO,
  resolveRecipients,
} from "@/server/utils/town-contact-recipients";

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe("resolveRecipients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers a Builder override that selects a server-configured address", () => {
    expect(
      resolveRecipients(
        "janet@example.com",
        "env@example.com, janet@example.com",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["janet@example.com"]);
  });

  /*
   * SECURITY (LAC-3944). These three cases are the reason the override is an
   * allowlist and not free text. `recipientEmail` arrives in the payload of a
   * public, unauthenticated server action, so "authored in Builder" is not a
   * property the server can verify. Before this, a POST could aim the town's
   * verified Resend domain at any mailbox and attach a file to it.
   *
   * Refusing an override falls through to env, then to the default, so a
   * refused address still reaches a town inbox. Mail is never dropped.
   */
  it("refuses a Builder override the server was never configured to mail", () => {
    expect(
      resolveRecipients(
        "attacker@evil.example",
        "env@example.com",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["env@example.com"]);
  });

  it("refuses an unconfigured override even with no env tier to fall back to", () => {
    expect(
      resolveRecipients(
        "attacker@evil.example",
        undefined,
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual([DEFAULT_TOWN_CONTACT_TO]);
  });

  it("keeps only the configured addresses when an override mixes in an unconfigured one", () => {
    expect(
      resolveRecipients(
        "janet@example.com, attacker@evil.example",
        "janet@example.com",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["janet@example.com"]);
  });

  it("lets an override select the default address", () => {
    expect(
      resolveRecipients(
        DEFAULT_TOWN_CONTACT_TO,
        undefined,
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual([DEFAULT_TOWN_CONTACT_TO]);
  });

  it("splits comma-separated Builder values and trims whitespace", () => {
    expect(
      resolveRecipients(
        " janet@example.com , clerk@example.com ",
        "janet@example.com,clerk@example.com",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["janet@example.com", "clerk@example.com"]);
  });

  it("treats empty Builder string as unset (Builder clears -> '' not undefined)", () => {
    expect(
      resolveRecipients("", "env@example.com", DEFAULT_TOWN_CONTACT_TO, "recipientEmail")
    ).toEqual(["env@example.com"]);
  });

  it("treats whitespace-only Builder value as unset", () => {
    expect(
      resolveRecipients("   ", "env@example.com", DEFAULT_TOWN_CONTACT_TO, "recipientEmail")
    ).toEqual(["env@example.com"]);
  });

  it("falls back to env when Builder value is entirely malformed", () => {
    expect(
      resolveRecipients(
        "not-an-email",
        "env@example.com",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["env@example.com"]);
  });

  it("keeps the valid Builder addresses when only some are malformed", () => {
    expect(
      resolveRecipients(
        "janet@example.com, bogus",
        "janet@example.com",
        DEFAULT_TOWN_CONTACT_TO,
        "recipientEmail"
      )
    ).toEqual(["janet@example.com"]);
  });

  it("falls through to default when both Builder and env are empty", () => {
    expect(
      resolveRecipients(undefined, undefined, DEFAULT_TOWN_CONTACT_TO, "recipientEmail")
    ).toEqual([DEFAULT_TOWN_CONTACT_TO]);
  });

  it("falls through to default when env is set to whitespace", () => {
    expect(resolveRecipients(null, "   ", DEFAULT_TOWN_CONTACT_BCC, "bccEmail")).toEqual([
      DEFAULT_TOWN_CONTACT_BCC,
    ]);
  });

  it("falls through to default when both tiers are malformed (never drops silently)", () => {
    expect(
      resolveRecipients("nope", "also-nope", DEFAULT_TOWN_CONTACT_TO, "recipientEmail")
    ).toEqual([DEFAULT_TOWN_CONTACT_TO]);
  });
});
