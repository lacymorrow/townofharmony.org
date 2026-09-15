import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { beforeAll, describe, expect, it } from "vitest";

// Regression tests for LAC-3910: Brandon's editorial checklist ("FIXED --> ...",
// "NEEDS TO BE ADDRESSED", highlighted review notes) was baked into page 1 of the
// published Code of Ordinances PDF. These markers must never appear in the live
// document again, and the two published copies must stay in sync.
const ROOT = path.resolve(__dirname, "../..");
const PRIMARY_PDF = path.join(ROOT, "public", "town-ordinance.pdf");
const DOCS_PDF = path.join(ROOT, "public", "docs", "town-ordinance.pdf");

const EDITORIAL_MARKERS = [
  "COMMENTS FOR WHAT WAS ADDED/CHANGED",
  "FIXED -->",
  "NEEDS TO BE ADDRESSED",
  "I DON'T SEE THIS ISSUE",
];

describe("Code of Ordinances PDF", () => {
  let primaryBytes: Buffer;
  let firstPageText: string;

  beforeAll(async () => {
    primaryBytes = await readFile(PRIMARY_PDF);
    const pdf = await getDocumentProxy(new Uint8Array(primaryBytes));
    const { text } = await extractText(pdf, { mergePages: false });
    firstPageText = Array.isArray(text) ? text[0] : text;
  });

  it("has no editorial annotations on the first page", () => {
    for (const marker of EDITORIAL_MARKERS) {
      expect(firstPageText).not.toContain(marker);
    }
  });

  it("still has the title block on the first page", () => {
    expect(firstPageText).toContain("CODE OF ORDINANCES");
    expect(firstPageText).toContain("HARMONY");
  });

  it("keeps the /docs copy byte-identical to the primary copy", async () => {
    const docsBytes = await readFile(DOCS_PDF);
    expect(docsBytes.equals(primaryBytes)).toBe(true);
  });
});
