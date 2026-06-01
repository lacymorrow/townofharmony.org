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
import { cn } from "@/lib/utils/index";

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
		return (
			<img
				src={src}
				alt={alt}
				className={cn(className, wrapperClassName)}
				{...imgProps}
			/>
		);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label={`View ${alt || "image"} full size`}
					className={cn(
						"group block cursor-zoom-in overflow-hidden p-0 m-0 bg-transparent border-0",
						wrapperClassName,
					)}
				>
					<img
						src={src}
						alt={alt}
						className={cn(
							"transition-transform duration-300 group-hover:scale-[1.03]",
							className,
						)}
						{...imgProps}
					/>
				</button>
			</DialogTrigger>
			<DialogContent
				className="border-none bg-transparent p-0 shadow-none w-fit max-w-[95vw] sm:max-w-[90vw] [&>button]:bg-background/70 [&>button]:hover:bg-background [&>button]:rounded-full [&>button]:p-1"
			>
				<VisuallyHidden>
					<DialogTitle>{alt || "Image"}</DialogTitle>
					<DialogDescription>Full-size view of {alt || "image"}.</DialogDescription>
				</VisuallyHidden>
				<img
					src={fullSrc || src}
					alt={alt}
					className="block max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg object-contain"
				/>
			</DialogContent>
		</Dialog>
	);
}
