"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/primitives/error-boundary";
import { MeetingDetailBody } from "@/components/town/meetings/meeting-detail-body";
import { meetings as staticMeetings } from "@/data/town/meetings";
import type { TownMeeting } from "@/data/town/types";
import { useBuilderData } from "@/lib/builder-data";
import { findMeetingBySlug, getMeetingSlugBase } from "@/lib/meeting-slug";

interface TownMeetingDetailProps {
  slug?: string;
}

const TownMeetingDetailInner = ({ slug: slugProp }: TownMeetingDetailProps) => {
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

  // Editors reuse slugs across months ("town-council-meeting"), so list links
  // carry a canonical date-suffixed slug that may not exist verbatim in
  // Builder. Fetch entries matching either form and resolve client-side:
  // canonical match first (disambiguates colliding raw slugs by date), then
  // exact raw match for legacy links.
  const { data: candidates, loading } = useBuilderData<TownMeeting>("town-meeting", {
    query: { "data.slug": { $in: [slug, getMeetingSlugBase(slug)] } },
    fallback: staticMeetings,
  });
  const meeting = findMeetingBySlug(candidates, slug) ?? findMeetingBySlug(staticMeetings, slug);

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

  if (!meeting) {
    return (
      <section className="bg-warm-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-sage-dark">Meeting not found</h1>
          <p className="mb-8 text-sage-dark/70">
            The meeting you are looking for could not be found.
          </p>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            &larr; Back to Meetings
          </Link>
        </div>
      </section>
    );
  }

  return <MeetingDetailBody meeting={meeting} />;
};

const MeetingDetailErrorFallback = () => (
  <section className="bg-warm-white py-16">
    <div className="container mx-auto px-4 text-center">
      <p className="mb-8 text-sage-dark/70">
        Unable to load this meeting. Please try refreshing the page.
      </p>
      <Link
        href="/meetings"
        className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
      >
        &larr; Back to Meetings
      </Link>
    </div>
  </section>
);

export const TownMeetingDetail = (props: TownMeetingDetailProps) => (
  <ErrorBoundary fallback={MeetingDetailErrorFallback}>
    <TownMeetingDetailInner {...props} />
  </ErrorBoundary>
);
