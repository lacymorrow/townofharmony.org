import type { Metadata } from "next";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentViewer } from "@/components/town/document-viewer";
import { resources } from "@/data/town/resources";

interface PageProps {
	params: Promise<{ slug: string }>;
}

const documentResources = resources.filter(
	(r) => r.type === "document" && r.externalUrl,
);

export async function generateStaticParams() {
	return documentResources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const resource = documentResources.find((r) => r.slug === slug);
	if (!resource) return { title: "Document Not Found" };
	return {
		title: `${resource.title} | Town of Harmony`,
		description: resource.description,
	};
}

export default async function ResourceDocumentPage({ params }: PageProps) {
	const { slug } = await params;
	const resource = documentResources.find((r) => r.slug === slug);
	if (!resource || !resource.externalUrl) notFound();

	return (
		<article className="py-12 bg-cream">
			<div className="container mx-auto px-4 max-w-4xl">
				<Link
					href="/resources"
					className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium mb-6"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Resources
				</Link>

				<div className="flex items-center justify-between mb-3">
					<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark">
						{resource.title}
					</h1>
					<a
						href={resource.externalUrl}
						download
						className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium"
					>
						<Download className="h-4 w-4" />
						Download
					</a>
				</div>

				<p className="text-base text-[#4A4640] mb-6">{resource.description}</p>

				<div className="border border-stone rounded-lg overflow-hidden bg-white min-h-[70vh]">
					<DocumentViewer
						url={resource.externalUrl}
						title={resource.title}
					/>
				</div>
			</div>
		</article>
	);
}
