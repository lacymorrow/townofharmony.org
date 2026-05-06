import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SewerPaymentForm } from "@/components/town/sewer-payment-form";
import { sewerContactInfo, isSewerPaymentEnabled } from "@/data/town/sewer-rates";

export const metadata: Metadata = {
	title: "Pay Sewer Bill | Town of Harmony",
	description:
		"Pay your Town of Harmony sewer bill online with a credit or debit card.",
};

export default function SewerPaymentPage() {
	if (!isSewerPaymentEnabled()) {
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

			<SewerPaymentForm stripeEnabled={true} />

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Questions? Contact {sewerContactInfo.department} at {sewerContactInfo.phone}
			</p>
		</div>
	);
}
