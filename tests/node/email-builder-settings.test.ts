/**
 * LAC-8682: resident-facing emails read the Builder-backed town settings and
 * fall back to the static file per field.
 */
import { describe, expect, it } from "vitest";
import { settings } from "@/data/town/settings";
import {
  communityCenterReservationConfirmationEmail,
  contactConfirmationEmail,
  townContactConfirmationEmail,
} from "@/lib/email-templates";

const builder = {
  ...settings,
  contactInfo: { ...settings.contactInfo, phone: "(704) 555-0142", address: "1 Test Lane, Harmony, NC" },
  officeHours: { ...settings.officeHours, weekday: "Tuesday - Thursday 10:00 AM - 2:00 PM" },
};

describe("email Builder settings (LAC-8682)", () => {
  it("renders Builder phone, address and hours", () => {
    const html = townContactConfirmationEmail(
      { firstName: "Janet", inquiryType: "General", message: "Hi" },
      builder
    );
    expect(html).toContain('href="tel:+17045550142"');
    expect(html).toContain("Phone: (704) 555-0142");
    expect(html).toContain("1 Test Lane, Harmony, NC");
    expect(html).toContain("Tuesday - Thursday 10:00 AM - 2:00 PM");
    expect(html).not.toContain(settings.contactInfo.phone);
  });

  it("falls back to static settings when Builder is null or a field is empty", () => {
    const empty = { ...builder, contactInfo: { ...builder.contactInfo, phone: " " } };
    for (const town of [null, undefined]) {
      expect(contactConfirmationEmail({ name: "J", message: "m" }, town)).toContain(
        settings.contactInfo.phone
      );
    }
    const html = communityCenterReservationConfirmationEmail(
      {
        firstName: "J",
        eventDate: "2026-10-01",
        startTime: "14:00",
        endTime: "16:00",
        eventPurpose: "x",
        expectedAttendance: 2,
      },
      empty
    );
    expect(html).toContain(settings.contactInfo.phone);
    expect(html).toContain("1 Test Lane, Harmony, NC");
  });
});
