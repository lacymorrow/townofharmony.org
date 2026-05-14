/**
 * E2E tests for ContactForm + submitContactForm server action.
 *
 * The generic ContactForm (src/components/forms/contact-form.tsx) is distinct
 * from TownContactForm. It uses a single "Name" field, an optional "Contact
 * Info" field (email or phone), and a "Message" textarea.
 *
 * NOTE: As of the current branch, ContactForm is not rendered on any active
 * route. These tests target CONTACT_FORM_URL (default "/contact-us") and skip
 * gracefully when the page returns 404. They will begin running once the form
 * is wired up to a route.
 *
 * Anti-regression goal: the same Turnstile non-blocking behaviour tested in
 * town-contact-form.spec.ts must hold for this action too (LAC-1265).
 *
 * Requires:
 *   - CONTACT_FORM_URL env var (optional, defaults to "/contact-us")
 *   - RESEND_API_KEY env var only for the success-path test
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const CONTACT_URL = process.env.CONTACT_FORM_URL ?? "/contact-us";

const VALID_DATA = {
	name: "Jane Doe",
	message: "This is a test message with enough characters to pass validation.",
};

async function fillValidForm(page: Page) {
	await page.getByLabel(/^name$/i).fill(VALID_DATA.name);
	await page.getByLabel(/message/i).fill(VALID_DATA.message);
}

test.describe("Generic Contact Form", () => {
	test.beforeEach(async ({ page }) => {
		const response = await page.goto(CONTACT_URL);
		if (!response || response.status() === 404) {
			test.skip(
				true,
				`${CONTACT_URL} returns 404 — ContactForm is not mounted on any active route yet`,
			);
		}
		await page.waitForLoadState("networkidle");
	});

	test("renders name, message, and submit fields", async ({ page }) => {
		await expect(page.getByLabel(/^name$/i)).toBeVisible();
		await expect(page.getByLabel(/message/i)).toBeVisible();
		await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
	});

	test("blocks submission made within 5 seconds of page load", async ({ page }) => {
		// Fill immediately — the timing gate rejects submissions <5s after mount.
		await fillValidForm(page);
		await page.getByRole("button", { name: /send message/i }).click();

		// The server returns { success: false, error: "Please take a moment before submitting." }
		// which surfaces via the toast (destructive variant).
		await expect(page.locator("body")).toContainText(/please take a moment before submitting/i, {
			timeout: 10_000,
		});
	});

	// --- Anti-regression: Turnstile is non-blocking (LAC-1265) ---
	test("does not block submission when Turnstile token is absent", async ({ page }) => {
		// Wait past the 5-second timing gate.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);
		await page.getByRole("button", { name: /send message/i }).click();

		// A missing Turnstile token must NOT surface a Turnstile-related error.
		await expect(page.locator("body")).not.toContainText(/turnstile/i, { timeout: 10_000 });
		await expect(page.locator("body")).not.toContainText(/verification failed/i, {
			timeout: 10_000,
		});

		// The server must respond with either a success toast or a downstream error toast.
		// The ContactForm uses shadcn toast (not an <alert> role element).
		await expect(page.locator("[data-sonner-toast]").or(page.locator("[role='alert']"))).toBeVisible(
			{ timeout: 15_000 },
		);
	});

	// --- Anti-regression: honeypot is non-blocking ---
	test("does not block submission when honeypot field is filled", async ({ page }) => {
		// Wait past the timing gate.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);

		// Simulate a bot filling the hidden honeypot field.
		// ContactForm uses react-hook-form; dispatch an input event so RHF picks up the value.
		await page.evaluate(() => {
			const el = document.querySelector<HTMLInputElement>('input[name="website"]');
			if (el) {
				const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					"value",
				)?.set;
				nativeInputValueSetter?.call(el, "http://spam.example.com");
				el.dispatchEvent(new Event("input", { bubbles: true }));
				el.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		await page.getByRole("button", { name: /send message/i }).click();

		// Honeypot is non-blocking — no bot-detection error should surface.
		await expect(page.locator("body")).not.toContainText(/bot|spam|honeypot/i, {
			timeout: 10_000,
		});

		// Should receive a real response.
		await expect(page.locator("[data-sonner-toast]").or(page.locator("[role='alert']"))).toBeVisible(
			{ timeout: 15_000 },
		);
	});

	// --- Optional success path (requires email service) ---
	test("shows success toast after valid submission", async ({ page }) => {
		test.skip(
			!process.env.RESEND_API_KEY,
			"RESEND_API_KEY not set — email service required for success path",
		);

		// Wait past the timing gate.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);
		await page.getByRole("button", { name: /send message/i }).click();

		await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 15_000 });
	});
});
