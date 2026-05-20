import { Suspense } from "react";
import { BuilderPreviewInit } from "@/components/modules/builder/builder-preview-init";
import { EmergencyBanner } from "@/components/town/emergency-banner";
import { TownFooter } from "@/components/town/town-footer";
import { TownFooterServer } from "@/components/town/town-footer-server";
import { TownHeader } from "@/components/town/town-header";
import { TownHeaderServer } from "@/components/town/town-header-server";
import { settings } from "@/data/town/settings";
import { AnnouncementBarSection } from "@/components/town/announcement-bar-section";

// Synchronous layout — do not make this async. An async layout causes streaming,
// which commits HTTP 200 before the page's notFound() can set the 404 status.
// Async server wrappers fetch live Builder.io settings internally while the
// layout itself stays synchronous, preserving correct 404 behaviour.
export default function TownLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<BuilderPreviewInit />
			<Suspense fallback={<TownHeader settings={settings} />}>
				<TownHeaderServer />
			</Suspense>
			<Suspense fallback={null}>
				<AnnouncementBarSection />
			</Suspense>
			<EmergencyBanner />
			<main id="main-content" className="flex-grow">{children}</main>
			<Suspense fallback={<TownFooter settings={settings} />}>
				<TownFooterServer />
			</Suspense>
		</div>
	);
}
