"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ImageOff } from "lucide-react";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

interface LightboxImageProps extends ImgProps {
  src: string;
  alt: string;
  /** Optional override for the full-size image URL shown in the lightbox. Defaults to `src`. */
  fullSrc?: string;
  /** Classes applied to the inner <img> (matches what the old <img> had). */
  className?: string;
  /** Classes applied to the clickable wrapper element. */
  wrapperClassName?: string;
  /** Skip the lightbox and render a plain <img> (useful for tiny avatars/decorative). */
  disabled?: boolean;
}

export function LightboxImage({
  src,
  alt,
  fullSrc,
  className,
  wrapperClassName,
  disabled,
  ...imgProps
}: LightboxImageProps) {
  // Keyed to the src string rather than a boolean + reset effect: effects run
  // after ref callbacks, so a reset effect would clear the flag the ref
  // callback just set. A new src simply no longer matches and gets a fresh try.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const failed = !!src && failedSrc === src;

  // These components are server-rendered, so a dead URL usually fails before
  // React hydrates and `onError` attaches too late to fire (LAC-6283). Re-check
  // the decoded size when the element attaches.
  const imageRef = React.useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth === 0) setFailedSrc(src);
    },
    [src]
  );

  const { onError, ...restImgProps } = imgProps;
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setFailedSrc(src);
    onError?.(event);
  };

  if (failed) {
    // Neutral placeholder sized by the same classes as the image, no lightbox.
    return (
      <div
        role="img"
        aria-label={alt || "Image unavailable"}
        className={cn(
          "flex items-center justify-center overflow-hidden bg-muted text-muted-foreground",
          disabled && className,
          wrapperClassName
        )}
      >
        <ImageOff aria-hidden="true" className="h-1/3 max-h-12 w-1/3 max-w-12 opacity-60" />
      </div>
    );
  }

  if (disabled || !src) {
    return (
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={cn(className, wrapperClassName)}
        {...restImgProps}
        onError={handleError}
      />
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group m-0 block cursor-zoom-in overflow-hidden border-0 bg-transparent p-0",
            wrapperClassName
          )}
        >
          <span className="sr-only">View {alt || "image"} full size</span>
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={cn("transition-transform duration-300 group-hover:scale-[1.03]", className)}
            {...restImgProps}
            onError={handleError}
          />
        </button>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] [&>button]:rounded-full [&>button]:bg-background/70 [&>button]:p-1 [&>button]:hover:bg-background">
        <VisuallyHidden>
          <DialogTitle>{alt || "Image"}</DialogTitle>
          <DialogDescription>Full-size view of {alt || "image"}.</DialogDescription>
        </VisuallyHidden>
        <img
          src={fullSrc || src}
          alt={alt}
          className="block h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
