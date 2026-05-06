import { EmergencyBanner } from "@/components/town/emergency-banner";
import { TownFooter } from "@/components/town/town-footer";
import { TownHeader } from "@/components/town/town-header";
import { settings } from "@/data/town/settings";

// Synchronous layout — do not make this async. An async layout causes streaming,
// which commits HTTP 200 before the page's notFound() can set the 404 status.
// Builder.io town-settings values are identical to the static fallback, so the
// async fetch was providing no functional benefit.
export default function TownLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			<TownHeader settings={settings} />
			<EmergencyBanner />
			<main id="main-content" className="flex-grow">{children}</main>
			<TownFooter settings={settings} />
		</div>
	);
}
