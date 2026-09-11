/**
 * Helpers for building Leaflet popup HTML from CMS-controlled fields.
 *
 * Leaflet's `bindPopup(string)` sets the popup body as `innerHTML`, so anything
 * interpolated into that template must be escaped or discarded. LAC-3637: any
 * `town-map-business` field (Builder editor or Google Places sync) could
 * inject `<img src=x onerror=…>` or a `javascript:` URL into `href`.
 */

const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export const escapeHtml = (value: string | null | undefined): string => {
	if (value == null) return "";
	return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
};

/**
 * Returns the input only when it parses as an absolute http(s) URL, otherwise
 * null. Blocks `javascript:`, `data:`, `vbscript:`, relative attribute
 * breakouts, and other scheme abuse before the value is written into `href`.
 */
export const safeHttpUrl = (value: string | null | undefined): string | null => {
	if (!value) return null;
	const trimmed = String(value).trim();
	if (!trimmed) return null;
	try {
		const url = new URL(trimmed);
		if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
		return null;
	} catch {
		return null;
	}
};
