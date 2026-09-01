"use client";

import DOMPurify from "dompurify";
import { Download, FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type DocumentKind,
  detectKindFromBytes,
  detectKindFromContentType,
  getExtensionFromUrl,
} from "@/lib/document-type";

interface DocumentViewerProps {
  url: string;
  title?: string;
}

const kindFromExtension = (url: string): DocumentKind => {
  const ext = getExtensionFromUrl(
    url,
    typeof window !== "undefined" ? window.location.origin : undefined
  );
  if (ext === "pdf" || ext === "docx") return ext;
  return "unknown";
};

export const DocumentViewer = ({ url, title }: DocumentViewerProps) => {
  const [kind, setKind] = useState<DocumentKind>("unknown");
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDocHtml(null);

    const extKind = kindFromExtension(url);
    if (extKind === "pdf") {
      setKind("pdf");
      setLoading(false);
      return;
    }

    try {
      // Builder.io asset URLs carry no file extension in their path — the
      // original filename only exists in the Content-Disposition header — so
      // identify the file by content type or magic bytes (LAC-3623).
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch document");
      const arrayBuffer = await response.arrayBuffer();
      let resolved: DocumentKind = extKind;
      if (resolved === "unknown") {
        resolved = detectKindFromContentType(response.headers.get("content-type"));
      }
      if (resolved === "unknown") {
        resolved = detectKindFromBytes(arrayBuffer);
      }
      if (resolved === "docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocHtml(DOMPurify.sanitize(result.value));
      }
      setKind(resolved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-sage" />
        <p className="text-sm text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <a href={url} download className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Instead
          </a>
        </Button>
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <iframe src={url} title={title ?? "Document"} className="w-full h-full border-0 rounded" />
    );
  }

  if (kind === "docx" && docHtml !== null) {
    return (
      <div
        className="prose prose-sm max-w-none p-6 bg-white rounded overflow-auto h-full"
        dangerouslySetInnerHTML={{ __html: docHtml }}
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
