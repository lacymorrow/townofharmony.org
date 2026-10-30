"use client";

import { useEffect, useState } from "react";
import { DataLink } from "@/components/primitives/data-link";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface TownAnnouncementBarProps {
  message?: string;
  level?: "info" | "warning" | "critical";
  ctaText?: string;
  ctaHref?: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}

const levelStyles: Record<string, { bar: string; badge: string; badgeLabel: string }> = {
  info: {
    bar: "bg-[#EAF3EA] border-b border-[#B8D4B8]",
    badge: "bg-sage text-white",
    badgeLabel: "Notice",
  },
  warning: {
    bar: "bg-[#FEF9EC] border-b border-[#F0D58C]",
    badge: "bg-[#B8860B] text-white",
    badgeLabel: "Warning",
  },
  critical: {
    bar: "bg-[#FEF2F2] border-b border-[#FECACA]",
    badge: "bg-barn-red text-white",
    badgeLabel: "Alert",
  },
};

export const TownAnnouncementBar = ({
  message,
  level = "info",
  ctaText,
  ctaHref,
  isActive = true,
  startsAt,
  endsAt,
}: TownAnnouncementBarProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isActive || !message || !mounted) return null;

  const now = Date.now();
  if (startsAt && new Date(startsAt).getTime() > now) return null;
  if (endsAt && new Date(endsAt).getTime() < now) return null;

  const style = levelStyles[level] ?? levelStyles.info!;

  return (
    <div className={`${style.bar} py-2.5`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`${style.badge} flex-shrink-0 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide`}
          >
            {style.badgeLabel}
          </span>
          <div
            className="prose prose-sm max-w-none flex-1 text-[#2D2A24]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(message, { stripLinks: true }) }}
          />
          {ctaText && ctaHref && (
            <DataLink
              href={ctaHref}
              className="flex-shrink-0 text-sm font-semibold text-sage underline hover:text-sage-dark"
            >
              {ctaText}
            </DataLink>
          )}
        </div>
      </div>
    </div>
  );
};
