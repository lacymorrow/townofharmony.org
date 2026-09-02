import { Phone, Mail, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sewerContactInfo, sewerRateTiers, isSewerPaymentEnabled } from "@/data/town/sewer-rates";
import { isFeatureEnabled } from "@/lib/preview-flags";
import type { SewerRateTier } from "@/data/town/sewer-rates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchBuilderContent } from "@/lib/builder-data-server";
import { getBuilderSettings } from "@/lib/town-settings-server";
import { siteConfig } from "@/config/site-config";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { getMapUrl } from "@/lib/map-utils";

interface BuilderSewerRate {
	tierId: string;
	name: string;
	description: string;
	location: "in-town" | "out-of-town";
	// "commercial" is the legacy value — normalize on read so old CMS records don't break
	type: "residential" | "nonresidential" | "commercial";
	monthlyRate: number;
}

export const metadata: Metadata = {
	title: "Sewer Services & Online Bill Pay | Town of Harmony, NC",
	description:
		"View sewer service rates and pay your bill online for the Town of Harmony, NC. Residential and commercial sewer information for Harmony, North Carolina.",
	alternates: {
		canonical: `${siteConfig.url}/sewer`,
	},
	openGraph: {
		title: "Sewer Services — Town of Harmony, NC",
		description:
			"View sewer service rates and pay your bill online for the Town of Harmony, NC. Residential and commercial sewer information for Harmony, North Carolina.",
		url: `${siteConfig.url}/sewer`,
	},
};

export default async function SewerPage() {
	if (!await isFeatureEnabled("sewer")) {
		notFound();
	}

	const sewerCopy = (await getBuilderSettings()).sewer;

	let displayRates: SewerRateTier[] = sewerRateTiers;
	try {
		const { results } = await fetchBuilderContent<BuilderSewerRate>("town-sewer-rate", {
			sort: { priority: -1 },
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
					type: r.type === "commercial" ? "nonresidential" : r.type,
					monthlyRate: r.monthlyRate,
					stripePriceEnvVar: staticTier?.stripePriceEnvVar ?? "",
					stripeSubPriceEnvVar: staticTier?.stripeSubPriceEnvVar ?? "",
				};
			});
		}
	} catch (err) {
		console.error("Failed to fetch sewer rates from Builder.io:", err);
	}

	const onlinePaymentsEnabled = isSewerPaymentEnabled(displayRates);

	return (
		<div className="container mx-auto max-w-4xl px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{sewerCopy.pageHeading}</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					{sewerCopy.pageDescription}
				</p>
			</div>

			<section className="mb-12">
				<h2 className="mb-4 text-2xl font-semibold">Current Rates</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					{displayRates.map((tier) => (
						<Card key={tier.id}>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">{tier.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold">
									${tier.monthlyRate.toFixed(2)}
									<span className="text-sm font-normal text-muted-foreground">/month</span>
								</p>
								<p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

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
						<span className="inline-flex items-center gap-1">
							<a href={`tel:${sewerCopy.contactPhone.replace(/[^0-9+]/g, "")}`} className="font-medium underline">
								{sewerCopy.contactPhone}
							</a>
							<PhoneCopyButton phone={sewerCopy.contactPhone} label={sewerContactInfo.department} tone="default" />
						</span>{" "}
						or use our{" "}
						<a href="/contact" className="font-medium underline">
							contact form
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
								<p className="text-sm text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<a href={`tel:+1${sewerCopy.contactPhone.replace(/\D/g, "")}`} className="underline hover:text-foreground">
											{sewerCopy.contactPhone}
										</a>
										<PhoneCopyButton phone={sewerCopy.contactPhone} label={sewerContactInfo.department} tone="default" />
									</span>
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Contact</p>
								<a href="/contact" className="text-sm text-muted-foreground underline hover:text-foreground">Contact form</a>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Office Hours</p>
								<p className="text-sm text-muted-foreground">{sewerCopy.contactHours}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Address</p>
								<p className="text-sm text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<a href={getMapUrl(sewerCopy.contactAddress)} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
											{sewerCopy.contactAddress}
										</a>
										<AddressCopyButton address={sewerCopy.contactAddress} label={sewerContactInfo.department} tone="default" />
									</span>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
