"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBuilderEntry } from "@/lib/builder-data";
import { businesses as staticBusinesses } from "@/data/town/businesses";
import type { TownBusiness } from "@/data/town/types";

interface TownBusinessDetailProps {
	slug?: string;
}


export const TownBusinessDetail = ({
	slug: slugProp,
}: TownBusinessDetailProps) => {
	const pathname = usePathname();
	const slug =
		slugProp || pathname?.split("/").filter(Boolean).pop() || "";

	const staticFallback = staticBusinesses.find((b) => b.slug === slug) ?? null;
	const { data: business, loading } = useBuilderEntry<TownBusiness>(
		"town-business",
		{ "data.slug": slug },
		{ fallback: staticFallback },
	);

	if (loading) {
		return (
			<section className="bg-warm-white py-12">
				<div className="container mx-auto px-4 max-w-3xl">
					<div className="animate-pulse space-y-4">
						<div className="h-4 w-32 bg-stone/40 rounded" />
						<div className="h-8 w-3/4 bg-stone/40 rounded" />
						<div className="h-48 bg-stone/20 rounded-xl" />
					</div>
				</div>
			</section>
		);
	}

	if (!business) {
		return (
			<section className="bg-warm-white py-16">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">
						Business not found
					</h1>
					<p className="text-sage-dark/70 mb-8">
						The business you are looking for could not be found.
					</p>
					<Link
						href="/business"
						className="inline-flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-sage-dark transition-colors"
					>
						&larr; Back to Business Directory
					</Link>
				</div>
			</section>
		);
	}

	const fullAddress = `${business.address}, ${business.city}, ${business.stateCode} ${business.zipCode}`;

	return (
		<section className="bg-warm-white py-12">
			<div className="container mx-auto px-4 max-w-3xl">
				{/* Back link */}
				<Link
					href="/business"
					className="inline-flex items-center gap-2 text-sage hover:text-sage-dark text-sm font-medium mb-8 transition-colors"
				>
					&larr; Back to Business Directory
				</Link>

				{/* Header with logo */}
				<div className="flex items-start gap-6 mb-6">
					{business.logo && (
						<div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-cream border border-stone">
							<img
								src={business.logo}
								alt={business.name}
								className="w-full h-full object-cover"
								width={800}
								height={600}
							/>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2 mb-2">
							<span className="inline-block bg-wheat/30 text-sage-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
								{business.category}
							</span>
							{business.isVerified && (
								<span className="inline-block bg-sage/15 text-sage-dark border border-sage/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
									Verified
								</span>
							)}
							{business.isFeatured && (
								<span className="inline-block bg-wheat text-sage-deep px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
									Featured
								</span>
							)}
						</div>
						<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark leading-tight">
							{business.name}
						</h1>
					</div>
				</div>

				{/* Description */}
				<p className="text-lg text-sage-dark/80 leading-relaxed mb-8">
					{business.description}
				</p>

				{/* Contact info card */}
				<div className="bg-cream border border-stone rounded-xl p-6 mb-8">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-4">
						Contact Information
					</h2>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{business.contactName && (
							<div>
								<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
									Contact
								</dt>
								<dd className="text-sage-dark font-medium">
									{business.contactName}
								</dd>
							</div>
						)}
						{business.phone && (
							<div>
								<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
									Phone
								</dt>
								<dd>
									<a
										href={`tel:${business.phone}`}
										className="text-sage hover:text-sage-dark font-medium transition-colors"
									>
										{business.phone}
									</a>
								</dd>
							</div>
						)}
						{business.email && (
							<div>
								<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
									Email
								</dt>
								<dd>
									<a
										href={`mailto:${business.email}`}
										className="text-sage hover:text-sage-dark font-medium transition-colors"
									>
										{business.email}
									</a>
								</dd>
							</div>
						)}
						{business.website && (
							<div>
								<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
									Website
								</dt>
								<dd>
									<a
										href={business.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sage hover:text-sage-dark font-medium transition-colors"
									>
										{business.website}
									</a>
								</dd>
							</div>
						)}
						<div className="sm:col-span-2">
							<dt className="text-sm font-semibold uppercase tracking-wide text-sage-dark/50 mb-1">
								Address
							</dt>
							<dd className="text-sage-dark font-medium">
								{fullAddress}
							</dd>
						</div>
					</dl>
				</div>

				{/* Hours */}
				{business.hours && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Business Hours
						</h2>
						<div className="bg-cream border border-stone rounded-xl p-5">
							<p className="text-base text-sage-dark/80 whitespace-pre-line">
								{business.hours}
							</p>
						</div>
					</div>
				)}

				{/* Images gallery */}
				{business.images && business.images.length > 0 && (
					<div className="mb-8">
						<h2 className="text-lg font-serif font-bold text-sage-dark mb-3">
							Photos
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{business.images.map(
								(img, index) =>
									img.image && (
										<div
											key={img.id || index}
											className="rounded-xl overflow-hidden bg-cream border border-stone aspect-[4/3]"
										>
											<img
												src={img.image}
												alt={`${business.name} photo ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</div>
									),
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};
