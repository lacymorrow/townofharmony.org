import { getBuilderSettings } from "@/lib/town-settings-server";
import type { TownSettings } from "@/data/town/types";

// Resident-facing emails read the same Builder-backed settings as the site.
// Any failure returns null and the templates fall back to the static file.
export async function getEmailTownSettings(): Promise<TownSettings | null> {
  try {
    return await getBuilderSettings();
  } catch {
    return null;
  }
}
