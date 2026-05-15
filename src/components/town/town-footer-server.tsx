import { getBuilderSettings } from "@/lib/town-settings-server";
import { getBuilderNavigation } from "@/lib/town-navigation-server";
import { getHiddenHrefs } from "@/lib/preview-flags";
import { TownFooter } from "./town-footer";

export async function TownFooterServer() {
	const [settings, hiddenHrefs, navData] = await Promise.all([
		getBuilderSettings(),
		getHiddenHrefs(),
		getBuilderNavigation(),
	]);
	return (
		<TownFooter settings={settings} hiddenHrefs={hiddenHrefs} navData={navData} />
	);
}
