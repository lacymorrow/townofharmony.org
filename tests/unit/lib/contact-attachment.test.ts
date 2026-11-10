import { describe, expect, it } from "vitest";
import { CONTACT_ATTACHMENT_ACCEPT, resolveContactAttachmentType } from "@/lib/contact-attachment";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("resolveContactAttachmentType", () => {
  it("accepts Word files by MIME type", () => {
    expect(resolveContactAttachmentType({ name: "letter.doc", type: "application/msword" })).toBe(
      "application/msword"
    );
    expect(resolveContactAttachmentType({ name: "letter.docx", type: DOCX })).toBe(DOCX);
  });

  // Windows without Office reports "" for .docx; the extension must carry it.
  it("falls back to the extension when the browser reports no type", () => {
    expect(resolveContactAttachmentType({ name: "Letter.DOCX", type: "" })).toBe(DOCX);
    expect(
      resolveContactAttachmentType({ name: "scan.pdf", type: "application/octet-stream" })
    ).toBe("application/pdf");
  });

  it("rejects other types even when the extension looks fine", () => {
    expect(resolveContactAttachmentType({ name: "sheet.xlsx", type: "" })).toBeNull();
    expect(resolveContactAttachmentType({ name: "trick.pdf", type: "text/html" })).toBeNull();
  });

  it("lists Word in the picker filter", () => {
    expect(CONTACT_ATTACHMENT_ACCEPT).toContain(".doc");
    expect(CONTACT_ATTACHMENT_ACCEPT).toContain(".docx");
  });
});
