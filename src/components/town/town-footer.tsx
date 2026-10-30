import { Facebook, Twitter, Youtube } from "lucide-react";
import { DataLink } from "@/components/primitives/data-link";

import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { navigation as defaultNavData } from "@/data/town/navigation";
import { renderCopyright } from "@/data/town/settings";
import type { TownNavigation, TownSettings } from "@/data/town/types";
import { BUILD_TIME_HIDDEN_HREFS, normalizeHref } from "@/lib/hidden-hrefs";
import { getMapUrl } from "@/lib/map-utils";

interface TownFooterProps {
  settings: TownSettings;
  /** Override hidden hrefs from a server component (supports preview cookie). Falls back to build-time env. */
  hiddenHrefs?: Set<string>;
  /** Navigation tree (defaults to static data). Server wrapper passes the Builder-merged version. */
  navData?: TownNavigation;
}

export function TownFooter({
  settings,
  hiddenHrefs = BUILD_TIME_HIDDEN_HREFS,
  navData = defaultNavData,
}: TownFooterProps) {
  const footerLinks = Object.fromEntries(
    navData.footerLinks.map((section) => [
      section.category,
      section.links.filter((link) => !hiddenHrefs.has(normalizeHref(link.href))),
    ])
  );
  return (
    <footer className="bg-[#1E2118] text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Town Info */}
          <div>
            <p className="mb-2 font-serif text-xl font-bold text-white">{settings.siteTitle}</p>
            <p className="mb-2 text-sm leading-relaxed">
              {settings.branding.tagline} Serving our community since{" "}
              {settings.branding.established}.
            </p>
            <p className="text-sm leading-relaxed">
              <a
                href={getMapUrl(settings.contactInfo.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-wheat"
              >
                {settings.contactInfo.address}
              </a>
              <AddressCopyButton
                address={settings.contactInfo.address}
                label={settings.siteTitle}
                tone="onDark"
              />
              <br />
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <a
                  href={`tel:${settings.contactInfo.phone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors hover:text-wheat"
                >
                  {settings.contactInfo.phone}
                </a>
                <PhoneCopyButton
                  phone={settings.contactInfo.phone}
                  label={settings.siteTitle}
                  tone="onDark"
                />
              </span>
            </p>
            {(settings.officeHours.weekday || settings.officeHours.weekend) && (
              <p className="mt-2 text-sm leading-relaxed">
                {settings.officeHours.weekday && <span>{settings.officeHours.weekday}</span>}
                {settings.officeHours.weekday && settings.officeHours.weekend && <br />}
                {settings.officeHours.weekend && <span>{settings.officeHours.weekend}</span>}
              </p>
            )}

            {/* Social Media */}
            {(settings.socialMedia.facebook ||
              settings.socialMedia.twitter ||
              settings.socialMedia.youtube) && (
              <div className="mt-4 flex gap-3">
                {settings.socialMedia.facebook && (
                  <a
                    href={settings.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-sage"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {settings.socialMedia.twitter && (
                  <a
                    href={settings.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-sage"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {settings.socialMedia.youtube && (
                  <a
                    href={settings.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-sage"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="mb-4 text-[13px] font-bold uppercase tracking-[1.5px] text-white/85">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <DataLink
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-wheat"
                    >
                      {link.name}
                    </DataLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] md:flex-row">
            <span>{renderCopyright(settings.footer.copyright, settings.siteTitle)}</span>
            <div className="flex gap-5">
              {settings.footer.legalLinks.map((link) => (
                <DataLink
                  key={link.href}
                  href={link.href}
                  className="text-white/80 transition-colors hover:text-wheat"
                >
                  {link.name}
                </DataLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
