import {
  CheckCircle,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
} from "lucide-react";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PayloadRichText } from "@/components/town/payload-rich-text";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import type { TownBusiness } from "@/data/town/types";
import { getMapUrl } from "@/lib/map-utils";
import { htmlToPlainText } from "@/lib/html-to-text";
import { getMediaUrl } from "@/lib/utils/get-media-url";

interface BusinessDetailProps {
  business: TownBusiness;
}

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  retail: "Retail",
  service: "Professional Service",
  healthcare: "Healthcare",
  education: "Education",
  finance: "Finance",
  realestate: "Real Estate",
  other: "Other",
};

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabels: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function BusinessDetail({ business }: BusinessDetailProps) {
  const logoUrl = getMediaUrl(business.logo);

  return (
    <article>
      <header className="mb-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold">{business.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {categoryLabels[business.category] || business.category}
              </Badge>
              {business.isVerified && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified Business
                </Badge>
              )}
              {business.isFeatured && (
                <Badge variant="default" className="flex items-center gap-1 bg-yellow-500">
                  <Star className="h-3 w-3" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
          {logoUrl && (
            <LightboxImage
              src={logoUrl}
              alt={`${business.name} logo`}
              wrapperClassName="w-24 h-24 rounded-lg border"
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {business.description && (
          <PayloadRichText
            content={business.description}
            className="prose prose-lg max-w-none text-lg text-muted-foreground"
          />
        )}
      </header>

      {business.images && business.images.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {business.images.map((item, index) => {
            const imageUrl = getMediaUrl(item.image);
            if (!imageUrl) return null;
            return (
              <LightboxImage
                key={item.id ?? index}
                src={imageUrl}
                alt={`${business.name} image ${index + 1}`}
                wrapperClassName="w-full h-48 rounded-lg"
                className="h-full w-full object-cover"
              />
            );
          })}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {business.hours && (
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {typeof business.hours === "string" ? (
                    <p>{htmlToPlainText(business.hours)}</p>
                  ) : (
                    dayOrder.map((day) => {
                      const hoursObj = business.hours as unknown as Record<string, unknown>;
                      const hours = hoursObj[day];
                      if (!hours) return null;

                      const today = new Date()
                        .toLocaleDateString("en-US", { weekday: "long" })
                        .toLowerCase();
                      const isToday = day === today;

                      return (
                        <div
                          key={day}
                          className={`flex justify-between py-2 ${isToday ? "font-semibold text-sage" : ""}`}
                        >
                          <span>{dayLabels[day]}</span>
                          <span>{hours === "Closed" ? "Closed" : String(hours)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {business.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <a
                      href={getMapUrl(business.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-sage"
                    >
                      {business.address}
                    </a>
                  </div>
                  <AddressCopyButton
                    address={business.address}
                    label={business.name}
                    tone="default"
                  />
                </div>
              )}

              {business.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${business.phone}`} className="transition-colors hover:text-sage">
                    {business.phone}
                  </a>
                  <PhoneCopyButton phone={business.phone} label={business.name} tone="default" />
                </div>
              )}

              {business.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`mailto:${business.email}`}
                    className="transition-colors hover:text-sage"
                  >
                    {business.email}
                  </a>
                </div>
              )}

              {business.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-sage"
                  >
                    Visit website
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share Business
          </Button>
        </div>
      </div>
    </article>
  );
}
