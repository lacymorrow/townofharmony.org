"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { SEWER_ACCOUNT_REGEX, sewerRateTiers } from "@/data/town/sewer-rates";

const sewerCheckoutSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Valid email is required"),
	address: z.string().min(1, "Service address is required"),
	accountNumber: z.string().regex(SEWER_ACCOUNT_REGEX, "Account number is required"),
	tierId: z.string().min(1, "Rate tier is required"),
	paymentType: z.enum(["one-time", "auto-pay"]),
});

type SewerCheckoutResult =
	| { success: true; url: string }
	| { success: false; error: string };

const getSewerPriceId = (envVar: string): string | undefined =>
	process.env[envVar];

const getRequestBaseUrl = async (): Promise<string> => {
	const h = await headers();
	const host = h.get("x-forwarded-host") ?? h.get("host");
	const proto = h.get("x-forwarded-proto") ?? "https";
	if (host) return `${proto}://${host}`;
	return env.AUTH_URL ?? "http://localhost:3000";
};

export const createSewerCheckoutSession = async (
	formData: FormData,
): Promise<SewerCheckoutResult> => {
	const raw = {
		name: formData.get("name"),
		email: formData.get("email"),
		address: formData.get("address"),
		accountNumber: formData.get("accountNumber"),
		tierId: formData.get("tierId"),
		paymentType: formData.get("paymentType"),
	};

	const parsed = sewerCheckoutSchema.safeParse(raw);
	if (!parsed.success) {
		const firstError = parsed.error.errors[0]?.message ?? "Invalid form data";
		return { success: false, error: firstError };
	}

	const { name, email, address, accountNumber, tierId, paymentType } = parsed.data;

	const tier = sewerRateTiers.find((t) => t.id === tierId);
	if (!tier) {
		return { success: false, error: "Invalid rate tier selected" };
	}

	const isSubscription = paymentType === "auto-pay";
	const envVarName = isSubscription ? tier.stripeSubPriceEnvVar : tier.stripePriceEnvVar;
	const priceId = getSewerPriceId(envVarName);

	if (!priceId) {
		logger.warn("Sewer payment attempted but Stripe Price ID not configured", {
			tier: tier.id,
			paymentType,
			envVar: envVarName,
		});
		return {
			success: false,
			error: "Online payments are not yet available for this rate tier. Please contact Town Hall to pay in person.",
		};
	}

	const baseUrl = await getRequestBaseUrl();

	try {
		const url = await createStripeCheckoutSession({
			priceId,
			mode: isSubscription ? "subscription" : "payment",
			customerEmail: email,
			successUrl: `${baseUrl}/pay/sewer/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${baseUrl}/pay/sewer/cancel`,
			metadata: {
				sewer_account: accountNumber,
				customer_name: name,
				service_address: address,
				tier_id: tier.id,
				tier_name: tier.name,
				payment_type: paymentType,
			},
		});

		if (!url) {
			return {
				success: false,
				error: "Unable to create payment session. Please try again or contact Town Hall.",
			};
		}

		return { success: true, url };
	} catch (error) {
		logger.error("Error creating sewer checkout session:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again or contact Town Hall.",
		};
	}
};
