import { getBuilderSettings } from "@/lib/town-settings-server";
import { getHiddenHrefs } from "@/lib/preview-flags";
import { TownHeader } from "./town-header";

export async function TownHeaderServer() {
	const [settings, hiddenHrefs] = await Promise.all([
		getBuilderSettings(),
		getHiddenHrefs(),
	]);
	return <TownHeader settings={settings} hiddenHrefs={hiddenHrefs} />;
}
