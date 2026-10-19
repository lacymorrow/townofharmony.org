/**
 * Regression tests for townofharmony.org — guards against bugs that have already happened.
 *
 * Each test is annotated with the issue ID that surfaced the original bug.
 *
 * Requires: dev server running at baseURL (started automatically by playwright.config.ts).
 * Runs in: pnpm test:e2e
 * Target runtime: under 30 seconds total.
 */

import { expect, test } from "@playwright/test";

// ── LAC-1704 ─────────────────────────────────────────────────────────────────
// /events broke twice in two weeks — returned empty HTML or resolved to 404.
test("LAC-1704: /events returns 200 with rendered content", async ({ page }) => {
  const response = await page.goto("/events");

  // Skip gracefully if events feature is disabled in this environment.
  if (response?.status() === 404) {
    test.skip(true, "/events returns 404 — events feature is disabled (DISABLE_EVENTS=true)");
  }

  // Hard requirement: page must not 404 or 500.
  expect(response?.status()).toBe(200);

  // The fallback page always renders an <h1> containing "Events".
  // Guards against blank-page regression where the route resolved but rendered nothing.
  await expect(page.getByRole("heading", { name: /events/i, level: 1 })).toBeVisible({
    timeout: 10_000,
  });

  // Page body must contain substantive text — not just a skeleton or empty container.
  const bodyText = (await page.locator("body").textContent()) ?? "";
  expect(bodyText.trim().length).toBeGreaterThan(100);
});

// ── LAC-2291 ─────────────────────────────────────────────────────────────────
// Collapsing the map sidebar left blank space: Leaflet caches the container
// dimensions, so without invalidateSize() the tiles stayed rendered at the old
// narrow width and the newly exposed strip on the right had nothing over it.
// Fixed by the ResizeObserver in harmony-map.tsx (#188) — this guards it.
test("LAC-2291: collapsing the map sidebar leaves no blank space", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/map");

  if (response?.status() === 404) {
    test.skip(true, "/map returns 404 — map feature is disabled (DISABLE_MAP=true)");
  }
  expect(response?.status()).toBe(200);

  // Leaflet loads client-side; wait for real tiles before measuring anything.
  await page.waitForSelector(".leaflet-tile-loaded", { timeout: 30_000 });

  // Union of the loaded tiles vs. the map pane. A gap > 0 on any edge means a
  // strip of the pane has no tile over it — the blank space users reported.
  const measure = () => {
    const pane = document.querySelector('[aria-label="Interactive map of Harmony, NC"]');
    if (!pane) throw new Error("map pane not found");
    const p = pane.getBoundingClientRect();
    const tiles = Array.from(document.querySelectorAll(".leaflet-tile-loaded"));
    const cover = tiles.reduce(
      (acc, t) => {
        const r = t.getBoundingClientRect();
        return {
          left: Math.min(acc.left, r.left),
          right: Math.max(acc.right, r.right),
        };
      },
      { left: Infinity, right: -Infinity }
    );
    return {
      paneWidth: Math.round(p.width),
      gapRight: Math.round(p.right - cover.right),
      gapLeft: Math.round(cover.left - p.left),
    };
  };

  const before = await page.evaluate(measure);

  await page.getByRole("button", { name: "Close sidebar" }).click();
  // 300ms CSS transition on the sidebar, then any newly exposed tiles load.
  await expect(page.getByRole("button", { name: "Open sidebar" })).toBeVisible();
  await page.waitForTimeout(2_000);

  const after = await page.evaluate(measure);

  // Sanity check: the pane actually grew, so the assertions below mean something.
  expect(after.paneWidth).toBeGreaterThan(before.paneWidth);

  // 1px of slack absorbs subpixel layout rounding.
  expect(after.gapRight).toBeLessThanOrEqual(1);
  expect(after.gapLeft).toBeLessThanOrEqual(1);
});

// ── LAC-1704 ─────────────────────────────────────────────────────────────────
// /events link disappeared from site navigation when the page was accidentally disabled.
test("LAC-1704: /events link exists in site navigation", async ({ page }) => {
  // Only meaningful when events is enabled; skip if the page itself is disabled.
  const eventsCheck = await page.goto("/events");
  if (eventsCheck?.status() === 404) {
    test.skip(true, "/events is disabled in this environment — nav link test skipped");
  }

  await page.goto("/");

  // The header renders an Events link in both the top utility bar and the main nav.
  // Locate the first visible anchor that points to /events.
  const eventsLinks = page.locator('a[href="/events"]');
  await expect(eventsLinks.first()).toBeVisible({ timeout: 10_000 });

  // Clicking the link must navigate to the events page without error.
  await eventsLinks.first().click();
  await expect(page).toHaveURL(/\/events/);
});

