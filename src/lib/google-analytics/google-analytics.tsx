"use client";

import { useEffect } from "react";
import { useConsentManager } from "@c15t/nextjs";
import Script from "next/script";
import { env } from "@/env";

const GAScripts = ({ gaId }: { gaId: string }) => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
    </Script>
  </>
);

const ConsentGatedGA = ({ gaId }: { gaId: string }) => {
  const { hasConsentFor } = useConsentManager();
  const measurementConsent = hasConsentFor("measurement");

  useEffect(() => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] =
      !measurementConsent;
  }, [gaId, measurementConsent]);

  if (!measurementConsent) return null;
  return <GAScripts gaId={gaId} />;
};

export const GoogleAnalytics = () => {
  if (!env.NEXT_PUBLIC_FEATURE_GOOGLE_ANALYTICS_ENABLED) return null;

  const gaId = env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!gaId) return null;

  if (env.NEXT_PUBLIC_FEATURE_CONSENT_MANAGER_ENABLED) {
    return <ConsentGatedGA gaId={gaId} />;
  }

  return <GAScripts gaId={gaId} />;
};
