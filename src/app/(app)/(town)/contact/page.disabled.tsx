import type { Metadata } from "next";
import { TownContactForm } from "@/components/modules/town/town-contact-form";

export const metadata: Metadata = {
  title: "Contact Us — Phone, Email & Office Hours",
  description:
    "Contact the Town of Harmony, NC. Find office hours, phone numbers, email, and directions to Town Hall in Harmony, North Carolina.",
};

export default function ContactPage() {
  return (
    <section className="py-12 bg-cream">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark mb-6">
          Contact the Town of Harmony
        </h1>

        <TownContactForm />

        <div className="bg-white border border-stone rounded p-6 mt-6 space-y-3">
          <p>
            <strong>Town Hall</strong>
          </p>
          <p>3389 Harmony Hwy, Harmony, NC 28634</p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:7045462339" className="text-sage-dark hover:underline">
              (704) 546-2339
            </a>
          </p>
          <p>
            <strong>Office Hours:</strong> Monday – Friday, 8:00 AM – 5:00 PM
          </p>
        </div>

        <div className="bg-white border border-stone rounded p-6 mt-6">
          <h2 className="text-xl font-semibold text-sage-dark mb-3">Emergencies</h2>
          <p className="text-[#2D2A24]">
            For life-threatening emergencies, fires, or crimes in progress, dial{" "}
            <strong>911</strong>. For non-emergency fire-department matters, call{" "}
            <a href="tel:7045462300" className="text-sage-dark hover:underline">
              (704) 546-2300
            </a>
            .
          </p>
        </div>

        <p className="text-sm text-[#635E56] mt-6">
          Follow us on{" "}
          <a
            href="https://www.facebook.com/profile.php?id=100088187771930"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-dark hover:underline"
          >
            Facebook
          </a>{" "}
          for updates and announcements.
        </p>
      </div>
    </section>
  );
}
