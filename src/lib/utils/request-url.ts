import "server-only";

import { headers } from "next/headers";
import { BASE_URL } from "@/config/base-url";

/**
 * Get the base URL (origin) of the current request, e.g. `https://preview.townofharmony.org`.
 *
 * Reads `x-forwarded-host`/`host` so the value reflects the domain the user is actually
 * on (preview vs production) rather than the build-time `BASE_URL` constant — which on
 * Vercel previews resolves to the production URL via `VERCEL_PROJECT_PRODUCTION_URL`.
 *
 * Use this when generating redirect URLs that must come back to the originating domain
 * (Stripe success/cancel URLs, OAuth callbacks, magic links, etc.). Falls back to
 * `BASE_URL` outside a request context (e.g. at build time).
 */
export const getRequestBaseUrl = async (): Promise<string> => {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`;
    }
  } catch {
    // Not in a request context (e.g. build time); fall through.
  }
  return BASE_URL;
};
