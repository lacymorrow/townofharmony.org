import type { Metadata } from "next";
import Link from "next/link";
import { businesses } from "@/data/town/businesses";

export const metadata: Metadata = {
  title: "Business Directory | Town of Harmony",
  description:
    "Civic and community listings in Harmony, NC. For the full local business directory, see the interactive map.",
};

export default function BusinessDirectoryPage() {
  const featured = businesses.filter((b) => b.isFeatured);
  const others = businesses.filter((b) => !b.isFeatured);

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-sage-dark md:text-4xl">
            Civic Directory
          </h1>
          <p className="mt-2 text-[#4A4640]">
            Civic and community organizations serving Harmony. For local restaurants, retail,
            services and more, see the{" "}
            <Link href="/map" className="text-sage-dark underline">
              interactive map
            </Link>
            .
          </p>
        </header>

        {[...featured, ...others].map((b) => (
          <div key={b.id} className="mb-4 rounded-lg border border-stone bg-white p-5">
            <p className="text-sm font-bold uppercase text-sage">{b.category}</p>
            <h2 className="mt-1 font-serif text-lg font-bold text-sage-dark">{b.name}</h2>
            <p className="mt-1 text-base text-[#2D2A24]">{b.description}</p>
            <dl className="mt-3 grid grid-cols-1 gap-y-1 text-sm text-[#4A4640] sm:grid-cols-2">
              <div>
                <dt className="inline font-semibold">Address: </dt>
                <dd className="inline">
                  {b.address}, {b.city}, {b.stateCode} {b.zipCode}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Phone: </dt>
                <dd className="inline">
                  <a href={`tel:${b.phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">
                    {b.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Hours: </dt>
                <dd className="inline">{b.hours}</dd>
              </div>
              {b.website && (
                <div>
                  <dt className="inline font-semibold">Website: </dt>
                  <dd className="inline">
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage-dark hover:underline"
                    >
                      {b.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
