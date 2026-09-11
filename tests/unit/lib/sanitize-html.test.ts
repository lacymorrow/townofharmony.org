import { expect, it } from "vitest";
import { runSanitizeHtmlSpec } from "../../shared/sanitize-html-spec";

// LAC-3638: this config runs with environment "jsdom", exercising the
// browser/client path. The suite must produce the same results as the node
// run in tests/node/sanitize-html.test.ts — hydration keeps the server HTML.
it("runs in a DOM environment (client path)", () => {
  expect(typeof window).toBe("object");
});

runSanitizeHtmlSpec("browser / client");
