import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { resources } from "@/data/town/resources";

export const metadata: Metadata = {
  title: "Resources | Town of Harmony",
  description: "Documents, services, and helpful links for residents of the Town of Harmony, NC.",
};

export default function ResourcesPage() {
  const sorted = [...resources];

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-sage-dark md:text-4xl">Resources</h1>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((r) => {
            const isDocument = r.type === "document" && r.externalUrl;
            const opensInBrowser = !isDocument && r.externalUrl?.startsWith("http");
            const cardClass =
              "block bg-white rounded-lg border border-stone p-5 hover:border-sage transition-colors text-left w-full";
            const Wrapper = ({ children }: { children: React.ReactNode }) =>
              isDocument ? (
                <Link href={`${routes.town.resources}/${r.slug}`} className={cardClass} id={r.slug}>
                  {children}
                </Link>
              ) : r.externalUrl ? (
                opensInBrowser ? (
                  <a
                    href={r.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {children}
                  </a>
                ) : (
                  <Link href={r.externalUrl} className={cardClass}>
                    {children}
                  </Link>
                )
              ) : (
                <div className="block rounded-lg border border-stone bg-white p-5">{children}</div>
              );

            return (
              <Wrapper key={r.id}>
                <p className="text-sm font-bold uppercase text-sage">{r.category}</p>
                <h2 className="mt-1 font-serif text-lg font-bold text-sage-dark">
                  {r.title}
                  {r.externalUrl?.startsWith("http") && (
                    <ExternalLink
                      className="ml-1.5 inline-block h-4 w-4 align-middle text-sage"
                      aria-hidden="true"
                    />
                  )}
                </h2>
                <p className="mt-2 text-base text-[#4A4640]">{r.description}</p>
                {r.contactPhone && (
                  <p className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-[#635E56]">Phone:</span>
                    {r.externalUrl ? (
                      <span
                        className={`font-bold ${r.contactPhone === "911" ? "text-xl text-barn-red" : "text-lg text-sage"}`}
                      >
                        {r.contactPhone}
                      </span>
                    ) : (
                      <a
                        href={`tel:${r.contactPhone.replace(/[^\d+]/g, "")}`}
                        className={`font-bold hover:underline ${r.contactPhone === "911" ? "text-xl text-barn-red" : "text-lg text-sage"}`}
                      >
                        {r.contactPhone}
                      </a>
                    )}
                  </p>
                )}
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
