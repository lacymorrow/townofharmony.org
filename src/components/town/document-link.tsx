"use client";

import { DocumentViewerDialog } from "./document-viewer-dialog";

interface DocumentLinkProps {
	url: string;
	title: string;
	className?: string;
	children: React.ReactNode;
	id?: string;
}

export const DocumentLink = ({
	url,
	title,
	className,
	children,
	id,
}: DocumentLinkProps) => {
	return (
		<DocumentViewerDialog url={url} title={title}>
			<button type="button" className={className} id={id}>
				{children}
			</button>
		</DocumentViewerDialog>
	);
};
