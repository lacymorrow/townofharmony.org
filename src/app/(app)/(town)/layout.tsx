import { BuilderPreviewInit } from "@/components/modules/builder/builder-preview-init";
import { EmergencyBanner } from "@/components/town/emergency-banner";
import { TownFooterServer } from "@/components/town/town-footer-server";
import { TownHeaderServer } from "@/components/town/town-header-server";
import { AnnouncementBarSection } from "@/components/town/announcement-bar-section";

// Synchronous layout — do not make this async, and do NOT wrap async server
// components in <Suspense>. Either causes Next.js to start streaming and commit
// HTTP 200 before the child catch-all page can call notFound(), producing soft
// 404s on unknown URLs.
//
// Async server wrappers (TownHeaderServer, AnnouncementBarSection,
// TownFooterServer) are awaited inline — React will block rendering on them,
// the catch-all page resolves in parallel, and notFound() propagates before
// the response is committed. The Builder.io fetches inside the wrappers are
// cached (unstable_cache, revalidate: 3600) so the blocking cost is negligible
// after the first request per ISR cycle.
export default function TownLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<BuilderPreviewInit />
			<TownHeaderServer />
			<AnnouncementBarSection />
			<EmergencyBanner />
			<main id="main-content" className="flex-grow">{children}</main>
			<TownFooterServer />
		</div>
	);
}
