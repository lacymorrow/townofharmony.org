"use client";

import { ChevronLeft, ChevronRight, Download, FileText, Loader2 } from "lucide-react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PdfPagerProps {
  url: string;
  title?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; doc: PDFDocumentProxy; pageCount: number }
  | { status: "error" };

/**
 * Page-at-a-time PDF renderer for browsers that can't display embedded PDFs
 * (iOS Safari shows only the first page in an <iframe>; most Android browsers
 * show nothing) — LAC-4043. One page per canvas on purpose: iOS has a hard
 * canvas memory budget, so rendering a 51-page document all at once crashes
 * the tab.
 */
export const PdfPager = ({ url, title }: PdfPagerProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    setState({ status: "loading" });
    setPageNumber(1);
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        loadingTask = pdfjs.getDocument({ url });
        const doc = await loadingTask.promise;
        if (cancelled) return;
        setState({ status: "ready", doc, pageCount: doc.numPages });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      void loadingTask?.destroy();
    };
  }, [url]);

  const renderPage = useCallback(async () => {
    if (state.status !== "ready") return;
    const canvas = canvasRef.current;
    const container = scrollRef.current;
    if (!canvas || !container) return;
    try {
      const page = await state.doc.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const containerWidth = container.clientWidth;
      if (containerWidth === 0) return;
      const cssScale = containerWidth / baseViewport.width;
      // Cap the backing-store scale — 3x retina pages blow the iOS canvas
      // memory budget; 2x is indistinguishable for scanned/typeset pages.
      const outputScale = Math.min(globalThis.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: cssScale * outputScale });
      renderTaskRef.current?.cancel();
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;
      const task = page.render({ canvas, viewport });
      renderTaskRef.current = task;
      await task.promise;
      container.scrollTop = 0;
    } catch {
      // RenderingCancelledException when paging quickly — safe to ignore.
    }
  }, [state, pageNumber]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  // Re-fit the page on rotation / window resize.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => void renderPage(), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, [renderPage]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sage" />
        <p className="text-sm text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 h-full">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">The document could not be displayed.</p>
        <Button asChild variant="outline" size="sm">
          <a href={url} download className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Instead
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-auto overscroll-contain">
        <canvas
          ref={canvasRef}
          className="block mx-auto"
          role="img"
          aria-label={`${title ?? "Document"} — page ${pageNumber} of ${state.pageCount}`}
        />
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-stone bg-white px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          Page {pageNumber} of {state.pageCount}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageNumber((p) => Math.min(state.pageCount, p + 1))}
          disabled={pageNumber >= state.pageCount}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
