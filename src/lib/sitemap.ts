import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";

interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export async function generateSitemapEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  const staticRoutes = [routes.home, routes.contact].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const legalRoutes = [routes.terms, routes.privacy].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  entries.push(...staticRoutes, ...legalRoutes);

  return entries;
}

export async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await generateSitemapEntries();
  return entries;
}
