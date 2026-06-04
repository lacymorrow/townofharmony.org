import "server-only";

import { headers } from "next/headers";
import { BASE_URL } from "@/config/base-url";
import { siteConfig } from "@/config/site-config";

/**
 * Build the set of hostnames that are trusted for redirect URLs derived from
 * the incoming request. Sourced from configured deployment env vars so that
 * each deploy (production, preview, custom domain) self-describes which
 * hostnames it answers to.
 */
const buildTrustedHostnames = (): Set<string> => {
  const trusted = new Set<string>();

  // Local development.
  trusted.add("localhost");
  trusted.add("127.0.0.1");

  // Any value that's already a full URL → extract its hostname.
  // Any value that's a bare host (Vercel exposes URLs without scheme) → use as-is.
  const add = (raw: string | undefined) => {
    if (!raw) return;
    try {
      const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
      trusted.add(url.hostname);
    } catch {
      // ignore malformed values
    }
  };

  add(process.env.AUTH_URL);
  add(process.env.URL);
  add(process.env.NEXT_PUBLIC_APP_URL);
  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_BRANCH_URL);
  add(siteConfig.url);

  return trusted;
};

const TRUSTED_HOSTNAMES = buildTrustedHostnames();

// Apex hostnames whose subdomains we also trust (e.g. preview.townofharmony.org
// when townofharmony.org is the configured production host). Excludes
// localhost/127.0.0.1 — those aren't apex domains, and we don't want to start
// trusting arbitrary `.localhost`-suffixed strings.
const TRUSTED_APEX_HOSTNAMES = Array.from(TRUSTED_HOSTNAMES).filter(
  (h) => h !== "localhost" && h !== "127.0.0.1"
);

const isTrustedHost = (host: string): boolean => {
  const hostname = host.split(":")[0]?.toLowerCase();
  if (!hostname) return false;
  if (TRUSTED_HOSTNAMES.has(hostname)) return true;
  // Generic Vercel preview deployments (e.g. *.vercel.app) — Vercel-owned,
  // safe to redirect back to.
  if (hostname.endsWith(".vercel.app")) return true;
  // Subdomains of any configured production host (e.g. preview.<prod-domain>).
  for (const apex of TRUSTED_APEX_HOSTNAMES) {
    if (hostname.endsWith(`.${apex}`)) return true;
  }
  return false;
};

/**
 * Get the base URL (origin) of the current request, e.g. `https://preview.townofharmony.org`.
 *
 * Reads `x-forwarded-host`/`host` so the value reflects the domain the user is actually
 * on (preview vs production) rather than the build-time `BASE_URL` constant — which on
 * Vercel previews resolves to the production URL via `VERCEL_PROJECT_PRODUCTION_URL`.
 *
 * Validates the host against an allowlist (configured deploy URLs + localhost +
 * `*.vercel.app`) to prevent Host Header Injection / open redirect attacks via a
 * spoofed `Host` or `X-Forwarded-Host` header. Untrusted hosts fall back to `BASE_URL`.
 *
 * Use this when generating redirect URLs that must come back to the originating domain
 * (Stripe success/cancel URLs, OAuth callbacks, magic links, etc.).
 */
export const getRequestBaseUrl = async (): Promise<string> => {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && isTrustedHost(host)) {
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`;
    }
  } catch {
    // Not in a request context (e.g. build time); fall through.
  }
  return BASE_URL;
};
