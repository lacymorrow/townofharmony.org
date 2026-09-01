import { describe, expect, it } from "vitest";
import { settings, toTownSettings } from "@/data/town/settings";

describe("town settings mailing address (LAC-3552)", () => {
  it("static settings include the P.O. Box mailing address", () => {
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
