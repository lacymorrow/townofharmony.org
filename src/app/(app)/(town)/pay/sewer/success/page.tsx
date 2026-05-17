import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStripeCheckoutSession } from "@/lib/stripe";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sewerContactInfo, isSewerVisible } from "@/data/town/sewer-rates";

export const metadata: Metadata = {
	title: "Payment Successful",
	description: "Your sewer bill payment was processed successfully.",
	robots: { index: false, follow: false },
};

interface PageProps {
	searchParams: Promise<{
		session_id?: string;
	}>;
}

export default async function SewerPaymentSuccessPage({ searchParams }: PageProps) {
	if (!isSewerVisible()) {
		notFound();
	}
	const { session_id } = await searchParams;

	let accountNumber: string | undefined;
	let amount: string | undefined;
	let isSubscription = false;

	const isValidSessionId = session_id && /^cs_(test_|live_)[a-zA-Z0-9]+$/.test(session_id);

	if (isValidSessionId) {
		const session = await getStripeCheckoutSession(session_id);
		if (session) {
			accountNumber = session.metadata?.sewer_account;
			amount = session.amount_total
				? `$${(session.amount_total / 100).toFixed(2)}`
				: undefined;
			isSubscription = session.mode === "subscription";
		}
	}

	return (
		<div className="container mx-auto max-w-lg px-4 py-12">
			<div className="mb-8 text-center">
				<CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
				<h1 className="text-3xl font-bold tracking-tight">Payment Successful</h1>
				<p className="mt-2 text-muted-foreground">
					Thank you for your sewer bill payment.
				</p>
			</div>

			<Card className="mb-8">
				<CardContent className="space-y-3 pt-6">
					{accountNumber && (
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Account</span>
							<span className="text-sm font-medium">{accountNumber}</span>
						</div>
					)}
					{amount && (
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Amount</span>
							<span className="text-sm font-medium">{amount}</span>
						</div>
					)}
					<div className="flex justify-between">
						<span className="text-sm text-muted-foreground">Type</span>
						<span className="text-sm font-medium">
							{isSubscription ? "Auto-Pay (Monthly)" : "One-Time Payment"}
						</span>
					</div>
					<p className="pt-2 text-sm text-muted-foreground">
						A receipt has been sent to your email address.
					</p>
				</CardContent>
			</Card>

			{isSubscription && (
				<p className="mb-6 text-center text-sm text-muted-foreground">
					Your card will be charged automatically each month. You can manage or cancel your
					subscription from the link in your receipt email.
				</p>
			)}

			<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
				<Link href="/sewer" className={cn(buttonVariants({ variant: "outline" }))}>
					Sewer Services
				</Link>
				<Link href="/" className={cn(buttonVariants())}>
					Back to Home
				</Link>
			</div>

			<p className="mt-8 text-center text-sm text-muted-foreground">
				Questions about your payment? Contact {sewerContactInfo.department} at{" "}
				{sewerContactInfo.phone}
			</p>
		</div>
	);
}
