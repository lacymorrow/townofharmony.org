import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deriveEventStatus } from "@/lib/event-status";

describe("deriveEventStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T12:00:00-04:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // LAC-3560: past events kept a stale stored "upcoming" status
  it("returns past for a past event even when the stored status says upcoming", () => {
    expect(deriveEventStatus({ status: "upcoming", eventDate: "2026-08-14T16:00:00" })).toBe(
      "past"
    );
  });

  // LAC-3560: newer entries have a blank status, which rendered an empty pill
  it("returns upcoming for a future event with no stored status", () => {
    expect(
      deriveEventStatus({
        status: undefined,
        eventDate: "Fri Sep 11 2026 16:00:00 GMT-0400 (Eastern Daylight Time)",
      })
    ).toBe("upcoming");
  });

  it("returns upcoming for a future event with a cleared (empty string) status", () => {
    expect(deriveEventStatus({ status: "", eventDate: "2026-09-11T16:00:00" })).toBe("upcoming");
  });

  it("treats an event happening today as upcoming", () => {
    expect(deriveEventStatus({ status: "", eventDate: "2026-08-27T09:00:00" })).toBe("upcoming");
  });

  it("returns past for a past event in JS toString date format", () => {
    expect(
      deriveEventStatus({
        status: "upcoming",
        eventDate: "Fri Aug 14 2026 16:00:00 GMT-0400 (Eastern Daylight Time)",
      })
    ).toBe("past");
  });

  it("preserves cancelled regardless of the event date", () => {
    expect(deriveEventStatus({ status: "cancelled", eventDate: "2026-09-11" })).toBe("cancelled");
    expect(deriveEventStatus({ status: "cancelled", eventDate: "2026-04-11" })).toBe("cancelled");
  });

  it("falls back to the stored status when the date is unparseable", () => {
    expect(deriveEventStatus({ status: "past", eventDate: "not a date" })).toBe("past");
    expect(deriveEventStatus({ status: "", eventDate: undefined })).toBe("upcoming");
  });
});
