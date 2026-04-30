import { Phone, Mail, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { sewerContactInfo, isSewerPaymentEnabled } from "@/data/town/sewer-rates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Sewer Services | Town of Harmony",
	description:
		"Sewer service rates and online payment for Town of Harmony residents and businesses.",
};

export default function SewerPage() {
	const onlinePaymentsEnabled = isSewerPaymentEnabled();
	return (
		<div className="container mx-auto max-w-4xl px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sewer Services</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					The Town of Harmony provides sewer services to residential and commercial properties.
					View current rates below and pay your bill online.
				</p>
			</div>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl font-semibold">Pay Your Bill</h2>
				{onlinePaymentsEnabled ? (
					<>
						<p className="mb-4 text-muted-foreground">
							Pay your sewer bill online with a credit or debit card. You can make a one-time payment
							or set up automatic monthly payments.
						</p>
						<Link href="/pay/sewer" className={cn(buttonVariants({ size: "lg" }))}>
							Pay Sewer Bill Online
						</Link>
					</>
				) : (
					<p className="text-muted-foreground">
						To pay your sewer bill, please visit Town Hall or contact the{" "}
						{sewerContactInfo.department} at{" "}
						<a href={`tel:${sewerContactInfo.phone.replace(/[^0-9+]/g, "")}`} className="font-medium underline">
							{sewerContactInfo.phone}
						</a>{" "}
						or email{" "}
						<a href={`mailto:${sewerContactInfo.email}`} className="font-medium underline">
							{sewerContactInfo.email}
						</a>.
					</p>
				)}
			</section>

			<section>
				<h2 className="mb-4 text-2xl font-semibold">Contact {sewerContactInfo.department}</h2>
				<Card>
					<CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
						<div className="flex items-start gap-3">
							<Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Phone</p>
								<p className="text-sm text-muted-foreground">{sewerContactInfo.phone}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Email</p>
								<p className="text-sm text-muted-foreground">{sewerContactInfo.email}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Office Hours</p>
								<p className="text-sm text-muted-foreground">{sewerContactInfo.hours}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Address</p>
								<p className="text-sm text-muted-foreground">{sewerContactInfo.address}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
