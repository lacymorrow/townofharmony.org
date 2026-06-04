import "server-only";

import { NextResponse } from "next/server";
import { SEARCH_PARAM_KEYS } from "@/config/search-param-keys";
import { logger } from "../logger";
import { getRequestBaseUrl } from "./request-url";

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
    return NextResponse.redirect(destination);
  }

  let url: URL;

  if (typeof options === "string") {
    url = new URL(destination, await getRequestBaseUrl());
    url.searchParams.set(SEARCH_PARAM_KEYS.statusCode, options);
  } else {
    const baseUrl = options.request?.url || (await getRequestBaseUrl());
    url = new URL(destination, baseUrl);

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
