"use client";

import Link from "next/link";
import { AlertCircle, Briefcase, Calendar, FileText, Home, Phone, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isHrefHidden } from "@/lib/hidden-hrefs";
import { getNavigationSync } from "@/lib/town-data-client";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Briefcase,
  Home,
  Phone,
  Star,
};

interface QuickLinkItem {
  icon?: string;
  title: string;
  description: string;
  href: string;
}

interface TownQuickLinksProps {
  links?: QuickLinkItem[];
}

export const TownQuickLinks = ({ links }: TownQuickLinksProps) => {
  const allLinks: QuickLinkItem[] =
    links && links.length > 0
      ? links
      : getNavigationSync().quickLinks.map((ql) => ({
          icon: ql.icon,
          title: ql.title,
          description: ql.description,
          href: ql.href,
        }));

  const resolvedLinks = allLinks.filter((link) => !isHrefHidden(link.href));

  return (
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-serif text-[32px] font-bold text-sage-dark">Town Services</h2>
          <p className="text-base text-[#4A4640]">Find what you need quickly</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resolvedLinks.map((link) => {
            const Icon = link.icon ? (iconMap[link.icon] ?? FileText) : FileText;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group flex cursor-pointer items-start gap-4 rounded-xl border border-[#DDD7CC] bg-warm-white p-6 transition-all hover:-translate-y-0.5 hover:border-sage-light hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-stone text-sage-dark transition-colors group-hover:bg-sage-dark group-hover:text-wheat">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-[#2D2A24]">{link.title}</h3>
                  <p className="text-[13px] text-[#4A4640]">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
