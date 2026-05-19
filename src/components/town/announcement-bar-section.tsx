import { fetchBuilderSection } from "@/lib/builder-data-server";
import { RenderBuilderSection } from "@/lib/builder-io/builder-section";

/**
 * Async server wrapper that fetches the Builder.io `announcement-bar` section
 * and renders it via the visual-editor-safe RenderBuilderSection client component.
 * Returns nothing when no active section entry exists.
 */
export async function AnnouncementBarSection() {
	const content = await fetchBuilderSection("announcement-bar");
	if (!content) return null;
	return <RenderBuilderSection model="announcement-bar" content={content} />;
}
