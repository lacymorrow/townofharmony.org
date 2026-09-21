/**
 * Regression tests for LAC-3978: the auto-reply footer advertised
 * admin@townofharmony.org (unverified mailbox) and 9 AM - 5 PM hours.
 * Outbound email must show phone only in the footer (white, tel: link,
 * no underline), office hours Monday - Friday 9 AM - 4 PM, and no
 * town email address anywhere in resident-facing auto-replies.
 */
import { describe, expect, it } from "vitest";
import {
  communityCenterReservationConfirmationEmail,
  communityCenterReservationNotificationEmail,
  contactConfirmationEmail,
  contactNotificationEmail,
  townContactConfirmationEmail,
  townContactNotificationEmail,
} from "@/lib/email-templates";

const reservation = {
  firstName: "Janet",
  eventDate: "2026-10-01",
  startTime: "14:00",
  endTime: "16:30",
  eventPurpose: "Quilting club",
  expectedAttendance: 20,
};

const allEmails: Record<string, string> = {
  contactConfirmation: contactConfirmationEmail({
    name: "Janet",
    message: "Hello",
  }),
  contactNotification: contactNotificationEmail({
    name: "Janet",
    message: "Hello",
    newsletter: false,
  }),
  townContactConfirmation: townContactConfirmationEmail({
    firstName: "Janet",
    inquiryType: "General",
    message: "Hello",
  }),
  townContactNotification: townContactNotificationEmail({
    firstName: "Janet",
    inquiryType: "General",
    message: "Hello",
  }),
  reservationConfirmation:
    communityCenterReservationConfirmationEmail(reservation),
  reservationNotification:
    communityCenterReservationNotificationEmail(reservation),
};

describe("email footers (LAC-3978)", () => {
  for (const [name, html] of Object.entries(allEmails)) {
    it(`${name}: no town email address, hours 9 AM - 4 PM`, () => {
      expect(html).not.toContain("admin@townofharmony.org");
      expect(html).not.toContain("info@townofharmony.org");
      expect(html).toContain("9:00 AM - 4:00 PM");
      expect(html).not.toContain("5:00 PM");
    });

    it(`${name}: footer phone is a white, non-underlined tel link`, () => {
      expect(html).toMatch(
        /<a href="tel:\+17045462339"[^>]*style="[^"]*color:#fff[^"]*text-decoration:none[^"]*"/
      );
    });
  }
});
