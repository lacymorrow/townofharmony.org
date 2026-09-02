import { NotFoundPage } from "@/components/pages/not-found-page";
import { getBuilderSettings } from "@/lib/town-settings-server";

export default async function NotFound() {
  const settings = await getBuilderSettings();
  return <NotFoundPage settings={settings} />;
}
