import { getBuilderSettings } from "@/lib/town-settings-server";
import { TownFooter } from "./town-footer";

export async function TownFooterServer() {
	const settings = await getBuilderSettings();
	return <TownFooter settings={settings} />;
}
