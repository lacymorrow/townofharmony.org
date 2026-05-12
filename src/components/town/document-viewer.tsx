"use client";

import DOMPurify from "dompurify";
import { Download, FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
	url: string;
	title?: string;
}

const getFileExtension = (url: string): string => {
	const pathname = new URL(url, window.location.origin).pathname;
	return pathname.split(".").pop()?.toLowerCase() ?? "";
};

export const DocumentViewer = ({ url, title }: DocumentViewerProps) => {
	const [docHtml, setDocHtml] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const ext = typeof window !== "undefined" ? getFileExtension(url) : "";
	const isPdf = ext === "pdf";
	const isDocx = ext === "docx";

	const loadDocx = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error("Failed to fetch document");
			const arrayBuffer = await response.arrayBuffer();
			const mammoth = await import("mammoth");
			const result = await mammoth.convertToHtml({ arrayBuffer });
			setDocHtml(DOMPurify.sanitize(result.value));
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load document");
		} finally {
			setLoading(false);
		}
	}, [url]);

	useEffect(() => {
		if (isDocx) {
			loadDocx();
		} else {
			setLoading(false);
		}
	}, [isDocx, loadDocx]);

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

	if (isPdf) {
		return (
			<iframe
				src={url}
				title={title ?? "Document"}
				className="w-full h-full border-0 rounded"
			/>
		);
	}

	if (isDocx && docHtml !== null) {
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
			<p className="text-sm text-muted-foreground">
				This file type cannot be previewed.
			</p>
			<Button asChild variant="outline" size="sm">
				<a href={url} download className="flex items-center gap-2">
					<Download className="h-4 w-4" />
					Download File
				</a>
			</Button>
		</div>
	);
};
