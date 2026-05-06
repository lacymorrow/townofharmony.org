import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SewerPaymentForm } from "@/components/town/sewer-payment-form";
import { sewerContactInfo, sewerRateTiers, isSewerPaymentEnabled } from "@/data/town/sewer-rates";
import type { SewerRateTier } from "@/data/town/sewer-rates";
import { fetchBuilderContent } from "@/lib/builder-data-server";

interface BuilderSewerRate {
	tierId: string;
	name: string;
	description: string;
	location: "in-town" | "out-of-town";
	type: "residential" | "commercial";
	monthlyRate: number;
	sortOrder: number;
}

export const metadata: Metadata = {
	title: "Pay Sewer Bill | Town of Harmony",
	description:
		"Pay your Town of Harmony sewer bill online with a credit or debit card.",
};

export default async function SewerPaymentPage() {
	let displayRates: SewerRateTier[] = sewerRateTiers;
	try {
		const { results } = await fetchBuilderContent<BuilderSewerRate>("town-sewer-rate", {
			sort: { "data.sortOrder": 1 },
			limit: 20,
		});
		if (results.length > 0) {
			displayRates = results.map((r) => {
				const staticTier = sewerRateTiers.find((t) => t.id === r.tierId);
				return {
					id: r.tierId,
					name: r.name,
					description: r.description,
					location: r.location,
					type: r.type,
					monthlyRate: r.monthlyRate,
					stripePriceEnvVar: staticTier?.stripePriceEnvVar ?? "",
					stripeSubPriceEnvVar: staticTier?.stripeSubPriceEnvVar ?? "",
				};
			});
		}
	} catch (err) {
		console.error("Failed to fetch sewer rates from Builder.io:", err);
	}

	if (!isSewerPaymentEnabled(displayRates)) {
		// Online payments not configured — page hidden until Stripe is set up.
		notFound();
	}

	return (
		<div className="container mx-auto max-w-lg px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Pay Sewer Bill</h1>
				<p className="mt-2 text-muted-foreground">
					Pay your sewer bill securely online. Have your account number ready (found on your bill).
				</p>
			</div>

			<SewerPaymentForm stripeEnabled={true} rates={displayRates} />

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Questions? Contact {sewerContactInfo.department} at {sewerContactInfo.phone}
			</p>
		</div>
	);
}
