import { getActiveAnnouncements } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import Link from "next/link";

export async function EmergencyBanner() {
  const announcements = await getActiveAnnouncements();
  const alert = announcements[0];

  if (!alert) return null;

  const messageText = extractTextFromRichText(alert.content);

  return (
    <div className="border-b border-[#DDD7CC] bg-cream py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex-shrink-0 rounded bg-barn-red px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            {alert.level === "critical" ? "Alert" : "Notice"}
          </span>
          <span className="text-[#2D2A24]">
            <strong className="mr-1 font-semibold">{alert.title}:</strong>
            {messageText}
            {alert.externalUrl && (
              <a
                href={alert.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-semibold text-sage underline hover:text-sage-dark"
              >
                Learn more
              </a>
            )}
            {alert.link && (
              <Link
                href={alert.link}
                className="ml-2 font-semibold text-sage underline hover:text-sage-dark"
              >
                View details
              </Link>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
