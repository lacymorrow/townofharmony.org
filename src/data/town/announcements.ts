import type { TownAnnouncement } from "./types";

export const announcements: TownAnnouncement[] = [
  {
    id: 2,
    title: "Christmas Parade Application Now Available",
    content:
      "Entries for the Sunday, December 6 parade are due Wednesday, December 2. Download the application.",
    link: "/docs/2026-christmas-parade-application.pdf",
    level: "info",
    isActive: true,
    endsAt: "2026-12-03T00:00:00.000Z",
    createdAt: "2026-10-27",
  },
  {
    id: 1,
    title: "Welcome to the New Town of Harmony Website",
    content: "Take a look around and let us know what you think via the Contact page.",
    link: "/contact",
    level: "info",
    isActive: true,
    createdAt: "2026-05-05",
  },
];
