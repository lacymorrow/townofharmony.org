/**
 * E2E tests for ContactForm + submitContactForm server action.
 *
 * The generic ContactForm (src/components/forms/contact-form.tsx) is distinct
 * from TownContactForm. It uses a single "Name" field, an optional "Contact
 * Info" field (email or phone), and a "Message" textarea. It surfaces results
 * via the shadcn Radix toast (useToast), not Sonner.
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
	// Scope to the form so the regex doesn't match other labeled elements (nav, etc.)
	const form = page.locator("form");
	await form.getByLabel(/^name$/i).fill(VALID_DATA.name);
	await form.getByLabel(/message/i).fill(VALID_DATA.message);
}

// Wait for either the success or error toast from the shadcn Radix useToast system.
// ContactForm emits: { title: "Message sent!" } on success, { title: "Error" } on failure.
async function waitForToast(page: Page, timeout = 15_000) {
	const successToast = page.getByText("Message sent!");
	const errorToast = page.getByText("Error", { exact: true });
	await expect(successToast.or(errorToast)).toBeVisible({ timeout });
}

test.describe("Generic Contact Form", () => {
	test.describe.configure({ mode: "serial" });

	test.beforeEach(async ({ page }) => {
		const response = await page.goto(CONTACT_URL);
		if (!response || response.status() === 404) {
			test.skip(
				true,
				`${CONTACT_URL} returns 404 — ContactForm is not mounted on any active route yet`,
			);
		}
		// Wait for the form's first input to be interactive, not networkidle, which is
		// unreliable in Next.js dev (HMR websockets keep the network open).
		await page.locator("form").getByLabel(/^name$/i).waitFor({ state: "visible", timeout: 10_000 });
	});

	test("renders name, message, and submit fields", async ({ page }) => {
		const form = page.locator("form");
		await expect(form.getByLabel(/^name$/i)).toBeVisible();
		await expect(form.getByLabel(/message/i)).toBeVisible();
		await expect(form.getByRole("button", { name: /send message/i })).toBeVisible();
	});

	test("blocks submission made within 5 seconds of page load", async ({ page }) => {
		// Fill immediately — component mount timestamp (loadedAtRef) was set in beforeEach;
		// submitting now puts us well under the 5-second gate.
		await fillValidForm(page);
		await page.locator("form").getByRole("button", { name: /send message/i }).click();

		// submitContactForm returns { success: false, error: "Please take a moment..." },
		// which ContactForm surfaces as a destructive toast (title: "Error", description: <message>).
		await expect(page.getByText(/please take a moment before submitting/i)).toBeVisible({
			timeout: 10_000,
		});
	});

	// --- Anti-regression: Turnstile is non-blocking (LAC-1265) ---
	test("does not block submission when Turnstile token is absent", async ({ page }) => {
		// Wait past the 5-second timing gate.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);
		await page.locator("form").getByRole("button", { name: /send message/i }).click();

		// Wait for a terminal state FIRST — otherwise the negative assertions below fire on the
		// initial empty DOM and pass even if a regression re-enables Turnstile blocking.
		await waitForToast(page);

		// Now that the toast has rendered, assert no Turnstile-related rejection surfaced.
		const bodyText = (await page.locator("body").textContent()) ?? "";
		expect(bodyText).not.toMatch(/turnstile/i);
		expect(bodyText).not.toMatch(/verification failed/i);
	});

	// --- Anti-regression: honeypot is non-blocking ---
	test("does not block submission when honeypot field is filled", async ({ page }) => {
		// Wait past the timing gate.
		await page.waitForTimeout(5_500);

		await fillValidForm(page);

		// Simulate a bot filling the hidden honeypot input.
		// ContactForm registers `website` via react-hook-form; we use the native setter + event
		// dispatch so RHF's onChange listener picks up the value before submit fires.
		// contactFormSchema includes `website: z.string().optional()` so it reaches the server.
		await page.evaluate(() => {
			const el = document.querySelector<HTMLInputElement>('input[name="website"]');
			if (el) {
				const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
				setter?.call(el, "http://spam.example.com");
				el.dispatchEvent(new Event("input", { bubbles: true }));
				el.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		await page.locator("form").getByRole("button", { name: /send message/i }).click();

		// Wait for a terminal state before asserting page content.
		await waitForToast(page);

		// Honeypot is non-blocking by design — the server logs a warning and continues.
		const bodyText = (await page.locator("body").textContent()) ?? "";
		expect(bodyText).not.toMatch(/bot detected/i);
		expect(bodyText).not.toMatch(/suspicious submission/i);
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
		await page.locator("form").getByRole("button", { name: /send message/i }).click();

		// ContactForm emits { title: "Message sent!", description: "We'll get back to you..." }
		await expect(page.getByText("Message sent!")).toBeVisible({ timeout: 15_000 });
	});
});
