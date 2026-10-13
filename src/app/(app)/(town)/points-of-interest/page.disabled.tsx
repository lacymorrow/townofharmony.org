import type { Metadata } from "next";
import { pointsOfInterest } from "@/data/town/points-of-interest";

export const metadata: Metadata = {
  title: "Points of Interest | Town of Harmony",
  description: "Parks, landmarks, and notable locations in the Town of Harmony, NC.",
};

export default function PointsOfInterestPage() {
  return (
    <section className="bg-cream py-12">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-sage-dark md:text-4xl">
            Points of Interest
          </h1>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pointsOfInterest.map((p) => (
            <div key={p.id} className="rounded-lg border border-stone bg-white p-5">
              <p className="text-sm font-bold uppercase text-sage">{p.category}</p>
              <h2 className="mt-1 font-serif text-lg font-bold text-sage-dark">{p.name}</h2>
              <p className="mt-1 text-base text-[#635E56]">{p.address}</p>
              <p className="mt-2 text-base text-[#2D2A24]">{p.description}</p>
              <p className="mt-3 text-sm text-[#635E56]">
                <strong>Hours:</strong> {p.hours}
              </p>
              {p.amenities.length > 0 && (
                <p className="mt-2 text-sm text-[#635E56]">
                  <strong>Amenities:</strong> {p.amenities.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
