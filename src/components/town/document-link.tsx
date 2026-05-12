"use client";

import { DocumentViewerDialog } from "./document-viewer-dialog";

interface DocumentLinkProps {
	url: string;
	title: string;
	className?: string;
	children: React.ReactNode;
}

export const DocumentLink = ({
	url,
	title,
	className,
	children,
}: DocumentLinkProps) => {
	return (
		<DocumentViewerDialog url={url} title={title}>
			<button type="button" className={className}>
				{children}
			</button>
		</DocumentViewerDialog>
	);
};
