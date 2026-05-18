import { XCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sewerContactInfo, isSewerVisible } from "@/data/town/sewer-rates";

export const metadata: Metadata = {
	title: "Payment Cancelled",
	description: "Your sewer bill payment was cancelled.",
	robots: { index: false, follow: false },
};

export default function SewerPaymentCancelPage() {
	if (!isSewerVisible()) {
		notFound();
	}
	return (
		<div className="container mx-auto max-w-lg px-4 py-12 text-center">
			<XCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
			<h1 className="text-3xl font-bold tracking-tight">Payment Cancelled</h1>
			<p className="mt-2 text-muted-foreground">
				No charge was made to your card. You can try again or pay in person at Town Hall.
			</p>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
				<Link href="/pay/sewer" className={cn(buttonVariants())}>
					Try Again
				</Link>
				<Link href="/sewer" className={cn(buttonVariants({ variant: "outline" }))}>
					Sewer Services
				</Link>
			</div>

			<p className="mt-8 text-sm text-muted-foreground">
				Need help? Contact {sewerContactInfo.department} at {sewerContactInfo.phone}
			</p>
		</div>
	);
}
