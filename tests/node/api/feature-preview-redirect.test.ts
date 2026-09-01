/**
 * Regression tests for LAC-2963: open redirect in /api/feature-preview.
 * The `redirect` param was passed straight into NextResponse.redirect via
 * `new URL(redirect, request.url)`, so absolute URLs (https://evil.example.com)
 * and protocol-relative URLs (//evil.example.com) sent visitors off-site while
 * the trusted domain set the preview cookie in the same hop (CWE-601).
 * Only same-origin paths may survive; everything else falls back to "/".
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: { PREVIEW_SECRET: undefined },
}));

vi.mock("@/config/features-config", () => ({
  buildTimeFeatures: {},
}));

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

import { GET } from "@/app/(app)/api/feature-preview/route";

const ORIGIN = "https://www.townofharmony.org";

async function locationFor(query: string): Promise<URL> {
  const res = (await GET(new Request(`${ORIGIN}/api/feature-preview?${query}`))) as unknown as {
    url: URL;
  };
  return new URL(res.url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/feature-preview redirect validation (LAC-2963)", () => {
  it("rejects an absolute off-site URL and falls back to /", async () => {
    const url = await locationFor("feature_flag_map=1&redirect=https://evil.example.com");
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/");
  });

  it("rejects a protocol-relative URL (//evil.example.com)", async () => {
    const url = await locationFor("feature_flag_map=1&redirect=//evil.example.com");
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/");
  });

  it("rejects a backslash variant (/\\evil.example.com) that browsers treat as //", async () => {
    const url = await locationFor(
      `feature_flag_map=1&redirect=${encodeURIComponent("/\\evil.example.com")}`
    );
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/");
  });

  it("rejects off-site redirects on the clear=1 path too", async () => {
    const url = await locationFor("clear=1&redirect=https://evil.example.com");
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/");
    expect(cookieStore.delete).toHaveBeenCalled();
  });

  it("preserves a same-origin path with query and hash", async () => {
    const url = await locationFor(
      `feature_flag_sewer=1&redirect=${encodeURIComponent("/sewer?tab=rates#faq")}`
    );
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/sewer");
    expect(url.search).toBe("?tab=rates");
    expect(url.hash).toBe("#faq");
  });

  it("defaults to / when no redirect param is given", async () => {
    const url = await locationFor("feature_flag_map=1");
    expect(url.origin).toBe(ORIGIN);
    expect(url.pathname).toBe("/");
    expect(cookieStore.set).toHaveBeenCalled();
  });
});
