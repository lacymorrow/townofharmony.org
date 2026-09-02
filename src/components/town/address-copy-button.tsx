"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import type { MouseEvent } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddressCopyButtonProps {
  address: string;
  label?: string;
  className?: string;
  iconClassName?: string;
  tone?: "default" | "onDark" | "onLight";
}

const toneStyles: Record<NonNullable<AddressCopyButtonProps["tone"]>, string> = {
  default: "text-[#4A4640] hover:text-sage-dark hover:bg-sage/10 focus-visible:ring-sage/60",
  onDark: "text-white hover:text-white hover:bg-white/15 focus-visible:ring-white/70",
  onLight: "text-red-800 hover:text-red-900 hover:bg-red-100 focus-visible:ring-red-400/60",
};

export const AddressCopyButton = ({
  address,
  label,
  className,
  iconClassName,
  tone = "default",
}: AddressCopyButtonProps) => {
  const { toast } = useToast();
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000,
    onCopy: () => {
      toast({
        title: "Address copied",
        description: label ? `${label}: ${address}` : address,
      });
    },
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    copyToClipboard(address);
  };

  const ariaLabel = label ? `Copy address for ${label}` : `Copy address ${address}`;

  // Own provider so the button works in any mount context (tests, Builder
  // islands) without relying on an app-level TooltipProvider.
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            aria-label={ariaLabel}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              toneStyles[tone],
              className
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isCopied ? "check" : "copy"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                {isCopied ? (
                  <Check className={cn("h-4 w-4", iconClassName)} />
                ) : (
                  <Copy className={cn("h-4 w-4", iconClassName)} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{isCopied ? "Copied!" : "Copy address"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
