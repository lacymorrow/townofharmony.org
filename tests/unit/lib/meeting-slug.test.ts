import { describe, expect, it } from "vitest";

import { findMeetingBySlug, getCanonicalMeetingSlug, getMeetingSlugBase } from "@/lib/meeting-slug";

describe("getCanonicalMeetingSlug", () => {
  it("appends the meeting date to a slug that lacks one", () => {
    expect(
      getCanonicalMeetingSlug({
        slug: "town-council-meeting",
        meetingDate: "Mon Sep 14 2026 18:00:00 GMT-0400 (Eastern Daylight Time)",
      })
    ).toBe("town-council-meeting-2026-09-14");
  });

  it("keeps a slug that already ends with its date", () => {
    expect(
      getCanonicalMeetingSlug({
        slug: "council-meeting-2025-08-04",
        meetingDate: "2025-08-04",
      })
    ).toBe("council-meeting-2025-08-04");
  });

  it("handles ISO datetime meeting dates", () => {
    expect(
      getCanonicalMeetingSlug({
        slug: "special-meeting",
        meetingDate: "2025-12-17T18:00:00.000Z",
      })
    ).toBe("special-meeting-2025-12-17");
  });

  it("normalizes casing and stray characters in the slug", () => {
    expect(
      getCanonicalMeetingSlug({
        slug: "July-Town-Council-Meeting",
        meetingDate: "2025-07-07",
      })
    ).toBe("july-town-council-meeting-2025-07-07");
  });

  it("falls back to the title when the slug is empty", () => {
    // Builder clears fields to "" rather than undefined
    expect(
      getCanonicalMeetingSlug({
        slug: "",
        title: "Special Meeting",
        meetingDate: "2026-06-22",
      })
    ).toBe("special-meeting-2026-06-22");
  });

  it("returns the base slug unchanged when the date is unparseable", () => {
    expect(getCanonicalMeetingSlug({ slug: "town-council-meeting", meetingDate: "TBD" })).toBe(
      "town-council-meeting"
    );
  });
});

describe("getMeetingSlugBase", () => {
  it("strips a trailing date suffix", () => {
    expect(getMeetingSlugBase("town-council-meeting-2026-09-14")).toBe("town-council-meeting");
  });

  it("returns a slug without a date suffix unchanged", () => {
    expect(getMeetingSlugBase("town-council-meeting")).toBe("town-council-meeting");
  });
});

describe("findMeetingBySlug", () => {
  const meetings = [
    {
      slug: "town-council-meeting",
      title: "Town Council Meeting APR 2026",
      meetingDate: "Mon Apr 06 2026 18:00:00 GMT-0400 (Eastern Daylight Time)",
    },
    {
      slug: "town-council-meeting",
      title: "Town Council Meeting SEP 2026",
      meetingDate: "Mon Sep 14 2026 18:00:00 GMT-0400 (Eastern Daylight Time)",
    },
    {
      slug: "council-meeting-2025-08-04",
      title: "Board of Aldermen Meeting - August 4, 2025",
      meetingDate: "2025-08-04",
    },
  ];

  it("finds a meeting by exact slug", () => {
    expect(findMeetingBySlug(meetings, "council-meeting-2025-08-04")?.title).toBe(
      "Board of Aldermen Meeting - August 4, 2025"
    );
  });

  it("resolves date-suffixed slugs to the right meeting even when raw slugs collide", () => {
    expect(findMeetingBySlug(meetings, "town-council-meeting-2026-04-06")?.title).toBe(
      "Town Council Meeting APR 2026"
    );
    expect(findMeetingBySlug(meetings, "town-council-meeting-2026-09-14")?.title).toBe(
      "Town Council Meeting SEP 2026"
    );
  });

  it("falls back to an exact raw match for legacy non-dated slugs", () => {
    // "town-council-meeting" is ambiguous (two entries share it); canonical
    // resolution can't disambiguate either, so the first raw match wins.
    expect(findMeetingBySlug(meetings, "town-council-meeting")).toBe(meetings[0]);
  });

  it("returns null for an unknown slug", () => {
    expect(findMeetingBySlug(meetings, "no-such-meeting-2020-01-01")).toBeNull();
  });
});
