"use client";

import {
  AlertCircle,
  AlertTriangle,
  Flame,
  Heart,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  Stethoscope,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { useBuilderData } from "@/lib/builder-data";
import { emergencyServices } from "@/data/town/emergency-services";
import type { TownEmergencyService } from "@/data/town/types";
import { getMapUrl } from "@/lib/map-utils";

const iconMap: Record<string, LucideIcon> = {
  Phone,
  Flame,
  Shield,
  Zap,
  Wrench,
  AlertTriangle,
  AlertCircle,
  Stethoscope,
  ShieldAlert,
  Heart,
};

interface TownEmergencyServicesProps {
  title?: string;
  subtitle?: string;
}

export const TownEmergencyServices = ({
  title = "Emergency Services",
  subtitle = "Emergency alerts, contacts, and preparedness",
}: TownEmergencyServicesProps) => {
  const { data: services, loading } = useBuilderData<TownEmergencyService>(
    "town-emergency-service",
    { sort: { priority: -1 }, limit: 50, fallback: emergencyServices }
  );

  // Immediate/critical numbers (911) render inside the page header; the rest
  // render as category-grouped cards below.
  const immediate = services.filter((s) => s.category === "immediate");
  const other = services.filter((s) => s.category !== "immediate");

  // Group non-immediate by category
  const grouped: Record<string, typeof services> = {};
  for (const service of other) {
    const bucket = grouped[service.category] ?? [];
    bucket.push(service);
    grouped[service.category] = bucket;
  }

  const categoryOrder = ["public-safety", "utility", "health"];
  const categoryLabels: Record<string, string> = {
    "public-safety": "Public Safety",
    utility: "Utilities",
    health: "Health Services",
  };

  return (
    <>
      {/* Page header with critical numbers built in — big, unmissable */}
      <section className="bg-barn-red py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">{title}</h1>
              {subtitle && <p className="max-w-2xl text-lg text-white/90">{subtitle}</p>}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse rounded-2xl bg-white/10 p-6">
                  <div className="mb-3 h-14 w-40 rounded bg-white/20" />
                  <div className="h-5 w-64 rounded bg-white/10" />
                </div>
              ) : (
                immediate.map((service) => {
                  const Icon = iconMap[service.icon] ?? Phone;
                  // Don't repeat the page title inside the call block
                  const showLabel = service.title !== title;

                  return (
                    <div
                      key={service.title}
                      className="relative rounded-2xl bg-white/10 p-6 transition-colors hover:bg-white/15"
                    >
                      <div className="absolute right-4 top-4 z-10">
                        <PhoneCopyButton
                          phone={service.phone}
                          label={service.title}
                          tone="onDark"
                        />
                      </div>
                      <a
                        href={`tel:${service.phone.replace(/[^\d+]/g, "")}`}
                        className="block whitespace-normal"
                      >
                        <div className="flex items-center gap-4 pr-10">
                          <Icon className="h-9 w-9 shrink-0 text-white/90" aria-hidden="true" />
                          <span className="font-mono text-5xl font-bold tracking-wide md:text-6xl">
                            {service.phone}
                          </span>
                        </div>
                        {showLabel && (
                          <div className="mt-2 text-lg font-semibold text-white/90">
                            {service.title}
                          </div>
                        )}
                        <p className="mt-3 text-base leading-relaxed text-white/85">
                          {service.description}
                        </p>
                      </a>
                      {service.address && (
                        <a
                          href={getMapUrl(service.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-start gap-2 text-sm text-white/90 transition-colors hover:underline"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{service.address}</span>
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-warm-white py-12">
        <div className="container mx-auto px-4">
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-stone/30 p-8">
                  <div className="mb-3 h-10 w-32 rounded bg-stone/40" />
                  <div className="h-5 w-64 rounded bg-stone/20" />
                </div>
              ))}
            </div>
          )}

          {/* Other services — clear and scannable */}
          {!loading &&
            categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;

              return (
                <div key={cat} className="mb-8 last:mb-0">
                  <h2 className="mb-4 border-b-2 border-sage/20 pb-2 text-xl font-bold text-[#2D2A24]">
                    {categoryLabels[cat] ?? cat}
                  </h2>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {items.map((service) => {
                      const Icon = iconMap[service.icon] ?? Phone;

                      return (
                        <div
                          key={service.title}
                          className="rounded-xl border border-[#DDD7CC] bg-cream p-6"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-sage-dark/10">
                              <Icon className="h-5 w-5 text-sage-dark" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="mb-1 text-lg font-semibold text-[#2D2A24]">
                                {service.title}
                              </h3>

                              <div className="mb-2 flex flex-wrap items-center gap-1">
                                <a
                                  href={`tel:${service.phone.replace(/[^\d+]/g, "")}`}
                                  className="inline-flex items-center gap-2 font-mono text-2xl font-bold text-sage-deep transition-colors hover:text-sage-dark"
                                >
                                  <Phone className="h-5 w-5" />
                                  {service.phone}
                                </a>
                                <PhoneCopyButton phone={service.phone} label={service.title} />
                              </div>

                              <p className="text-base leading-relaxed text-[#4A4640]">
                                {service.description}
                              </p>

                              {service.address && (
                                <a
                                  href={getMapUrl(service.address)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-start gap-2 text-sm text-[#4A4640] transition-colors hover:text-sage-dark hover:underline"
                                >
                                  <MapPin
                                    className="mt-0.5 h-4 w-4 shrink-0 text-[#635E56]"
                                    aria-hidden="true"
                                  />
                                  <span>{service.address}</span>
                                </a>
                              )}

                              {service.preparedness.length > 0 && (
                                <details className="mt-4 border-t border-[#DDD7CC] pt-3">
                                  <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-[#4A4640] transition-colors hover:text-sage-dark">
                                    Preparedness Tips
                                  </summary>
                                  <ul className="mt-2 space-y-1">
                                    {service.preparedness.map((tip) => (
                                      <li
                                        key={tip}
                                        className="flex items-start gap-2 text-sm text-[#4A4640]"
                                      >
                                        <span className="mt-1 flex-shrink-0 text-sage">&bull;</span>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </>
  );
};
