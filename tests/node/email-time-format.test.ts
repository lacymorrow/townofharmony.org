/**
 * Regression tests for LAC-3951: reservation emails showed military time
 * (e.g. "14:00") because the native <input type="time"> submits 24-hour
 * strings that were rendered raw. Emails must show standard 12-hour time
 * with AM/PM, and formatTime must leave already-formatted values alone.
 */
import { describe, expect, it } from "vitest";
import {
  communityCenterReservationConfirmationEmail,
  communityCenterReservationNotificationEmail,
} from "@/lib/email-templates";
import { formatTime } from "@/lib/utils";

const reservation = {
  firstName: "Janet",
  email: "janet@example.com",
  eventDate: "2026-10-01",
  startTime: "14:00",
  endTime: "17:30",
  eventPurpose: "Quilting club",
  expectedAttendance: 20,
};

describe("formatTime (LAC-3951)", () => {
  it("converts 24-hour times to 12-hour with AM/PM", () => {
    expect(formatTime("14:00")).toBe("2:00 PM");
    expect(formatTime("09:05")).toBe("9:05 AM");
    expect(formatTime("00:15")).toBe("12:15 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
  });

  it("passes through values that already have AM/PM or are plain language", () => {
    expect(formatTime("7:00 PM")).toBe("7:00 PM");
    expect(formatTime("Noon")).toBe("Noon");
  });
});

describe("Community Center reservation emails (LAC-3951)", () => {
  it("renders standard time, not military, in the staff notification", () => {
    const html = communityCenterReservationNotificationEmail(reservation);
    expect(html).toContain("2:00 PM");
    expect(html).toContain("5:30 PM");
    expect(html).not.toContain("14:00");
    expect(html).not.toContain("17:30");
  });

  it("renders standard time, not military, in the requester confirmation", () => {
    const html = communityCenterReservationConfirmationEmail(reservation);
    expect(html).toContain("2:00 PM");
    expect(html).toContain("5:30 PM");
    expect(html).not.toContain("14:00");
    expect(html).not.toContain("17:30");
  });
});
