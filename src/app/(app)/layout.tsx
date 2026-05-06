import type { Metadata, Viewport } from "next";
import type React from "react";
import { Suspense } from "react";

import { AppRouterLayout } from "@/components/layouts/app-router-layout";
import { FontSelector } from "@/components/modules/devtools/font-selector";
import { ReactGrab } from "@/components/modules/devtools/react-grab";
import { SuspenseFallback } from "@/components/primitives/suspense-fallback";
import { fontSans, fontSerif } from "@/config/fonts";
import { siteConfig } from "@/config/site-config";
import { settings } from "@/data/town/settings";
import {
  metadata as defaultMetadata,
  type HeadLinkHint,
  headLinkHints,
  viewport as sharedViewport,
} from "@/config/metadata";
import { env } from "@/env";
import { initializePaymentProviders } from "@/server/providers";
import Script from "next/script";

export const fetchCache = "default-cache";
export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = sharedViewport;

await initializePaymentProviders();

// Synchronous layout — do NOT make this async. An async layout causes React to
// start streaming and commit HTTP 200 before child pages can call notFound(),
// which prevents proper HTTP 404 status on unknown routes (soft-404 problem).
export default function Layout({
  children,
  ...slots
}: {
  children: React.ReactNode;
  [key: string]: React.ReactNode;
}) {
  // In RSC, parallel route slots are synchronous ReactNodes — no await needed.
  const resolvedSlots = Object.entries(slots).filter(
    ([, slot]) =>
      slot != null &&
      !(typeof slot === "object" && Object.keys(slot as object).length === 0)
  ) as [string, React.ReactNode][];

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GovernmentOrganization",
              name: settings.siteTitle,
              description: settings.siteDescription,
              url: siteConfig.url,
              telephone: settings.contactInfo.phone,
              email: settings.contactInfo.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: settings.contactInfo.streetAddress,
                addressLocality: settings.contactInfo.city,
                addressRegion: settings.contactInfo.stateCode,
                postalCode: settings.contactInfo.zipCode,
                addressCountry: "US",
              },
              areaServed: {
                "@type": "City",
                name: settings.contactInfo.city,
                containedInPlace: {
                  "@type": "AdministrativeArea",
                  name: `${settings.branding.county}, ${settings.branding.state}`,
                },
              },
              foundingDate: settings.branding.established,
              logo: `${siteConfig.url}/logo.png`,
              sameAs: [settings.socialMedia.facebook, settings.socialMedia.twitter, settings.socialMedia.youtube].filter(Boolean),
            }),
          }}
        />
        {headLinkHints.map((l: HeadLinkHint) => (
          <link key={`${l.rel}-${l.href}`} rel={l.rel} href={l.href} crossOrigin={l.crossOrigin} />
        ))}

        {env.NEXT_PUBLIC_FEATURE_DEVTOOLS_ENABLED && (
          <script
            async
            defer
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        )}
      </head>
      {/* Ensure portaled UI (e.g. Radix primitives) inherits the sans-serif family */}
      <body
        className={`${fontSans.variable} ${fontSerif.variable} min-h-screen font-sans antialiased`}
      >
        <AppRouterLayout>
          {children}

          {/* Dynamically render all available slots */}
          {resolvedSlots.map(([key, slot]) => (
            <Suspense key={`slot-${key}`} fallback={<SuspenseFallback />}>
              {slot}
            </Suspense>
          ))}

          {/* TODO: Uncomment this when we have this working */}
          {/* Lacy Morrow vanity plate */}
          {/*<BrickMarquee />*/}
        </AppRouterLayout>

        {/* Add devtools only in development */}
        {process.env.NODE_ENV === "development" &&
          env.NEXT_PUBLIC_FEATURE_DEVTOOLS_FONT_SELECTOR_ENABLED && (
            <>
              {/* React Grab — select elements and edit with AI agents */}
              <Suspense fallback={null}>
                <ReactGrab />
              </Suspense>

              <Suspense fallback={null}>
                <FontSelector />
              </Suspense>
            </>
          )}
      </body>
    </html>
  );
}
