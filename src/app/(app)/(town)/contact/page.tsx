import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { TownContactForm } from "@/components/modules/town/town-contact-form";
import { settings } from "@/data/town/settings";

export const metadata: Metadata = {
  title: "Contact Us | Town of Harmony, NC",
  description:
    "Contact the Town of Harmony, NC. Find office hours, phone numbers, email, and directions to Town Hall in Harmony, North Carolina.",
  openGraph: {
    title: "Contact the Town of Harmony, NC",
    description:
      "Contact the Town of Harmony, NC. Find office hours, phone numbers, email, and directions to Town Hall in Harmony, North Carolina.",
  },
};

const contactCards = [
  {
    icon: Phone,
    label: "Phone",
    value: settings.contactInfo.phone,
    href: `tel:${settings.contactInfo.phone.replace(/[^0-9+]/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: settings.contactInfo.email,
    href: `mailto:${settings.contactInfo.email}`,
  },
  {
    icon: MapPin,
    label: "Address",
    value: settings.contactInfo.address,
    href: `https://maps.google.com/?q=${encodeURIComponent(settings.contactInfo.address)}`,
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: `${settings.officeHours.weekday}\n${settings.officeHours.weekend}`,
    href: null,
  },
];

export default function ContactPage() {
  return (
    <section className="py-16 bg-warm-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
            Contact Us
          </h1>
          <p className="text-[#635E56] text-base">
            Get in touch with the Town of Harmony
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <div className="flex items-start gap-4 bg-warm-white rounded-xl border border-[#DDD7CC] p-5 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 bg-sage-dark rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-wheat" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A4640] uppercase tracking-wider mb-1">
                      {card.label}
                    </p>
                    <p className="text-[15px] text-[#2D2A24] font-medium whitespace-pre-line">
                      {card.value}
                    </p>
                  </div>
                </div>
              );

              if (card.href) {
                return (
                  <a
                    key={card.label}
                    href={card.href}
                    target={card.label === "Address" ? "_blank" : undefined}
                    rel={card.label === "Address" ? "noopener noreferrer" : undefined}
                    className="block cursor-pointer"
                  >
                    {content}
                  </a>
                );
              }
              return <div key={card.label}>{content}</div>;
            })}
          </div>

          <TownContactForm />
        </div>
      </div>
    </section>
  );
}
