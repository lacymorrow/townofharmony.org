import { getActiveAnnouncements } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import Link from "next/link";

export async function EmergencyBanner() {
	const announcements = await getActiveAnnouncements();
	const alert = announcements[0];

	if (!alert) return null;

	const messageText = extractTextFromRichText(alert.content);

	return (
		<div className="bg-cream border-b border-[#DDD7CC] py-3">
			<div className="container mx-auto px-4">
				<div className="flex items-center gap-3 text-sm">
					<span className="bg-barn-red text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide flex-shrink-0">
						{alert.level === "critical" ? "Alert" : "Notice"}
					</span>
					<span className="text-[#2D2A24]">
						<strong className="font-semibold mr-1">{alert.title}:</strong>
						{messageText}
						{alert.externalUrl && (
							<a
								href={alert.externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-sage font-semibold hover:text-sage-dark underline"
							>
								Learn more
							</a>
						)}
						<Link
							href={alert.link ?? `/emergency/alerts/${alert.id}`}
							className="ml-2 text-sage font-semibold hover:text-sage-dark underline"
						>
							View details
						</Link>
					</span>
				</div>
			</div>
		</div>
	);
}
