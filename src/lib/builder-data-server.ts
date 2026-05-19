/**
 * Server-side Builder.io data fetching.
 * This file has NO "use client" directive, so it can be imported in Server Components.
 */

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const BUILDER_CDN_BASE = "https://cdn.builder.io/api/v3/content";

interface BuilderContentEntry<T> {
	id: string;
	name: string;
	data: T;
	published: string;
	createdDate: number;
	lastUpdated: number;
}

interface BuilderContentResponse<T> {
	results: BuilderContentEntry<T>[];
}

interface FetchOptions {
	query?: Record<string, unknown>;
	sort?: Record<string, number>;
	limit?: number;
	offset?: number;
}

/**
 * Fetch entries from a Builder.io data model (server-side).
 * Returns the `data` field from each entry.
 */
async function fetchBuilderContent<T>(
	modelName: string,
	options?: FetchOptions,
): Promise<{ results: T[]; count: number }> {
	if (!BUILDER_API_KEY) {
		return { results: [], count: 0 };
	}

	const url = new URL(`${BUILDER_CDN_BASE}/${modelName}`);
	url.searchParams.set("apiKey", BUILDER_API_KEY);
	url.searchParams.set("limit", String(options?.limit ?? 100));
	url.searchParams.set("includeUnpublished", "false");

	if (options?.offset) {
		url.searchParams.set("offset", String(options.offset));
	}

	if (options?.query) {
		url.searchParams.set("query", JSON.stringify(options.query));
	}

	if (options?.sort) {
		url.searchParams.set("sort", JSON.stringify(options.sort));
	}

	const res = await fetch(url.toString(), {
		next: { revalidate: 60 },
	});

	if (!res.ok) {
		return { results: [], count: 0 };
	}

	const json: BuilderContentResponse<T> = await res.json();
	const results = json.results.map((entry) => entry.data);

	return { results, count: results.length };
}

/**
 * Fetch a single entry from a Builder.io data model by query (server-side).
 */
async function fetchBuilderEntry<T>(
	modelName: string,
	query: Record<string, unknown>,
): Promise<T | null> {
	const { results } = await fetchBuilderContent<T>(modelName, {
		query,
		limit: 1,
	});
	return results[0] ?? null;
}

/**
 * Fetch a Builder.io visual page by URL path.
 * Returns the full BuilderContent object for rendering with RenderBuilderContent,
 * or null when no page targets the given path.
 */
async function getBuilderPageContent(
	urlPath: string,
): Promise<Record<string, unknown> | null> {
	if (!BUILDER_API_KEY) {
		return null;
	}

	try {
		const url = new URL(`${BUILDER_CDN_BASE}/page`);
		url.searchParams.set("apiKey", BUILDER_API_KEY);
		url.searchParams.set("userAttributes.urlPath", urlPath);
		url.searchParams.set("limit", "1");
		url.searchParams.set("noCache", "true");

		const res = await fetch(url.toString(), {
			next: { revalidate: 0 },
		});

		if (!res.ok) {
			return null;
		}

		const data = await res.json();
		const results = data?.results;
		if (!results || results.length === 0) {
			return null;
		}

		const page = results[0] as Record<string, unknown>;
		const pageData = page.data as Record<string, unknown> | undefined;
		const pageUrl = pageData?.url as string | undefined;
		const normalize = (u: string) => u.toLowerCase().replace(/\/+$/, "") || "/";
		const isTemplate = /\/:[^/]+/.test(pageUrl ?? "");
		if (!pageUrl || (!isTemplate && normalize(pageUrl) !== normalize(urlPath))) {
			return null;
		}

		return page;
	} catch {
		return null;
	}
}

/**
 * Fetch a single Builder.io Section model entry for a given URL path.
 * Returns the full content object for rendering with RenderBuilderSection,
 * or null when no active section targets the given model/path.
 */
async function fetchBuilderSection(
	model: string,
	urlPath?: string,
): Promise<Record<string, unknown> | null> {
	if (!BUILDER_API_KEY) return null;
	try {
		const url = new URL(`${BUILDER_CDN_BASE}/${model}`);
		url.searchParams.set("apiKey", BUILDER_API_KEY);
		if (urlPath) url.searchParams.set("userAttributes.urlPath", urlPath);
		url.searchParams.set("limit", "1");
		url.searchParams.set("noCache", "true");
		const res = await fetch(url.toString(), { next: { revalidate: 60 } });
		if (!res.ok) return null;
		const data = await res.json();
		return (data?.results?.[0] as Record<string, unknown>) ?? null;
	} catch {
		return null;
	}
}

export { fetchBuilderContent, fetchBuilderEntry, fetchBuilderSection, getBuilderPageContent };
export type { FetchOptions };
