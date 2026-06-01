import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { HeroBlock } from "@/types/blocks";

interface HeroProps {
  block: HeroBlock;
  className?: string;
}

export const Hero = ({ block, className }: HeroProps) => {
  const { heading, subheading, image, ctaText, ctaLink, style = "default" } = block;

  return (
    <section
      className={cn(
        "relative overflow-hidden py-20",
        {
          "text-center": style === "centered",
          "grid grid-cols-2 items-center gap-12": style === "split",
        },
        className
      )}
    >
      {/* Background image for default and centered styles */}
      {image?.url && (style === "default" || style === "centered") && (
        <div className="absolute inset-0 -z-10">
          <Image src={image.url} alt={heading} fill className="object-cover opacity-20" priority />
        </div>
      )}

      <div
        className={cn("container mx-auto px-4", {
          "max-w-4xl": style === "centered",
        })}
      >
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">{heading}</h1>
          {subheading && <p className="text-xl text-muted-foreground">{subheading}</p>}
          {ctaText && ctaLink && (
            <div className="pt-4">
              <Button asChild size="lg">
                <Link href={ctaLink}>{ctaText}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Side image for split layout */}
      {image?.url && style === "split" && (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="group relative aspect-square w-full cursor-zoom-in overflow-hidden p-0 m-0 bg-transparent border-0"
            >
              <span className="sr-only">View {heading} full size</span>
              <Image
                src={image.url}
                alt={heading}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                priority
              />
            </button>
          </DialogTrigger>
          <DialogContent className="border-none bg-transparent p-0 shadow-none w-fit max-w-[95vw] sm:max-w-[90vw] [&>button]:bg-background/70 [&>button]:hover:bg-background [&>button]:rounded-full [&>button]:p-1">
            <VisuallyHidden>
              <DialogTitle>{heading}</DialogTitle>
              <DialogDescription>Full-size view of {heading}.</DialogDescription>
            </VisuallyHidden>
            <img
              src={image.url}
              alt={heading}
              className="block max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};
