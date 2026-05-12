import type { Metadata } from "next";
import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { DocumentViewer } from "@/components/town/document-viewer";
import { meetings } from "@/data/town/meetings";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return meetings.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const meeting = meetings.find((m) => m.slug === slug);
	if (!meeting) return { title: "Meeting Not Found" };
	return {
		title: `${meeting.title} | Town of Harmony`,
		description: meeting.minutes ?? `${meeting.title} at ${meeting.location}.`,
	};
}

export default async function MeetingDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const meeting = meetings.find((m) => m.slug === slug);
	if (!meeting) notFound();

	const date = new Date(meeting.meetingDate);
	const dateStr = date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});

	return (
		<article className="py-12 bg-cream">
			<div className="container mx-auto px-4 max-w-4xl">
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark mb-3">
					{meeting.title}
				</h1>
				<p className="text-base text-[#4A4640]">
					{dateStr} · {meeting.meetingTime} · {meeting.location}
				</p>

				{meeting.minutes && !meeting.minutesUrl && (
					<p className="mt-6 text-[#2D2A24]">{meeting.minutes}</p>
				)}

				{meeting.minutesUrl && (
					<section id="minutes" className="mt-8">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-xl font-serif font-bold text-sage-dark">
								Meeting Minutes
							</h2>
							<a
								href={meeting.minutesUrl}
								download
								className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium"
							>
								<Download className="h-4 w-4" />
								Download
							</a>
						</div>
						<div className="border border-stone rounded-lg overflow-hidden bg-white min-h-[60vh]">
							<DocumentViewer
								url={meeting.minutesUrl}
								title={`Minutes - ${meeting.title}`}
							/>
						</div>
					</section>
				)}

				{meeting.videoUrl && (
					<a
						href={meeting.videoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block mt-6 px-5 py-3 rounded border border-sage-dark text-sage-dark font-semibold hover:bg-sage-dark hover:text-white"
					>
						Watch Recording
					</a>
				)}
			</div>
		</article>
	);
}
