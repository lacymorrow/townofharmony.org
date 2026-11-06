/**
 * Whether a Builder page entry is a URL *template* (`/events/:slug`) rather
 * than a page authored for one exact URL (LAC-7336).
 *
 * A template matches every path under its prefix, so Builder returning one
 * says nothing about whether the thing behind the slug exists. Routes with a
 * backing data entry must run their own existence check before deferring to a
 * template, or a nonexistent slug serves HTTP 200 and a client-rendered "not
 * found" (a soft 404). An exact-URL page is deliberate editor content and
 * always renders.
 */
export function isBuilderTemplatePage(page: Record<string, unknown>): boolean {
  const data = page.data as Record<string, unknown> | undefined;
  const url = typeof data?.url === "string" ? data.url : "";
  return /\/:[^/]+/.test(url);
}
