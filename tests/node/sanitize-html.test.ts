import { expect, it } from "vitest";
import { runSanitizeHtmlSpec } from "../shared/sanitize-html-spec";

// LAC-3638: this config runs with environment "node", so typeof window is
// "undefined" — the exact path server components and SSR passes hit.
it("runs in a window-less environment (SSR path)", () => {
  expect(typeof window).toBe("undefined");
});

runSanitizeHtmlSpec("server / SSR");
