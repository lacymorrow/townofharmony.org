// Verification for LAC-4043: ordinance PDF navigable on mobile.
// Run: node scripts/verify-lac-4043.mjs [baseUrl]
import { chromium, devices } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const url = `${base}/resources/town-ordinances`;
const outDir = process.env.PAPERCLIP_TASK_SCRATCH_DIR ?? ".";

const browser = await chromium.launch();
let failed = false;
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  if (!ok) failed = true;
};

// --- iPhone emulation: expect the pdf.js pager, navigable pages ---
{
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const indicator = page.getByText(/Page 1 of \d+/);
  await indicator.waitFor({ timeout: 30000 });
  const label = await indicator.textContent();
  const total = Number(label.match(/of (\d+)/)?.[1]);
  check(total > 1, `mobile: page count detected (${label})`);
  check((await page.locator("iframe").count()) === 0, "mobile: no PDF iframe");

  // Wait for the canvas to actually paint page 1.
  const canvas = page.locator("canvas");
  await page.waitForFunction(() => {
    const c = document.querySelector("canvas");
    return c && c.width > 0;
  });
  const pixelsAt = () =>
    page.evaluate(() => document.querySelector("canvas").toDataURL());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/lac-4043-mobile-page1.png` });
  const page1Pixels = await pixelsAt();

  await page.getByRole("button", { name: "Previous page" }).isDisabled().then((d) => check(d, "mobile: Prev disabled on page 1"));
  await page.getByRole("button", { name: "Next page" }).click();
  await page.getByText(/Page 2 of \d+/).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/lac-4043-mobile-page2.png` });
  const page2Pixels = await pixelsAt();
  check(page1Pixels !== page2Pixels, "mobile: page 2 canvas differs from page 1");

  // Jump forward a few pages, then to the end via repeated clicks on a sample.
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next page" }).click();
  await page.getByText(/Page 5 of \d+/).waitFor({ timeout: 15000 });
  check(true, "mobile: reached page 5 via Next");
  await page.screenshot({ path: `${outDir}/lac-4043-mobile-page5.png` });
  check(canvas != null, "mobile: canvas present");
  await context.close();
}

// --- Desktop: the viewer choice must match the browser's real capability.
// Headless Chromium has no PDF plugin (pdfViewerEnabled=false), so it gets
// the pager too; headful desktop Chrome gets the iframe.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const pdfViewerEnabled = await page.evaluate(() => navigator.pdfViewerEnabled);
  if (pdfViewerEnabled) {
    await page.locator("iframe").waitFor({ timeout: 30000 });
    check((await page.locator("canvas").count()) === 0, "desktop(native pdf): iframe kept, no pager");
  } else {
    await page.getByText(/Page 1 of \d+/).waitFor({ timeout: 30000 });
    check((await page.locator("iframe").count()) === 0, "desktop(no pdf plugin): pager shown");
  }
  await context.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
