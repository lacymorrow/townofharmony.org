export interface SewerRateTier {
	id: string;
	name: string;
	description: string;
	location: "in-town" | "out-of-town";
	type: "residential" | "commercial";
	monthlyRate: number;
	stripePriceEnvVar: string;
	stripeSubPriceEnvVar: string;
}

export type SewerRateDisplay = Pick<SewerRateTier, "id" | "name" | "description" | "monthlyRate">;

export const sewerRateTiers: SewerRateTier[] = [
	{
		id: "intown-residential",
		name: "In-Town Residential",
		description: "For residential properties within town limits",
		location: "in-town",
		type: "residential",
		monthlyRate: 45,
		stripePriceEnvVar: "STRIPE_PRICE_SEWER_INTOWN_RESIDENTIAL",
		stripeSubPriceEnvVar: "STRIPE_PRICE_SEWER_INTOWN_RESIDENTIAL_SUB",
	},
	{
		id: "outtown-residential",
		name: "Out-of-Town Residential",
		description: "For residential properties outside town limits",
		location: "out-of-town",
		type: "residential",
		monthlyRate: 67.5,
		stripePriceEnvVar: "STRIPE_PRICE_SEWER_OUTTOWN_RESIDENTIAL",
		stripeSubPriceEnvVar: "STRIPE_PRICE_SEWER_OUTTOWN_RESIDENTIAL_SUB",
	},
	{
		id: "intown-commercial",
		name: "In-Town Commercial",
		description: "For commercial properties within town limits",
		location: "in-town",
		type: "commercial",
		monthlyRate: 80,
		stripePriceEnvVar: "STRIPE_PRICE_SEWER_INTOWN_COMMERCIAL",
		stripeSubPriceEnvVar: "STRIPE_PRICE_SEWER_INTOWN_COMMERCIAL_SUB",
	},
	{
		id: "outtown-commercial",
		name: "Out-of-Town Commercial",
		description: "For commercial properties outside town limits",
		location: "out-of-town",
		type: "commercial",
		monthlyRate: 120,
		stripePriceEnvVar: "STRIPE_PRICE_SEWER_OUTTOWN_COMMERCIAL",
		stripeSubPriceEnvVar: "STRIPE_PRICE_SEWER_OUTTOWN_COMMERCIAL_SUB",
	},
];

// Account numbers are validated as a non-empty string. The exact format is
// determined by the Town's billing system and may appear on the customer's
// paper bill.
export const SEWER_ACCOUNT_REGEX = /^.{1,40}$/;

export const sewerContactInfo = {
	department: "Public Works Department",
	phone: "(704) 546-2339",
	email: "admin@townofharmony.org",
	hours: "Monday - Friday, 8:00 AM - 5:00 PM",
	address: "Town of Harmony, PO Box 428, Harmony, NC 28634",
};

/**
 * Whether the sewer section is visible at all. Uses a NEXT_PUBLIC_ var so it
 * is safe to call from both server and client components.
 */
export const isSewerVisible = (): boolean =>
	!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Online sewer payments are available only when Stripe is configured AND at
 * least one sewer rate-tier Stripe price ID is set in the environment.
 *
 * Server-only — do not import from client components. The pre-rendered page
 * decides at build time whether the form or the "coming soon" notice ships.
 */
export const isSewerPaymentEnabled = (
	tiers: SewerRateTier[] = sewerRateTiers,
): boolean => {
	if (!process.env.STRIPE_SECRET_KEY) return false;
	if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return false;
	return tiers.some(
		(tier) =>
			!!process.env[tier.stripePriceEnvVar] ||
			!!process.env[tier.stripeSubPriceEnvVar],
	);
};
