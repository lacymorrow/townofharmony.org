"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { businesses as staticBusinesses } from "@/data/town/businesses";
import type { TownBusiness } from "@/data/town/types";
import { useBuilderEntry } from "@/lib/builder-data";
import { sanitizeHtml } from "@/lib/sanitize-html";

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
          <h1 className="text-3xl font-serif font-bold text-sage-dark mb-4">Business not found</h1>
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
            <LightboxImage
              src={business.logo}
              alt={business.name}
              wrapperClassName="shrink-0 w-20 h-20 rounded-xl bg-cream border border-stone"
              className="w-full h-full object-cover"
              width={800}
              height={600}
            />
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
        <div
          className="prose prose-lg max-w-none text-sage-dark/80 leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.description || "") }}
        />

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
                <dd className="text-sage-dark font-medium">{business.contactName}</dd>
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
              <dd className="text-sage-dark font-medium">{fullAddress}</dd>
            </div>
          </dl>
        </div>

        {/* Hours */}
        {business.hours && (
          <div className="mb-8">
            <h2 className="text-lg font-serif font-bold text-sage-dark mb-3">Business Hours</h2>
            <div
              className="prose prose-lg max-w-none bg-cream border border-stone rounded-xl p-5 text-sage-dark/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.hours) }}
            />
          </div>
        )}

        {/* Images gallery */}
        {business.images && business.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-serif font-bold text-sage-dark mb-3">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {business.images.map(
                (img, index) =>
                  img.image && (
                    <LightboxImage
                      key={img.id || index}
                      src={img.image}
                      alt={`${business.name} photo ${index + 1}`}
                      wrapperClassName="rounded-xl bg-cream border border-stone aspect-[4/3]"
                      className="w-full h-full object-cover"
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
      <p className="text-sage-dark/70 mb-8">
        Unable to load this business listing. Please try refreshing the page.
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

export const TownBusinessDetail = (props: TownBusinessDetailProps) => (
  <ErrorBoundary fallback={BusinessDetailErrorFallback}>
    <TownBusinessDetailInner {...props} />
  </ErrorBoundary>
);
