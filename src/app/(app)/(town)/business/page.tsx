import type { BuilderContent } from "@builder.io/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site-config";
import { env } from "@/env";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { isFeatureEnabled } from "@/lib/preview-flags";
import "@/styles/builder-io.css";

export const metadata: Metadata = {
  title: "Business Directory",
  description:
    "Find local businesses, restaurants, shops, and services in Harmony, NC. Support our local business community.",
  alternates: {
    canonical: `${siteConfig.url}/business`,
  },
};

async function getBuilderContent(): Promise<BuilderContent | null> {
  if (!env.NEXT_PUBLIC_FEATURE_BUILDER_ENABLED || !env.NEXT_PUBLIC_BUILDER_API_KEY) {
    return null;
  }
  try {
    const url = new URL("https://cdn.builder.io/api/v3/content/page");
    url.searchParams.set("apiKey", env.NEXT_PUBLIC_BUILDER_API_KEY);
    url.searchParams.set("userAttributes.urlPath", "/business");
    url.searchParams.set("limit", "1");
    url.searchParams.set("noCache", "true");
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: BuilderContent[] };
    return data?.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function BusinessPage() {
  if (!(await isFeatureEnabled("business"))) {
    notFound();
  }

  const content = await getBuilderContent();
  if (!content) {
    notFound();
  }

  return <RenderBuilderContent content={content} model="page" />;
}
