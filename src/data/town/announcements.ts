import type { TownAnnouncement } from "./types";

/**
 * Intentionally empty. Notices are written by town staff in Builder
 * (`town-announcement`). A fallback here would resurrect a notice staff took
 * down: the resolver falls back whenever Builder returns zero entries, which is
 * exactly what "no notice right now" looks like.
 */
export const announcements: TownAnnouncement[] = [];
