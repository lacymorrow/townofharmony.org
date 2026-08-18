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

	it("prefers a valid Builder override over env and default", () => {
		expect(
			resolveRecipients(
				"janet@example.com",
				"env@example.com",
				DEFAULT_TOWN_CONTACT_TO,
				"recipientEmail",
			),
		).toEqual(["janet@example.com"]);
	});

	it("splits comma-separated Builder values and trims whitespace", () => {
		expect(
			resolveRecipients(
				" janet@example.com , clerk@example.com ",
				undefined,
				DEFAULT_TOWN_CONTACT_TO,
				"recipientEmail",
			),
		).toEqual(["janet@example.com", "clerk@example.com"]);
	});

	it("treats empty Builder string as unset (Builder clears -> '' not undefined)", () => {
		expect(
			resolveRecipients("", "env@example.com", DEFAULT_TOWN_CONTACT_TO, "recipientEmail"),
		).toEqual(["env@example.com"]);
	});

	it("treats whitespace-only Builder value as unset", () => {
		expect(
			resolveRecipients("   ", "env@example.com", DEFAULT_TOWN_CONTACT_TO, "recipientEmail"),
		).toEqual(["env@example.com"]);
	});

	it("falls back to env when Builder value is entirely malformed", () => {
		expect(
			resolveRecipients(
				"not-an-email",
				"env@example.com",
				DEFAULT_TOWN_CONTACT_TO,
				"recipientEmail",
			),
		).toEqual(["env@example.com"]);
	});

	it("keeps the valid Builder addresses when only some are malformed", () => {
		expect(
			resolveRecipients(
				"janet@example.com, bogus",
				"env@example.com",
				DEFAULT_TOWN_CONTACT_TO,
				"recipientEmail",
			),
		).toEqual(["janet@example.com"]);
	});

	it("falls through to default when both Builder and env are empty", () => {
		expect(
			resolveRecipients(undefined, undefined, DEFAULT_TOWN_CONTACT_TO, "recipientEmail"),
		).toEqual([DEFAULT_TOWN_CONTACT_TO]);
	});

	it("falls through to default when env is set to whitespace", () => {
		expect(
			resolveRecipients(null, "   ", DEFAULT_TOWN_CONTACT_BCC, "bccEmail"),
		).toEqual([DEFAULT_TOWN_CONTACT_BCC]);
	});

	it("falls through to default when both tiers are malformed (never drops silently)", () => {
		expect(
			resolveRecipients("nope", "also-nope", DEFAULT_TOWN_CONTACT_TO, "recipientEmail"),
		).toEqual([DEFAULT_TOWN_CONTACT_TO]);
	});
});
