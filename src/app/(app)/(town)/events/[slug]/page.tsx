import { siteConfig } from "@/config/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilderPageContent } from "@/lib/builder-data-server";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { htmlToPlainText } from "@/lib/html-to-text";
import { getMapUrl } from "@/lib/map-utils";
import { pageTitle } from "@/lib/page-title";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { resolveEvents, getEventBySlug } from "@/lib/town-data";
import { formatTime } from "@/lib/utils";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const allEvents = await resolveEvents();
  return allEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  const description =
    htmlToPlainText(event.description) || `${event.title} — Community event in Harmony, NC.`;
  return {
    title: { absolute: pageTitle(event.title) },
    description,
    alternates: { canonical: `${siteConfig.url}/events/${slug}` },
    openGraph: {
      title: `${event.title} — Town of Harmony, NC`,
      description,
      url: `${siteConfig.url}/events/${slug}`,
      ...(event.featuredImage && { images: [{ url: event.featuredImage }] }),
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const builderContent = await getBuilderPageContent(`/events/${slug}`);
  if (builderContent) {
    return <RenderBuilderContent content={builderContent} model="page" />;
  }

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const date = new Date(event.eventDate);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="bg-cream py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-3 font-serif text-3xl font-bold text-sage-dark md:text-4xl">
          {event.title}
        </h1>
        <p className="text-base text-[#4A4640]">
          {dateStr} · {event.eventTime ? formatTime(event.eventTime) : ""}
          {event.endTime && event.endTime !== event.eventTime
            ? ` – ${formatTime(event.endTime)}`
            : ""}
        </p>
        {event.locationAddress && (
          <p className="mb-6 text-base text-[#4A4640]">
            <span className="inline-flex items-center gap-1">
              <a
                href={getMapUrl(event.locationAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-sage-dark hover:underline"
              >
                {event.locationAddress}
              </a>
              <AddressCopyButton
                address={event.locationAddress}
                label={event.title}
                tone="default"
              />
            </span>
          </p>
        )}
        {event.featuredImage && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <img src={event.featuredImage} alt={event.title} className="h-72 w-full object-cover" />
          </div>
        )}
        {event.content && (
          <div
            className="prose-sage prose max-w-none text-[#2D2A24]"
            // Builder richText fields store HTML strings (LAC-3559); the body
            // must be sanitized + rendered as HTML, not printed literally (LAC-3642).
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }}
          />
        )}
        {(event.contactPhone || event.contactEmail) && (
          <div className="mt-8 rounded border border-stone bg-white p-4">
            <h2 className="mb-2 font-semibold">Contact</h2>
            {event.contactPhone && (
              <p>
                <span className="inline-flex items-center gap-1">
                  <a
                    href={`tel:${event.contactPhone.replace(/[^0-9+]/g, "")}`}
                    className="text-sage-dark hover:underline"
                  >
                    {event.contactPhone}
                  </a>
                  <PhoneCopyButton phone={event.contactPhone} label={event.title} tone="default" />
                </span>
              </p>
            )}
            {event.contactEmail && (
              <p>
                <a href={`mailto:${event.contactEmail}`} className="text-sage-dark hover:underline">
                  {event.contactEmail}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
