"use client";

import { DataLink } from "@/components/primitives/data-link";
import { LightboxImage } from "@/components/ui/lightbox-image";

interface TownCommunitySpotlightProps {
  badge?: string;
  title?: string;
  description?: string;
  linkHref?: string;
  image?: string;
}

export const TownCommunitySpotlight = ({
  badge = "Community Spotlight",
  title = "Harmony Heritage Trail",
  description = "Walk through history along our newly restored Heritage Trail, connecting nine landmarks that tell the story of Harmony from its founding in 1927 to today.",
  linkHref = "/history",
  image,
}: TownCommunitySpotlightProps) => {
  return (
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#DDD7CC] bg-warm-white md:grid-cols-2">
          {/* Image area */}
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-gradient-to-br from-sage-dark to-sage">
            {image ? (
              <LightboxImage
                src={image}
                alt={title}
                wrapperClassName="absolute inset-0 w-full h-full"
                className="h-full w-full object-cover"
                width={800}
                height={600}
              />
            ) : (
              <span className="font-serif text-[56px] italic text-wheat opacity-50">
                &ldquo;H&rdquo;
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center p-12">
            <div className="mb-4 w-fit rounded bg-sage/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sage-dark">
              {badge}
            </div>
            <h2 className="mb-3 font-serif text-2xl font-bold text-sage-dark">{title}</h2>
            <p className="mb-5 text-base leading-relaxed text-[#4A4640]">{description}</p>
            <DataLink
              href={linkHref}
              className="cursor-pointer text-[15px] font-semibold text-sage transition-colors hover:text-sage-dark hover:underline"
            >
              Learn More &rarr;
            </DataLink>
          </div>
        </div>
      </div>
    </section>
  );
};
