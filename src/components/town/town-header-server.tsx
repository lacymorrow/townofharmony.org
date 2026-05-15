import { getBuilderSettings } from "@/lib/town-settings-server";
import { getBuilderNavigation } from "@/lib/town-navigation-server";
import { getHiddenHrefs } from "@/lib/preview-flags";
import { TownHeader } from "./town-header";

export async function TownHeaderServer() {
	const [settings, hiddenHrefs, navData] = await Promise.all([
		getBuilderSettings(),
		getHiddenHrefs(),
		getBuilderNavigation(),
	]);
	return (
		<TownHeader settings={settings} hiddenHrefs={hiddenHrefs} navData={navData} />
	);
}