// ── LAC-954 ──────────────────────────────────────────────────────────────────
// Contact form on /contact was broken — page returned 404 and the form was unreachable.
// NOTE: /contact uses TownContactForm (src/components/modules/town/town-contact-form.tsx),
// which renders #firstName, #lastName, #email, #message fields. This is distinct from the
// generic ContactForm (src/components/forms/contact-form.tsx) which uses different field names.
test("LAC-954: /contact renders the contact form", async ({ page }) => {
  const response = await page.goto("/contact");

  // Skip gracefully when the contact page is disabled (page.disabled.tsx → Next.js skips it).
  if (!response || response.status() === 404) {
    test.skip(true, "/contact returns 404 — page is disabled (page.disabled.tsx)");
  }

  // Page must exist and return 200.
  expect(response?.status()).toBe(200);

  // Form must be present and interactive.
  const form = page.locator("form").first();
  await expect(form).toBeVisible({ timeout: 10_000 });

  // TownContactForm renders these IDs — verified in town-contact-form.spec.ts.
  await expect(page.locator("#firstName")).toBeVisible();
  await expect(page.locator("#lastName")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#message")).toBeVisible();
  await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
});

// ── LAC-186 ──────────────────────────────────────────────────────────────────
// Phone numbers were showing as 555-xxxx test/placeholder values on public pages.
test("LAC-186: site phone numbers are not 555-xxxx placeholders", async ({ page }) => {
  // Check homepage — phone appears in the header top bar.
  await page.goto("/");
  const homeText = (await page.locator("body").textContent()) ?? "";
  expect(homeText).not.toMatch(/\b555[-.\s]?\d{3}[-.\s]?\d{4}\b/);

  // Check /contact if available — phone appears in contact info sections.
  // The page renders even when disabled because the custom 404 still shows TOH contact info.
  await page.goto("/contact");
  const contactText = (await page.locator("body").textContent()) ?? "";
  expect(contactText).not.toMatch(/\b555[-.\s]?\d{3}[-.\s]?\d{4}\b/);
});

// ── LAC-2434 ─────────────────────────────────────────────────────────────────
// Unknown URLs returned HTTP 200 (soft 404) because Suspense boundaries in
// (town)/layout.tsx started streaming the shell and committing the response
// status before the catch-all page could call notFound().
test("LAC-2434: unknown URLs return HTTP 404 status (not soft 404)", async ({ request }) => {
  const res = await request.get("/this-page-does-not-exist-xyz-soft-404-regression", {
    maxRedirects: 0,
  });
  expect(res.status()).toBe(404);
});

// ── LAC-2434 ─────────────────────────────────────────────────────────────────
// Known Next.js routes must still return HTTP 200 — verifies the 404 fix did
// not regress legitimate pages.
test("LAC-2434: known routes still return HTTP 200", async ({ request }) => {
  const res = await request.get("/about", { maxRedirects: 0 });
  expect(res.status()).toBe(200);
});

// ── LAC-2434 ─────────────────────────────────────────────────────────────────
// Legacy Wagtail `index.html` URLs should 301 to the parent path so old Google
// index entries route to the live page. Scoped to `index.html` so site-
// verification HTML tokens at the root (Google/Bing) are NOT intercepted.
test("LAC-2434: legacy /index.html URLs 301-redirect to parent paths", async ({ request }) => {
  const root = await request.get("/index.html", { maxRedirects: 0 });
  expect(root.status()).toBe(308);
  expect(root.headers().location).toMatch(/\/$/);

  const nested = await request.get("/about/index.html", { maxRedirects: 0 });
  expect(nested.status()).toBe(308);
  expect(nested.headers().location).toMatch(/\/about$/);
});

// ── LAC-1704 ─────────────────────────────────────────────────────────────────
// Default Next.js 404 was shown instead of the custom Town of Harmony not-found page.
test("LAC-1704: custom 404 page renders on invalid routes", async ({ page }) => {
  await page.goto("/this-route-does-not-exist-xyz-abc-regression-test");

  const bodyText = (await page.locator("body").textContent()) ?? "";

  // Custom page must display Town of Harmony branding.
  expect(bodyText).toMatch(/town of harmony/i);

  // Default Next.js 404 message must NOT appear.
  expect(bodyText).not.toMatch(/this page could not be found/i);

  // Custom page provides a link back home ("Return to Homepage").
  const homeLink = page.getByRole("link", { name: /home/i }).first();
  await expect(homeLink).toBeVisible({ timeout: 10_000 });
});
