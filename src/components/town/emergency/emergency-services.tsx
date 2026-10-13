import { Info, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmergencyServices } from "@/lib/town-data";
import { getMapUrl } from "@/lib/map-utils";
import { resolveIcon } from "@/lib/utils/icon-resolver";

const categoryColors: Record<string, string> = {
  immediate: "border-red-200 bg-red-50",
  utility: "border-amber-200 bg-amber-50",
  "public-safety": "border-sage/20 bg-sage/5",
  health: "border-green-200 bg-green-50",
};

const categoryTitles: Record<string, string> = {
  immediate: "Immediate Emergency Response",
  utility: "Utility Services",
  "public-safety": "Public Safety",
  health: "Health & Wellness",
};

export const EmergencyServices = async () => {
  const services = await getEmergencyServices();

  if (services.length === 0) {
    return (
      <Card className="border-stone bg-warm-white">
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Info className="h-12 w-12 text-sage-light" aria-hidden="true" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-sage-dark">No Emergency Services</h3>
              <p className="text-[#4A4640]">Emergency services information is not available.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group services by category
  const groupedServices = services.reduce(
    (acc, service) => {
      const category = service.category || "immediate";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    },
    {} as Record<string, typeof services>
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category}>
          <h2 className="mb-4 font-serif text-2xl font-bold text-sage-dark">
            {categoryTitles[category] || category}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {categoryServices.map((service) => {
              const Icon = resolveIcon(service.icon as string | null | undefined);
              const colorClass = categoryColors[category] || "border-stone bg-cream";

              // Parse preparedness tips from JSON field
              const preparedness: string[] = Array.isArray(service.preparedness)
                ? (service.preparedness as string[])
                : [];

              return (
                <Card
                  key={service.id}
                  className={`border-2 transition-shadow hover:shadow-lg ${colorClass}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-[#2D2A24]" aria-hidden="true" />
                      <CardTitle className="text-lg text-[#2D2A24]">{service.title}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-base text-[#4A4640]">{service.description}</p>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#2D2A24]">Emergency Phone:</span>
                      <a
                        href={`tel:${service.phone.replace(/[^\d+]/g, "")}`}
                        className={`font-bold text-barn-red hover:underline ${service.phone === "911" ? "text-2xl" : "text-lg"}`}
                      >
                        {service.phone}
                      </a>
                    </div>

                    {service.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#635E56]"
                          aria-hidden="true"
                        />
                        <a
                          href={getMapUrl(service.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4A4640] transition-colors hover:text-sage-dark hover:underline"
                        >
                          {service.address}
                        </a>
                      </div>
                    )}

                    {preparedness.length > 0 && (
                      <div className="border-t border-[#DDD7CC] pt-3">
                        <h3 className="mb-2 text-sm font-semibold text-[#2D2A24]">
                          Preparedness Tips:
                        </h3>
                        <ul className="space-y-1 text-sm text-[#4A4640]">
                          {preparedness.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <span className="mt-1 text-[#635E56]">&bull;</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <Card className="border-2 border-wheat/30 bg-wheat/10">
        <CardContent className="p-6">
          <h3 className="mb-3 font-serif text-lg font-bold text-sage-dark">
            Stay Connected During Emergencies
          </h3>
          <div className="space-y-2 text-base text-[#4A4640]">
            <p>
              <strong className="text-[#2D2A24]">Social Media:</strong> Follow Town of Harmony on
              Facebook for real-time updates
            </p>
            <p>
              <strong className="text-[#2D2A24]">Website:</strong> Visit townofharmony.org/emergency
              for current information
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
