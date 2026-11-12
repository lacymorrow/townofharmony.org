import { describe, expect, it } from "vitest";
import { settings, toTownSettings } from "@/data/town/settings";

describe("town settings mailing address (LAC-3552)", () => {
  it("static settings use the P.O. Box as the mailing address", () => {
    // Narrowed from "street + P.O. Box" to the P.O. Box alone by #408, a client
    // request ("Mailing Address default is the P.O. Box only"), which also set
    // the Builder town-settings contactMailingAddress to the same value so staff
    // own it. That PR did not update this assertion, so main's Test job has been
    // red since f13dc462 (2026-11-10). Stale test, shipped behaviour: the
    // assertion follows the data, not the other way round.
    expect(settings.contactInfo.mailingAddress).toBe("P.O. Box 118, Harmony, NC 28634");
  });

  it("keeps the physical address separate from the mailing address", () => {
    expect(settings.contactInfo.address).toBe("3389 Harmony Hwy, Harmony, NC 28634");
    expect(settings.contactInfo.mailingAddress).not.toBe(settings.contactInfo.address);
  });

  it("uses the Builder-provided mailing address when set", () => {
    const result = toTownSettings({ contactMailingAddress: "P.O. Box 999, Harmony, NC 28634" });
    expect(result.contactInfo.mailingAddress).toBe("P.O. Box 999, Harmony, NC 28634");
  });

  it("falls back to the static mailing address when Builder omits the field", () => {
    const result = toTownSettings({});
    expect(result.contactInfo.mailingAddress).toBe(settings.contactInfo.mailingAddress);
  });

  it("falls back when a Builder editor clears the field to an empty string", () => {
    // Builder returns "" (not undefined) for cleared fields
    const result = toTownSettings({ contactMailingAddress: "" });
    expect(result.contactInfo.mailingAddress).toBe(settings.contactInfo.mailingAddress);
  });
});
