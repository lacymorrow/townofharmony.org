import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingDetailBody } from "@/components/town/meetings/meeting-detail-body";
import { siteConfig } from "@/config/site-config";
import { getBuilderPageContent } from "@/lib/builder-data-server";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { getMeetingBySlug } from "@/lib/town-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meeting = await getMeetingBySlug(slug);
  if (!meeting) {
    return {
      title: "Meeting Not Found — Town of Harmony, NC",
      robots: { index: false, follow: false },
    };
  }
  const description = meeting.minutes ?? `${meeting.title} at ${meeting.location}.`;
  return {
    title: `${meeting.title} | Town of Harmony, NC`,
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

  const builderContent = await getBuilderPageContent(`/meetings/${slug}`);
  if (builderContent) {
    return <RenderBuilderContent content={builderContent} model="page" />;
  }

  const meeting = await getMeetingBySlug(slug);
  if (!meeting) notFound();

  return <MeetingDetailBody meeting={meeting} />;
}
