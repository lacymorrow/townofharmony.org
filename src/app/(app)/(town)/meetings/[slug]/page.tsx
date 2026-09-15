import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingDetailBody } from "@/components/town/meetings/meeting-detail-body";
import { siteConfig } from "@/config/site-config";
import { getBuilderPageContent } from "@/lib/builder-data-server";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { htmlToPlainText } from "@/lib/html-to-text";
import { pageTitle } from "@/lib/page-title";
import { getMeetingBySlug } from "@/lib/town-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Builder's page/entry fetch and our Builder list fetch both call dynamic APIs
// (headers/cookies via preview mode + no-store), so this route can't be
// prerendered by ISR — attempting to do so surfaces as `DYNAMIC_SERVER_USAGE`
// 500s on every meeting-detail URL in prod. Force dynamic rendering per
// request; the underlying Builder responses are still React-cache/deduped.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meeting = await getMeetingBySlug(slug);
  if (!meeting) {
    return {
      title: "Meeting Not Found",
      robots: { index: false, follow: false },
    };
  }
  const rawDescription = meeting.minutes
    ? htmlToPlainText(meeting.minutes)
    : `${meeting.title} at ${meeting.location}.`;
  const description =
    rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}…` : rawDescription;
  return {
    title: { absolute: pageTitle(meeting.title) },
    description,
    alternates: { canonical: `${siteConfig.url}/meetings/${slug}` },
    openGraph: {
      title: `${meeting.title} — Town of Harmony, NC`,
      description,
      url: `${siteConfig.url}/meetings/${slug}`,
    },
  };
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Server-render known meetings. The Builder "/meetings/:slug" template page
  // only wraps the client-fetching TownMeetingDetail component, so serving it
  // here ships a loading skeleton as the HTML (no <h1>, no meeting content)
  // and crawlers index an empty page (Ahrefs "H1 tag missing", LAC-3921).
  // Builder content still serves one-off pages for slugs not in the data model.
  const meeting = await getMeetingBySlug(slug);
  if (meeting) {
    return <MeetingDetailBody meeting={meeting} />;
  }

  const builderContent = await getBuilderPageContent(`/meetings/${slug}`);
  if (builderContent) {
    return <RenderBuilderContent content={builderContent} model="page" />;
  }

  notFound();
}
