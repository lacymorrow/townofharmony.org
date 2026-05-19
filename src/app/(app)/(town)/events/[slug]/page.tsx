import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilderPageContent } from "@/lib/builder-data-server";
import { RenderBuilderContent } from "@/lib/builder-io/builder-io";
import { resolveEvents, getEventBySlug } from "@/lib/town-data";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	const allEvents = await resolveEvents();
	return allEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const event = await getEventBySlug(slug);
	if (!event) return { title: "Event Not Found" };
	return {
		title: `${event.title} | Town of Harmony`,
		description: event.description,
	};
}

export default async function EventDetailPage({ params }: PageProps) {
	const { slug } = await params;

	const builderContent = await getBuilderPageContent(`/events/${slug}`);
	if (builderContent) {
		return <RenderBuilderContent content={builderContent} model="page" />;
	}

	const event = await getEventBySlug(slug);
	if (!event) notFound();

	const date = new Date(event.eventDate);
	const dateStr = date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<article className="py-12 bg-cream">
			<div className="container mx-auto px-4 max-w-3xl">
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark mb-3">
					{event.title}
				</h1>
				<p className="text-base text-[#4A4640]">
					{dateStr} · {event.eventTime}
					{event.endTime && event.endTime !== event.eventTime
						? ` – ${event.endTime}`
						: ""}
				</p>
				<p className="text-base text-[#4A4640] mb-6">
					{event.location}
					{event.locationAddress ? ` · ${event.locationAddress}` : ""}
				</p>
				{event.featuredImage && (
					<div className="mb-8 overflow-hidden rounded-lg">
						<img
							src={event.featuredImage}
							alt={event.title}
							className="w-full h-72 object-cover"
						/>
					</div>
				)}
				<div className="prose prose-sage max-w-none text-[#2D2A24]">
					<p>{event.content}</p>
				</div>
				{(event.contactPhone || event.contactEmail) && (
					<div className="mt-8 p-4 bg-white border border-stone rounded">
						<h2 className="font-semibold mb-2">Contact</h2>
						{event.contactPhone && (
							<p>
								<a
									href={`tel:${event.contactPhone.replace(/[^0-9+]/g, "")}`}
									className="text-sage-dark hover:underline"
								>
									{event.contactPhone}
								</a>
							</p>
						)}
						{event.contactEmail && (
							<p>
								<a
									href={`mailto:${event.contactEmail}`}
									className="text-sage-dark hover:underline"
								>
									{event.contactEmail}
								</a>
							</p>
						)}
					</div>
				)}
			</div>
		</article>
	);
}
