import type { Metadata } from "next";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentViewer } from "@/components/town/document-viewer";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";
import { resources } from "@/data/town/resources";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const documentResources = resources.filter((r) => r.type === "document" && r.externalUrl);

export async function generateStaticParams() {
  return documentResources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = documentResources.find((r) => r.slug === slug);
  if (!resource) return { title: "Document Not Found" };
  return {
    title: resource.title,
    description: resource.description,
    alternates: {
      canonical: `${siteConfig.url}/resources/${slug}`,
    },
  };
}

export default async function ResourceDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = documentResources.find((r) => r.slug === slug);
  if (!resource || !resource.externalUrl) notFound();

  return (
    <article className="bg-cream py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href={routes.town.resources}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>

        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-sage-dark md:text-4xl">
            {resource.title}
          </h1>
          <a
            href={resource.externalUrl}
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>

        <p className="mb-6 text-base text-[#4A4640]">{resource.description}</p>

        <div className="h-[85svh] min-h-[480px] overflow-hidden rounded-lg border border-stone bg-white">
          <DocumentViewer url={resource.externalUrl} title={resource.title} />
        </div>
      </div>
    </article>
  );
}
