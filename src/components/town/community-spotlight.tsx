import { DataLink } from "@/components/primitives/data-link";
import { getSettings } from "@/lib/town-data";

export async function CommunitySpotlight() {
  const { homepage } = await getSettings();

  return (
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#DDD7CC] bg-warm-white md:grid-cols-2">
          {/* Image area */}
          <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-sage-dark to-sage">
            <span className="font-serif text-[56px] italic text-wheat opacity-50">
              &ldquo;{homepage.spotlightImageLetter}&rdquo;
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center p-12">
            <div className="mb-4 w-fit rounded bg-sage/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sage-dark">
              {homepage.spotlightBadge}
            </div>
            <h2 className="mb-3 font-serif text-2xl font-bold text-sage-dark">
              {homepage.spotlightTitle}
            </h2>
            <p className="mb-5 text-base leading-relaxed text-[#4A4640]">
              {homepage.spotlightDescription}
            </p>
            <DataLink
              href={homepage.spotlightCtaHref}
              className="cursor-pointer text-base font-semibold text-sage transition-colors hover:text-sage-dark hover:underline"
            >
              {homepage.spotlightCtaText} &rarr;
            </DataLink>
          </div>
        </div>
      </div>
    </section>
  );
}
