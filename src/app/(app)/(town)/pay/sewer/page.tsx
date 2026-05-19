import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SewerPaymentForm } from "@/components/town/sewer-payment-form";
import { sewerContactInfo, sewerRateTiers, type SewerRateDisplay } from "@/data/town/sewer-rates";
import { isFeatureEnabled } from "@/lib/preview-flags";
import { fetchBuilderContent } from "@/lib/builder-data-server";

export const metadata: Metadata = {
	title: "Pay Sewer Bill | Town of Harmony, NC",
	description:
		"Pay your Town of Harmony sewer bill online with a credit or debit card. Convenient online payment for Harmony, NC sewer customers.",
	alternates: {
		canonical: "https://www.townofharmony.org/pay/sewer",
	},
	openGraph: {
		title: "Pay Sewer Bill — Town of Harmony, NC",
		description:
			"Pay your Town of Harmony sewer bill online with a credit or debit card. Convenient online payment for Harmony, NC sewer customers.",
		url: "https://www.townofharmony.org/pay/sewer",
	},
};

interface BuilderSewerRate {
	tierId: string;
	name: string;
	description: string;
	monthlyRate: number;
	sortOrder: number;
}

export default async function SewerPaymentPage() {
	if (!await isFeatureEnabled("sewer")) {
		notFound();
	}

	let rates: SewerRateDisplay[] = sewerRateTiers.map(
		({ id, name, description, monthlyRate }) => ({ id, name, description, monthlyRate }),
	);

	try {
		const { results } = await fetchBuilderContent<BuilderSewerRate>("town-sewer-rate", {
			sort: { "data.sortOrder": 1 },
			limit: 20,
		});
		// Builder.io rates are display-only. The actual Stripe charge is determined
		// by the tierId lookup in the server action against the static sewerRateTiers —
		// keep those env vars and CMS values in sync when rates change.
		// Only show CMS tiers that have a matching static tier so the form never
		// surfaces a rate the server action cannot process.
		const valid = results.filter(
			(r) =>
				r.tierId &&
				typeof r.monthlyRate === "number" &&
				sewerRateTiers.some((t) => t.id === r.tierId),
		);
		if (valid.length > 0) {
			rates = valid.map((r) => ({
				id: r.tierId,
				name: r.name,
				description: r.description,
				monthlyRate: r.monthlyRate,
			}));
		}
	} catch {
		// fall through to static rates
	}

	return (
		<div className="container mx-auto max-w-lg px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Pay Sewer Bill</h1>
				<p className="mt-2 text-muted-foreground">
					Pay your sewer bill securely online. Have your account number ready (found on your bill).
				</p>
			</div>

			<SewerPaymentForm stripeEnabled={true} rates={rates} />

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Questions? Contact {sewerContactInfo.department} at {sewerContactInfo.phone}
			</p>
		</div>
	);
}
