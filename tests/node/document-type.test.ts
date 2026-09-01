import { describe, expect, it } from "vitest";
import {
  detectKindFromBytes,
  detectKindFromContentType,
  detectKindFromUrl,
  getExtensionFromUrl,
} from "@/lib/document-type";

// Regression tests for LAC-3623: Builder-uploaded meeting minutes have CDN
// URLs with no file extension in the path (the original filename only exists
// in the Content-Disposition header), so extension sniffing alone reported
// "This file type cannot be previewed."
const BUILDER_ASSET_URL =
  "https://cdn.builder.io/o/assets%2F6906107178ed48fd8cb869c00236b0f0%2F84783078cf824200a02e709b290bc58d?alt=media&token=6f9eafa0-b2a2-4f7f-abd3-41315c0ff1a5&apiKey=6906107178ed48fd8cb869c00236b0f0";

describe("getExtensionFromUrl", () => {
  it("returns empty string for extensionless Builder CDN asset URLs", () => {
    expect(getExtensionFromUrl(BUILDER_ASSET_URL)).toBe("");
  });

  it("finds the extension in plain static paths", () => {
    expect(getExtensionFromUrl("/docs/meetings/February_3_2025_Minutes.pdf")).toBe("pdf");
  });

  it("handles filenames with interior dots", () => {
    expect(getExtensionFromUrl("/docs/meetings/January_7_2019_Spec._Meeting.docx")).toBe("docx");
  });

  it("handles percent-encoded filenames with spaces, commas, and dots", () => {
    expect(
      getExtensionFromUrl("https://example.com/files/June%2022,%202026%20Spec.%20Meeting.docx")
    ).toBe("docx");
  });

  it("lowercases uppercase extensions", () => {
    expect(getExtensionFromUrl("/docs/MINUTES.PDF")).toBe("pdf");
  });

  it("ignores the query string", () => {
    expect(getExtensionFromUrl("/docs/minutes.docx?version=2")).toBe("docx");
  });

  it("returns empty string for extensionless paths even when a directory contains a dot", () => {
    expect(getExtensionFromUrl("/docs/v1.2/minutes")).toBe("");
  });

  it("returns empty string for unparseable input", () => {
    expect(getExtensionFromUrl("http://")).toBe("");
  });
});

describe("detectKindFromUrl", () => {
  it("maps pdf and docx extensions to their kind", () => {
    expect(detectKindFromUrl("/docs/meetings/February_3_2025_Minutes.pdf")).toBe("pdf");
    expect(detectKindFromUrl("/docs/meetings/January_7_2019_Spec._Meeting.docx")).toBe("docx");
  });

  it("returns unknown for extensionless Builder CDN asset URLs and other extensions", () => {
    expect(detectKindFromUrl(BUILDER_ASSET_URL)).toBe("unknown");
    expect(detectKindFromUrl("/docs/report.txt")).toBe("unknown");
  });
});

describe("detectKindFromContentType", () => {
  it("detects pdf", () => {
    expect(detectKindFromContentType("application/pdf")).toBe("pdf");
  });

  it("detects docx, including with charset parameters", () => {
    expect(
      detectKindFromContentType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("docx");
    expect(
      detectKindFromContentType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=utf-8"
      )
    ).toBe("docx");
  });

  it("returns unknown for generic or missing content types", () => {
    expect(detectKindFromContentType("application/octet-stream")).toBe("unknown");
    expect(detectKindFromContentType(null)).toBe("unknown");
  });
});

describe("detectKindFromBytes", () => {
  it("detects the %PDF magic bytes", () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
    expect(detectKindFromBytes(bytes.buffer)).toBe("pdf");
  });

  it("detects the zip container magic bytes used by docx", () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    expect(detectKindFromBytes(bytes.buffer)).toBe("docx");
  });

  it("returns unknown for other content", () => {
    const bytes = new Uint8Array([0x3c, 0x68, 0x74, 0x6d]);
    expect(detectKindFromBytes(bytes.buffer)).toBe("unknown");
    expect(detectKindFromBytes(new Uint8Array([]).buffer)).toBe("unknown");
  });
});
