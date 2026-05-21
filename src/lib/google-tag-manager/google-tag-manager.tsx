"use client";

import { useEffect } from "react";
import { useConsentManager } from "@c15t/nextjs";
import Script from "next/script";
import { env } from "@/env";

const GTMScript = ({ gtmId }: { gtmId: string }) => (
  <Script id="google-tag-manager" strategy="afterInteractive">
    {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
  </Script>
);

const ConsentGatedGTM = ({ gtmId }: { gtmId: string }) => {
  const { hasConsentFor } = useConsentManager();
  const measurementConsent = hasConsentFor("measurement");

  useEffect(() => {
    const dl = (window as Record<string, unknown>).dataLayer;
    if (Array.isArray(dl)) {
      dl.push({
        event: "consent_update",
        analytics_storage: measurementConsent ? "granted" : "denied",
      });
    }
  }, [measurementConsent]);

  if (!measurementConsent) return null;
  return <GTMScript gtmId={gtmId} />;
};

export const GoogleTagManager = () => {
  if (!env.NEXT_PUBLIC_FEATURE_GOOGLE_TAG_MANAGER_ENABLED || !env.NEXT_PUBLIC_GOOGLE_GTM_ID) {
    return null;
  }

  const gtmId = env.NEXT_PUBLIC_GOOGLE_GTM_ID;

  if (env.NEXT_PUBLIC_FEATURE_CONSENT_MANAGER_ENABLED) {
    return <ConsentGatedGTM gtmId={gtmId} />;
  }

  return <GTMScript gtmId={gtmId} />;
};
