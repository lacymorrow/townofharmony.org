import { getBuilderSettings } from "@/lib/town-settings-server";
import { TownHeader } from "./town-header";

export async function TownHeaderServer() {
	const settings = await getBuilderSettings();
	return <TownHeader settings={settings} />;
}
