import "server-only";

import { NextResponse } from "next/server";
import { SEARCH_PARAM_KEYS } from "@/config/search-param-keys";
import { logger } from "../logger";
import { getRequestBaseUrl, isTrustedHost } from "./request-url";

/**
 * Resolve a redirect destination against a base URL while rejecting open-redirect
 * payloads. Protocol-relative URLs (`//evil.com/x`) and absolute URLs whose host
 * isn't on the trusted allowlist collapse to `/` on the base origin.
 */
const resolveSafeUrl = (destination: string, baseUrl: string): URL => {
  const base = new URL(baseUrl);
  // Protocol-relative URLs bypass `new URL(..., base)`'s same-origin behavior.
  if (destination.startsWith("//")) {
    return new URL("/", base);
  }
  let candidate: URL;
  try {
    candidate = new URL(destination, base);
  } catch {
    return new URL("/", base);
  }
  if (candidate.origin === base.origin) return candidate;
  if (isTrustedHost(candidate.host)) return candidate;
  return new URL("/", base);
};

/**
 * Server-only redirect helper for Route Handlers. Lives in its own file (rather
 * than alongside `redirect`/`createRedirectUrl` in `redirect.ts`) because it
 * pulls in `next/headers` via `getRequestBaseUrl`, which would otherwise
 * server-only-poison the client-safe helpers that are imported by Client
 * Components (e.g. github-oauth-button).
 *
 * When no explicit `request` is provided, falls back to the originating
 * request's validated base URL so preview-deploy redirects stay on the
 * preview domain instead of bouncing to production.
 */
export async function routeRedirect(
  destination: string,
  options?: string | { code?: string; nextUrl?: string; request?: Request }
) {
  if (!options) {
    const base = await getRequestBaseUrl();
    return NextResponse.redirect(resolveSafeUrl(destination, base));
  }

  let url: URL;

  if (typeof options === "string") {
    url = resolveSafeUrl(destination, await getRequestBaseUrl());
    url.searchParams.set(SEARCH_PARAM_KEYS.statusCode, options);
  } else {
    const baseUrl = options.request?.url || (await getRequestBaseUrl());
    url = resolveSafeUrl(destination, baseUrl);

    if (options?.nextUrl) {
      url.searchParams.set(SEARCH_PARAM_KEYS.nextUrl, options.nextUrl);
    }

    if (options?.code) {
      url.searchParams.set(SEARCH_PARAM_KEYS.statusCode, options.code);
    }
  }

  logger.info(`routeRedirect: Redirecting to ${url}`);
  return NextResponse.redirect(url);
}
