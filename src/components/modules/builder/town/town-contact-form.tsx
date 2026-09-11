"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { TownContactForm as ContactFormImpl } from "@/components/modules/town/town-contact-form";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import {
  type BuilderSettingsFlat,
  settings as staticSettings,
  toTownSettings,
} from "@/data/town/settings";
import { useBuilderEntry } from "@/lib/builder-data";
import { getMapUrl } from "@/lib/map-utils";

interface TownContactFormProps {
  recipientEmail?: string;
  bccEmail?: string;
}

export const TownContactForm = ({ recipientEmail, bccEmail }: TownContactFormProps = {}) => {
  const { data: builderFlat } = useBuilderEntry<BuilderSettingsFlat>(
    "town-settings",
    {},
    { fallback: undefined }
  );
  const settings = builderFlat ? toTownSettings(builderFlat) : staticSettings;

  const contactCards = [
    {
      icon: Phone,
      label: "Phone",
      value: settings.contactInfo.phone,
      href: `tel:${settings.contactInfo.phone.replace(/[^0-9+]/g, "")}`,
      copy: settings.contactInfo.phone ? (
        <PhoneCopyButton phone={settings.contactInfo.phone} label="Phone" />
      ) : null,
    },
    {
      icon: MapPin,
      label: "Address",
      value: settings.contactInfo.address,
      href: getMapUrl(settings.contactInfo.address),
      copy: settings.contactInfo.address ? (
        <AddressCopyButton address={settings.contactInfo.address} label="Address" />
      ) : null,
    },
    {
      icon: Mail,
      label: "Mailing Address",
      value: settings.contactInfo.mailingAddress,
      href: null,
      copy: null,
    },
    {
      icon: Clock,
      label: "Office Hours",
      value: `${settings.officeHours.weekday}\n${settings.officeHours.weekend}`,
      href: null,
      copy: null,
    },
  ];

  return (
    <section className="bg-warm-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              const inner = (
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-sage-dark">
                    <Icon className="h-5 w-5 text-wheat" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#4A4640]">
                      {card.label}
                    </p>
                    <p className="whitespace-pre-line text-[15px] font-medium text-[#2D2A24]">
                      {card.value}
                    </p>
                  </div>
                </div>
              );

              const link = card.href ? (
                <a
                  href={card.href}
                  target={card.label === "Address" ? "_blank" : undefined}
                  rel={card.label === "Address" ? "noopener noreferrer" : undefined}
                  className="block flex-1 cursor-pointer"
                >
                  {inner}
                </a>
              ) : (
                inner
              );

              return (
                <div
                  key={card.label}
                  className="flex items-start gap-4 rounded-xl border border-[#DDD7CC] bg-warm-white p-5 transition-shadow hover:shadow-md"
                >
                  {link}
                  {card.copy}
                </div>
              );
            })}
          </div>

          {/* Contact Form — uses the full-featured static form with
					    server action, validation, honeypot, and Turnstile.
					    recipient/bcc overrides let town staff re-route inquiries
					    from Builder without a code deploy (LAC-3347). */}
          <ContactFormImpl recipientEmail={recipientEmail} bccEmail={bccEmail} />
        </div>
      </div>
    </section>
  );
};
