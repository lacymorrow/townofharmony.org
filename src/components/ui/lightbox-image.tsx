"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type * as React from "react";

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
  if (disabled || !src) {
    return <img src={src} alt={alt} className={cn(className, wrapperClassName)} {...imgProps} />;
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
            src={src}
            alt={alt}
            className={cn("transition-transform duration-300 group-hover:scale-[1.03]", className)}
            {...imgProps}
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
