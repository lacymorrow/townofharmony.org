// This must be a server component

import { Calendar, FileText, Home, MapPin, Phone, Users } from "lucide-react";
import Link from "next/link";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { renderCopyright, settings as staticSettings } from "@/data/town/settings";
import type { TownSettings } from "@/data/town/types";

const helpfulLinks = [
  {
    title: "Upcoming Events",
    description: "View community events and activities",
    href: "/events",
    Icon: Calendar,
  },
  {
    title: "Town Meetings",
    description: "Agendas, minutes, and schedules",
    href: "/meetings",
    Icon: Users,
  },
  {
    title: "Resident Resources",
    description: "Documents and information for residents",
    href: "/resources",
    Icon: FileText,
  },
  {
    title: "Contact Us",
    description: "Reach the town office directly",
    href: "/contact",
    Icon: Phone,
  },
];

interface NotFoundPageProps {
  settings?: TownSettings;
}

export const NotFoundPage = ({ settings = staticSettings }: NotFoundPageProps = {}) => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Simplified header */}
      <header className="border-b border-[#DDD7CC] bg-warm-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex w-fit items-center gap-4">
            <div
              className="flex h-14 w-12 flex-shrink-0 items-center justify-center bg-sage-dark font-serif text-base font-bold text-[#E8D5A3]"
              style={{
                clipPath: "polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)",
              }}
            >
              TH
            </div>
            <div>
              <span className="block font-serif text-xl font-bold text-sage-dark">
                {settings.siteTitle}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[1.5px] text-[#635E56]">
                {settings.branding.county}, {settings.branding.state}
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-sage-dark py-16 text-white">
        <div className="container mx-auto px-4">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
            {settings.notFound.eyebrow}
          </span>
          <h1 className="mb-4 font-serif text-3xl font-bold md:text-4xl">
            {settings.notFound.heading}
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-white/80">{settings.notFound.body}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-wheat px-6 py-3 font-semibold text-sage-deep transition-colors hover:bg-wheat-light"
          >
            <Home className="h-4 w-4" />
            {settings.notFound.ctaLabel}
          </Link>
        </div>
      </section>

      {/* Helpful links */}
      <section className="flex-grow bg-cream py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 font-serif text-2xl font-bold text-sage-dark">Common Services</h2>
          <p className="mb-8 text-[#4A4640]">
            Find what you need using one of these frequently visited pages.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {helpfulLinks.map(({ title, description, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-xl border border-[#DDD7CC] bg-warm-white p-6 transition-all hover:-translate-y-0.5 hover:border-sage-light hover:shadow-md"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-stone text-sage-dark transition-colors group-hover:bg-sage-dark group-hover:text-wheat">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="mb-1 text-base font-semibold text-[#2D2A24]">{title}</p>
                  <p className="text-[13px] text-[#4A4640]">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="border-t border-[#DDD7CC] bg-warm-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 font-serif text-xl font-bold text-sage-dark">Still need help?</h2>
          <div className="flex max-w-3xl flex-col gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${settings.contactInfo.phone.replace(/[^\d+]/g, "")}`}
                className="group flex items-center gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sage-dark">
                  <Phone className="h-5 w-5 text-wheat" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D2A24]">Call us</p>
                  <p className="text-sm text-sage transition-colors group-hover:text-sage-dark">
                    {settings.contactInfo.phone}
                  </p>
                </div>
              </a>
              <PhoneCopyButton phone={settings.contactInfo.phone} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sage-dark">
                <MapPin className="h-5 w-5 text-wheat" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D2A24]">Office hours</p>
                <p className="text-sm text-[#4A4640]">{settings.officeHours.weekday}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="bg-[#1E2118] py-6 text-white/60">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row">
          <span>{renderCopyright(settings.footer.copyright, settings.siteTitle)}</span>
          <Link href="/" className="text-wheat transition-colors hover:text-wheat-light">
            Return to homepage
          </Link>
        </div>
      </footer>
    </div>
  );
};
