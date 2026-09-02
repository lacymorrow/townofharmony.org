/* Not Found Page Component
 * This is a special Next.js page that renders when a route isn't found (404 error)
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
import { NotFoundPage } from "@/components/pages/not-found-page";
import { getBuilderSettings } from "@/lib/town-settings-server";

export default async function NotFound() {
  const settings = await getBuilderSettings();
  return <NotFoundPage settings={settings} />;
}
