"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { businesses as staticBusinesses } from "@/data/town/businesses";
import type { TownBusiness } from "@/data/town/types";
import { useBuilderEntry } from "@/lib/builder-data";
import { getMapUrl } from "@/lib/map-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";

interface TownBusinessDetailProps {
  slug?: string;
}

const TownBusinessDetailInner = ({ slug: slugProp }: TownBusinessDetailProps) => {
  const pathname = usePathname();
  const rawSlug = slugProp || pathname?.split("/").filter(Boolean).pop() || "";
  const slug = (() => {
    try {
      return decodeURIComponent(rawSlug)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
    } catch {
      return rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    }
  })();

  const staticFallback = staticBusinesses.find((b) => b.slug === slug) ?? null;
  const { data: business, loading } = useBuilderEntry<TownBusiness>(
    "town-business",
    { "data.slug": slug },
    { fallback: staticFallback }
  );

  if (loading) {
    return (
      <section className="bg-warm-white py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-stone/40" />
            <div className="h-8 w-3/4 rounded bg-stone/40" />
            <div className="h-48 rounded-xl bg-stone/20" />
          </div>
        </div>
      </section>
    );
  }

  if (!business) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-sage-dark">Business not found</h1>
          <p className="mb-8 text-sage-dark/70">
            The business you are looking for could not be found.
          </p>
          <Link
            href="/business"
            className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
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
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back link */}
        <Link
          href="/business"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sage transition-colors hover:text-sage-dark"
        >
          &larr; Back to Business Directory
        </Link>

        {/* Header with logo */}
        <div className="mb-6 flex items-start gap-6">
          {business.logo && (
            <LightboxImage
              src={business.logo}
              alt={business.name}
              wrapperClassName="shrink-0 w-20 h-20 rounded-xl bg-cream border border-stone"
              className="h-full w-full object-cover"
              width={800}
              height={600}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-wheat/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-dark">
                {business.category}
              </span>
              {business.isVerified && (
                <span className="inline-block rounded-full border border-sage/30 bg-sage/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-dark">
                  Verified
                </span>
              )}
              {business.isFeatured && (
                <span className="inline-block rounded-full bg-wheat px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage-deep">
                  Featured
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-sage-dark md:text-4xl">
              {business.name}
            </h1>
          </div>
        </div>

        {/* Description */}
        <div
          className="prose prose-lg mb-8 max-w-none leading-relaxed text-sage-dark/80"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.description || "") }}
        />

        {/* Contact info card */}
        <div className="mb-8 rounded-xl border border-stone bg-cream p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
            Contact Information
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {business.contactName && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Contact
                </dt>
                <dd className="font-medium text-sage-dark">{business.contactName}</dd>
              </div>
            )}
            {business.phone && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Phone
                </dt>
                <dd className="flex items-center gap-1">
                  <a
                    href={`tel:${business.phone}`}
                    className="font-medium text-sage transition-colors hover:text-sage-dark"
                  >
                    {business.phone}
                  </a>
                  <PhoneCopyButton phone={business.phone} label={business.name} tone="default" />
                </dd>
              </div>
            )}
            {business.email && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${business.email}`}
                    className="font-medium text-sage transition-colors hover:text-sage-dark"
                  >
                    {business.email}
                  </a>
                </dd>
              </div>
            )}
            {business.website && (
              <div>
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Website
                </dt>
                <dd>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sage transition-colors hover:text-sage-dark"
                  >
                    {business.website}
                  </a>
                </dd>
              </div>
            )}
            {business.address && (
              <div className="sm:col-span-2">
                <dt className="mb-1 text-sm font-semibold uppercase tracking-wide text-sage-dark/50">
                  Address
                </dt>
                <dd className="flex items-center gap-1 font-medium text-sage-dark">
                  <a
                    href={getMapUrl(fullAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-sage-dark"
                  >
                    {fullAddress}
                  </a>
                  <AddressCopyButton address={fullAddress} label={business.name} tone="default" />
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Hours */}
        {business.hours && (
          <div className="mb-8">
            <h2 className="mb-3 font-serif text-lg font-bold text-sage-dark">Business Hours</h2>
            <div
              className="prose prose-lg max-w-none rounded-xl border border-stone bg-cream p-5 text-sage-dark/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.hours) }}
            />
          </div>
        )}

        {/* Images gallery */}
        {business.images && business.images.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-serif text-lg font-bold text-sage-dark">Photos</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {business.images.map(
                (img, index) =>
                  img.image && (
                    <LightboxImage
                      key={img.id || index}
                      src={img.image}
                      alt={`${business.name} photo ${index + 1}`}
                      wrapperClassName="rounded-xl bg-cream border border-stone aspect-[4/3]"
                      className="h-full w-full object-cover"
                    />
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const BusinessDetailErrorFallback = () => (
  <section className="bg-warm-white py-16">
    <div className="container mx-auto px-4 text-center">
      <p className="mb-8 text-sage-dark/70">
        Unable to load this business listing. Please try refreshing the page.
      </p>
      <Link
        href="/business"
        className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
      >
        &larr; Back to Business Directory
      </Link>
    </div>
  </section>
);

export const TownBusinessDetail = (props: TownBusinessDetailProps) => (
  <ErrorBoundary fallback={BusinessDetailErrorFallback}>
    <TownBusinessDetailInner {...props} />
  </ErrorBoundary>
);
