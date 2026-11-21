import { LightboxImage } from "@/components/ui/lightbox-image";
import type { TownEventMedia } from "@/data/town/types";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

interface EventAlbumProps {
  title: string;
  items?: TownEventMedia[] | null;
}

/**
 * Photo and video album for an event. Builder returns a removed row as an
 * object with an empty `media`, so rows without a file are dropped instead of
 * rendering a broken tile. Renders nothing when the album is empty.
 */
export const EventAlbum = ({ title, items }: EventAlbumProps) => {
  const media = (Array.isArray(items) ? items : []).filter(
    (item): item is TownEventMedia & { media: string } =>
      typeof item?.media === "string" && item.media.trim() !== ""
  );
  if (media.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="mb-4 font-serif text-2xl font-bold text-sage-dark">Photos &amp; Videos</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item, i) => {
          const caption = item.caption?.trim();
          const alt = caption || `${title} photo ${i + 1}`;
          return (
            <li key={`${item.media}-${i}`} className="overflow-hidden rounded-lg bg-stone/20">
              <figure>
                {VIDEO_EXT.test(item.media) ? (
                  <video
                    src={item.media}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-square w-full bg-black object-cover"
                    aria-label={alt}
                  />
                ) : (
                  <LightboxImage
                    src={item.media}
                    alt={alt}
                    wrapperClassName="block w-full"
                    className="aspect-square h-auto w-full object-cover"
                    width={600}
                    height={600}
                  />
                )}
                {caption && (
                  <figcaption className="px-2 py-1.5 text-sm text-sage-dark/80">
                    {caption}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
