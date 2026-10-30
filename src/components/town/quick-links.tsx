import {
  AlertCircle,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Map,
  Phone,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DataLink } from "@/components/primitives/data-link";

import { getHiddenHrefs } from "@/lib/preview-flags";
import { getSettings } from "@/lib/town-data";
import { getBuilderNavigation } from "@/lib/town-navigation-server";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Calendar,
  AlertCircle,
  Users,
  Map,
  Briefcase,
  Home,
  Phone,
  Star,
  CreditCard,
};

export async function QuickLinks() {
  const [hiddenHrefs, navigation, settings] = await Promise.all([
    getHiddenHrefs(),
    getBuilderNavigation(),
    getSettings(),
  ]);
  const quickLinks = navigation.quickLinks.filter((link) => !hiddenHrefs.has(link.href));

  return (
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-serif text-[32px] font-bold text-sage-dark">
            {settings.homepage.quickLinksHeading}
          </h2>
          <p className="text-base text-[#4A4640]">{settings.homepage.quickLinksSubheading}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = iconMap[link.icon] ?? FileText;
            return (
              <DataLink
                key={link.title}
                href={link.href}
                className="group flex cursor-pointer items-start gap-4 rounded-xl border border-[#DDD7CC] bg-warm-white p-6 transition-all hover:-translate-y-0.5 hover:border-sage-light hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-stone text-sage-dark transition-colors group-hover:bg-sage-dark group-hover:text-wheat">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="mb-1 text-base font-semibold text-[#2D2A24]">{link.title}</p>
                  <p className="text-sm text-[#4A4640]">{link.description}</p>
                </div>
              </DataLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
