/**
 * Extracts a URL from a media field.
 * Handles string URLs and null/undefined values.
 */
export const getMediaUrl = (media: string | null | undefined): string | null => {
  if (!media) return null;
  if (typeof media === "string") return media;
  return null;
};
