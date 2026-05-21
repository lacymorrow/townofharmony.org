"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DocumentViewer } from "./document-viewer";

interface DocumentViewerDialogProps {
	url: string;
	title: string;
	children: React.ReactNode;
}

export const DocumentViewerDialog = ({
	url,
	title,
	children,
}: DocumentViewerDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl w-[95vw] h-[85svh] flex flex-col p-0">
				<DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
					<div className="flex items-center justify-between pr-8">
						<div>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription className="sr-only">
								Document viewer for {title}
							</DialogDescription>
						</div>
						<Button asChild variant="outline" size="sm">
							<a href={url} download className="flex items-center gap-2">
								<Download className="h-4 w-4" aria-hidden="true" />
								<span>Download</span>
								<span className="sr-only">{title}</span>
							</a>
						</Button>
					</div>
				</DialogHeader>
				<div className="flex-1 overflow-hidden px-6 pb-6">
					<DocumentViewer url={url} title={title} />
				</div>
			</DialogContent>
		</Dialog>
	);
};
