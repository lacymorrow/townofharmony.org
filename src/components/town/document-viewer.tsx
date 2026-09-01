"use client";

import DOMPurify from "dompurify";
import { Download, FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type DocumentKind,
  detectKindFromBytes,
  detectKindFromContentType,
  detectKindFromUrl,
} from "@/lib/document-type";

interface DocumentViewerProps {
  url: string;
  title?: string;
}

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "pdf"; src: string }
  | { status: "docx"; html: string }
  | { status: "unsupported" };

export const DocumentViewer = ({ url, title }: DocumentViewerProps) => {
  const [state, setState] = useState<ViewState>({ status: "loading" });
  const blobUrlRef = useRef<string | null>(null);

  const load = useCallback(
    async (signal: AbortSignal) => {
      setState({ status: "loading" });

      const extKind = detectKindFromUrl(url);
      if (extKind === "pdf") {
        setState({ status: "pdf", src: url });
        return;
      }

      try {
        // Builder.io asset URLs carry no file extension in their path — the
        // original filename only exists in the Content-Disposition header — so
        // identify the file by content type or magic bytes (LAC-3623).
        const mammothPromise = extKind === "docx" ? import("mammoth") : null;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error("Failed to fetch document");
        const arrayBuffer = await response.arrayBuffer();
        if (signal.aborted) return;

        let resolved: DocumentKind = extKind;
        if (resolved === "unknown") {
          resolved = detectKindFromContentType(response.headers.get("content-type"));
        }
        if (resolved === "unknown") {
          resolved = detectKindFromBytes(arrayBuffer);
        }

        if (resolved === "docx") {
          try {
            const mammoth = await (mammothPromise ?? import("mammoth"));
            const result = await mammoth.convertToHtml({ arrayBuffer });
            if (signal.aborted) return;
            setState({ status: "docx", html: DOMPurify.sanitize(result.value) });
          } catch {
            // The zip signature covers all OOXML formats, so a sniffed "docx"
            // may not convert (e.g. xlsx) — offer the download instead.
            if (!signal.aborted) setState({ status: "unsupported" });
          }
          return;
        }

        if (resolved === "pdf") {
          // The bytes are already here; a blob URL avoids re-downloading.
          const blobUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: "application/pdf" }));
          blobUrlRef.current = blobUrl;
          setState({ status: "pdf", src: blobUrl });
          return;
        }

        setState({ status: "unsupported" });
      } catch (e) {
        if (signal.aborted) return;
        if (extKind === "unknown") {
          // We were only probing (e.g. a CORS-less external host) — fall back
          // to the download offer rather than surfacing a fetch error.
          setState({ status: "unsupported" });
          return;
        }
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Failed to load document",
        });
      }
    },
    [url]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => {
      controller.abort();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-sage" />
        <p className="text-sm text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline" size="sm">
          <a href={url} download className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Instead
          </a>
        </Button>
      </div>
    );
  }

  if (state.status === "pdf") {
    return (
      <iframe
        src={state.src}
        title={title ?? "Document"}
        className="w-full h-full border-0 rounded"
      />
    );
  }

  if (state.status === "docx") {
    return (
      <div
        className="prose prose-sm max-w-none p-6 bg-white rounded overflow-auto h-full"
        dangerouslySetInnerHTML={{ __html: state.html }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">This file type cannot be previewed.</p>
      <Button asChild variant="outline" size="sm">
        <a href={url} download className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download File
        </a>
      </Button>
    </div>
  );
};
