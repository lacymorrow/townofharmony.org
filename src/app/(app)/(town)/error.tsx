"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

interface TownErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level boundary for every town page. Renders inside the town layout,
 * so the header, footer, and styles stay put and the visitor can keep moving.
 * Without this file, errors fall through to global-error.tsx, which replaces
 * the whole document and ships with no stylesheet.
 */
export default function TownError({ error, reset }: TownErrorProps) {
  useEffect(() => {
    logger.error("[town] page failed to render", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-xl px-4 text-center">
        <h1 className="font-serif text-3xl font-bold text-sage-dark">This page hit a snag</h1>
        <p className="mt-3 text-[#635E56]">
          The rest of the site is working. Try again, or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-sage-deep px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-sage-dark"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-stone bg-white px-5 py-2.5 text-sm font-medium text-sage-dark transition-colors hover:bg-stone/40"
          >
            Go to homepage
          </Link>
        </div>
        <p className="mt-8 text-sm text-[#635E56]">
          Still stuck?{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-sage-dark">
            Let Town Hall know
          </Link>
          {error.digest ? (
            <span className="block mt-2 text-xs opacity-70">Reference {error.digest}</span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
