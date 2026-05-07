import { getBuilderSettings } from "@/lib/town-settings-server";
import { getHiddenHrefs } from "@/lib/preview-flags";
import { TownFooter } from "./town-footer";

export async function TownFooterServer() {
	const [settings, hiddenHrefs] = await Promise.all([
		getBuilderSettings(),
		getHiddenHrefs(),
	]);
	return <TownFooter settings={settings} hiddenHrefs={hiddenHrefs} />;
}
