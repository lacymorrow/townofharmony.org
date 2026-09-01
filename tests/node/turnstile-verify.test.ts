/**
 * Regression tests for the LAC-3546 follow-up: a real user on a normal
 * connection was rejected with "security check could not be verified" because
 * we forwarded `remoteip` to Cloudflare siteverify. The IP a browser presents
 * to challenges.cloudflare.com can legitimately differ from the one our server
 * sees (dual-stack IPv4/IPv6, iCloud Private Relay, VPNs), so an IP match
 * cannot be required. Tokens are single-use, which already blocks replay.
 * These tests pin the siteverify request body to exactly secret + response.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: { TURNSTILE_SECRET_KEY: "test-secret-key" },
}));

vi.mock("@/config/features-config", () => ({
  buildTimeFeatures: { TURNSTILE_ENABLED: true },
}));

import { verifyTurnstileToken } from "@/lib/turnstile";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("verifyTurnstileToken", () => {
  it("sends only secret and response to siteverify — never remoteip", async () => {
    const result = await verifyTurnstileToken("token-123");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect([...body.keys()].sort()).toEqual(["response", "secret"]);
    expect(body.get("response")).toBe("token-123");
    expect(body.get("secret")).toBe("test-secret-key");
  });

  it("returns false when Cloudflare rejects the token", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] }), {
        status: 200,
      })
    );

    await expect(verifyTurnstileToken("stale-token")).resolves.toBe(false);
  });

  it("returns false when the siteverify request itself fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(verifyTurnstileToken("token-123")).resolves.toBe(false);
  });
});
