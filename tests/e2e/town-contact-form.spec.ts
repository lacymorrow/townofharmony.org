/**
 * E2E tests for TownContactForm + submitTownContactForm server action.
 *
 * Anti-regression: verifies the bot-protection hardening from LAC-3546.
 * Turnstile fails closed — a missing token must cause the server action to
 * reject the submission (this reverses the LAC-1265 soft-fail, which let bots
 * POST the action directly) — and honeypot hits are dropped with fake success.
 *
 * Requires:
 *   - Dev server running at baseURL (started automatically by playwright.config.ts)
 *   - RESEND_API_KEY env var only for the success-path test; all other tests run without it.
 *
 * All tests skip gracefully when /contact returns 404 (page is currently
 * served from page.disabled.tsx and is not active).
 */

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const CONTACT_URL = "/contact";

const VALID_DATA = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  message: "This is a test message with enough characters to pass validation.",
};

// Hidden input created by the Cloudflare script once the widget renders; its
// value is the token the form submits.
const TURNSTILE_INPUT = 'input[name="cf-turnstile-response"]';

async function turnstileTokenValue(page: Page): Promise<string> {
  return page
    .locator(TURNSTILE_INPUT)
    .first()
    .inputValue()
    .catch(() => "");
}

/** Best-effort wait for the widget to issue a token; false if none arrived. */
async function waitForTurnstileToken(page: Page, timeoutMs: number): Promise<boolean> {
  try {
    await expect.poll(() => turnstileTokenValue(page), { timeout: timeoutMs }).not.toBe("");
    return true;
  } catch {
    return false;
  }
}

async function fillValidForm(page: Page) {
  await page.locator("#firstName").fill(VALID_DATA.firstName);
  await page.locator("#lastName").fill(VALID_DATA.lastName);
  await page.locator("#email").fill(VALID_DATA.email);
  // Inquiry types are Builder-driven, so don't hardcode a value — wait for a
  // real (non-disabled) option to load and pick the first one.
  await page
    .locator("#inquiryType option:not([disabled])")
    .first()
    .waitFor({ state: "attached", timeout: 15_000 });
  await page.locator("#inquiryType").selectOption({ index: 1 });
  await page.locator("#message").fill(VALID_DATA.message);
}

test.describe("Town Contact Form", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    const response = await page.goto(CONTACT_URL);
    // Handle null response and 404 — page is disabled (page.disabled.tsx)
    if (!response || response.status() === 404) {
      test.skip(true, "/contact returns 404 — page is disabled (page.disabled.tsx)");
    }
    // Wait for the form to be interactive rather than networkidle, which is unreliable
    // in Next.js dev (HMR websockets, Turnstile iframes, etc. keep the network busy).
    await page.locator("#firstName").waitFor({ state: "visible", timeout: 10_000 });
  });

  test("renders all required form fields", async ({ page }) => {
    await expect(page.locator("#firstName")).toBeVisible();
    await expect(page.locator("#lastName")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#inquiryType")).toBeVisible();
    await expect(page.locator("#message")).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("shows client-side validation errors when required fields are empty", async ({ page }) => {
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/first name is required/i)).toBeVisible();
    // Last name is intentionally optional (form labels it "Optional") — no error expected.
    // Email alone is not required either — the form asks for email OR phone. The
    // same copy also appears as static helper text, so scope to the alert.
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: /please provide an email address or a phone number/i })
    ).toBeVisible();
    await expect(page.getByText(/message must be at least 10 characters/i)).toBeVisible();
  });

  test("blocks submission made within 5 seconds of page load", async ({ page }) => {
    // The Turnstile gate now precedes the timing gate (LAC-3546), so the
    // submission needs a token to reach it. The gate measures ~5s from
    // component mount (loadedAtRef), which beforeEach's form-visible wait
    // approximates — so form fill plus token wait must stay inside that
    // window or the test can't prove anything.
    const mountedAt = Date.now();
    await fillValidForm(page);
    if ((await page.locator(TURNSTILE_INPUT).count()) > 0) {
      const gotToken = await waitForTurnstileToken(page, 3_000);
      test.skip(!gotToken, "Turnstile widget did not issue a token inside the timing window");
    }
    test.skip(
      Date.now() - mountedAt > 4_000,
      "form setup took too long to submit inside the 5-second gate"
    );
    await page.getByRole("button", { name: /send message/i }).click();

    // The timing gate renders its rejection through the serverError alert
    // (a <p role="alert"> inside the form's aria-live region).
    await expect(
      page.getByRole("alert").filter({ hasText: /please take a moment before submitting/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  // --- Regression: Turnstile fails closed (LAC-3546) ---
  test("blocks submission when Turnstile token is absent", async ({ page }) => {
    // LAC-1265 made a missing token non-blocking; bots then POSTed straight
    // past Cloudflare into staff inboxes (LAC-3546), so the action now fails
    // closed. Block the Turnstile script and reload so the widget can never
    // issue a token, then confirm the server rejects the submission.
    await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
    await page.reload();
    await page.locator("#firstName").waitFor({ state: "visible", timeout: 10_000 });

    // The form only injects the script when a sitekey is configured; without
    // it the server skips Turnstile too, so there is nothing to test. The
    // script tag is appended after hydration, so wait for it rather than
    // checking synchronously.
    const scriptRequested = await page
      .waitForFunction(
        () => document.querySelector('script[src*="challenges.cloudflare.com"]') !== null,
        { timeout: 10_000 }
      )
      .then(() => true)
      .catch(() => false);
    test.skip(!scriptRequested, "Turnstile is not configured in this environment");

    await fillValidForm(page);
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /verify you are human/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Message Sent")).not.toBeVisible();
  });

  // --- Honeypot: silent drop with fake success (LAC-3546) ---
  test("shows fake success when honeypot field is filled", async ({ page }) => {
    await fillValidForm(page);

    // Simulate a bot filling the visually-hidden honeypot field.
    // TownContactForm reads `website` from new FormData(form), not React state,
    // so a plain DOM value assignment is sufficient for the server to receive it.
    await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('input[name="website"]');
      if (el) {
        el.value = "http://spam.example.com";
      }
    });

    await page.getByRole("button", { name: /send message/i }).click();

    // The server drops honeypot submissions before the Turnstile and timing
    // gates and returns a fake success so bots don't learn to leave the
    // field empty — the UI shows "Message Sent" but no email goes out.
    await expect(page.getByText("Message Sent")).toBeVisible({ timeout: 15_000 });
  });

  // --- Optional success path (requires email service) ---
  test("shows 'Message Sent' success state after valid submission", async ({ page }) => {
    test.skip(
      !process.env.RESEND_API_KEY,
      "Skipping: RESEND_API_KEY not set — email service required for success"
    );

    // Wait past the timing gate.
    await page.waitForTimeout(5_500);

    await fillValidForm(page);

    // Turnstile fails closed now (LAC-3546): when the widget is present the
    // submission must carry its token.
    if ((await page.locator(TURNSTILE_INPUT).count()) > 0) {
      const gotToken = await waitForTurnstileToken(page, 20_000);
      test.skip(!gotToken, "Turnstile widget never issued a token in this environment");
    }

    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText("Message Sent")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/thank you for contacting the town of harmony/i)).toBeVisible();
  });
});
