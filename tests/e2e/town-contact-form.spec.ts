/**
 * E2E tests for TownContactForm + submitTownContactForm server action.
 *
 * Anti-regression: verifies the Turnstile non-blocking fix from LAC-1265 is
 * preserved. A missing or invalid Turnstile token must NOT cause the server
 * action to reject the submission.
 *
 * Requires:
 *   - Dev server running at baseURL (started automatically by playwright.config.ts)
 *   - RESEND_API_KEY env var only for the success-path test; all other tests run without it.
 *
 * All tests skip gracefully when /contact returns 404 (page is currently
 * served from page.disabled.tsx and is not active).
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const CONTACT_URL = "/contact";

const VALID_DATA = {
	firstName: "Jane",
	lastName: "Doe",
	email: "jane.doe@example.com",
	inquiryType: "general",
	message: "This is a test message with enough characters to pass validation.",
};

async function fillValidForm(page: Page) {
	await page.locator("#firstName").fill(VALID_DATA.firstName);
	await page.locator("#lastName").fill(VALID_DATA.lastName);
	await page.locator("#email").fill(VALID_DATA.email);
	await page.locator("#inquiryType").selectOption(VALID_DATA.inquiryType);
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
		await expect(page.getByText(/last name is required/i)).toBeVisible();
		await expect(page.getByText(/email is required/i)).toBeVisible();
		await expect(page.getByText(/message must be at least 10 characters/i)).toBeVisible();
	});

	test("blocks submission made within 5 seconds of page load", async ({ page }) => {
		// Fill immediately — beforeEach waits for the form to be visible but no more, so
		// the component mount timestamp (loadedAtRef) is set just before we reach here.
		// Submitting now puts us well under the 5-second gate.
		await fillValidForm(page);
		await page.getByRole("button", { name: /send message/i }).click();

		// The timing gate renders its rejection through the serverError <p role="alert">.
		await expect(page.locator('form > p[role="alert"]')).toContainText(
			/please take a moment before submitting/i,
			{ timeout: 10_000 },
		);
	});

	// --- Anti-regression: Turnstile is non-blocking (LAC-1265) ---
	test("does not block submission when Turnstile token is absent", async ({ page }) => {
		// Wait past the 5-second timing gate before submitting.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);
		await page.getByRole("button", { name: /send message/i }).click();

		// Wait for a terminal state — success message or the server-error alert.
		// This must come BEFORE the negative assertions; otherwise the assertions fire on
		// the empty-of-text initial DOM and pass even when a regression is present.
		const successEl = page.getByText("Message Sent");
		const errorEl = page.locator('form > p[role="alert"]');
		await expect(successEl.or(errorEl)).toBeVisible({ timeout: 15_000 });

		// Now that the response has been rendered, assert no Turnstile-related rejection
		// surfaced. The only acceptable outcomes are success or a downstream error
		// (e.g. "Email service is not configured").
		const bodyText = (await page.locator("body").textContent()) ?? "";
		expect(bodyText).not.toMatch(/turnstile/i);
		expect(bodyText).not.toMatch(/verification failed/i);
	});

	// --- Anti-regression: honeypot is non-blocking ---
	test("does not block submission when honeypot field is filled", async ({ page }) => {
		// Wait past the timing gate.
		await page.waitForTimeout(5_500);

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

		// Wait for a terminal state before asserting anything about page content.
		const successEl = page.getByText("Message Sent");
		const errorEl = page.locator('form > p[role="alert"]');
		await expect(successEl.or(errorEl)).toBeVisible({ timeout: 15_000 });

		// Honeypot is intentionally non-blocking: the server logs a warning and continues.
		// The response must not contain a bot-detection rejection message.
		const bodyText = (await page.locator("body").textContent()) ?? "";
		expect(bodyText).not.toMatch(/bot detected/i);
		expect(bodyText).not.toMatch(/suspicious submission/i);
	});

	// --- Optional success path (requires email service) ---
	test("shows 'Message Sent' success state after valid submission", async ({ page }) => {
		test.skip(
			!process.env.RESEND_API_KEY,
			"Skipping: RESEND_API_KEY not set — email service required for success",
		);

		// Wait past the timing gate.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);
		await page.getByRole("button", { name: /send message/i }).click();

		await expect(page.getByText("Message Sent")).toBeVisible({ timeout: 15_000 });
		await expect(
			page.getByText(/thank you for contacting the town of harmony/i),
		).toBeVisible();
	});
});
