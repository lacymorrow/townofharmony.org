import type { Metadata } from "next";
import { historyArticles } from "@/data/town/history";

export const metadata: Metadata = {
  title: "History | Town of Harmony",
  description: "The history of the Town of Harmony, NC — incorporated 1927.",
};

export default function HistoryPage() {
  const periods = historyArticles.filter((a) => a.type === "period");
  const landmarks = historyArticles.filter((a) => a.type === "landmark");

  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        <header className="mb-10 max-w-3xl">
          <h1 className="font-serif text-3xl font-bold text-sage-dark md:text-4xl">
            History of Harmony
          </h1>
          <p className="mt-3 text-[#4A4640]">
            Harmony, North Carolina was incorporated <strong>1927</strong>. The town takes its name
            from the Harmony Hill Camp Meetings, which were first held in 1846 on the grounds of the
            present-day Harmony Elementary School. The town sits at the crossroads of Highway 21 N
            and Highway 901 in north Iredell County. As of the 2020 census, Harmony's population was
            543.
          </p>
        </header>

        <h2 className="mb-6 text-2xl font-bold text-[#2D2A24]">Timeline</h2>
        <ol className="mb-12 space-y-6">
          {periods.map((p) => (
            <li key={p.id} className="rounded-lg border border-stone bg-white p-5">
              <p className="text-sm font-bold uppercase text-sage">{p.era}</p>
              <h3 className="mt-1 font-serif text-xl font-bold text-sage-dark">{p.title}</h3>
              <p className="mt-2 text-[#2D2A24]">{p.content}</p>
              {p.highlights && p.highlights.length > 0 && (
                <ul className="mt-3 list-inside list-disc space-y-1 text-base text-[#4A4640]">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <h2 className="mb-6 text-2xl font-bold text-[#2D2A24]">Landmarks</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {landmarks.map((l) => (
            <div key={l.id} className="rounded-lg border border-stone bg-white p-5">
              {l.year && <p className="text-sm font-bold uppercase text-sage">{l.year}</p>}
              <h3 className="mt-1 font-serif text-lg font-bold text-sage-dark">{l.title}</h3>
              {l.address && <p className="mt-1 text-base text-[#635E56]">{l.address}</p>}
              <p className="mt-2 text-base text-[#2D2A24]">{l.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
