/**
 * Shared low-level Builder.io Content API fetcher.
 *
 * Pure `fetch` + `URL` — no React, no `"use client"`. Both the client-side
 * hooks in `builder-data.ts` and the server-side helpers in
 * `builder-data-server.ts` import from here, so the sort/query/limit
 * serialization (and any future fix to it) lives in exactly one place.
 */

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const BUILDER_CDN_BASE = "https://cdn.builder.io/api/v3/content";

export interface BuilderContentEntry<T> {
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

export interface FetchOptions {
	query?: Record<string, unknown>;
	sort?: Record<string, number>;
	limit?: number;
	offset?: number;
}

/**
 * Fetch entries from a Builder.io data model.
 * Returns the `data` field from each entry.
 */
export async function fetchBuilderContent<T>(
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

	// Builder's Content API expects sort as dot-notation query params
	// (`sort.field=N`), not a JSON-stringified `sort` param — the latter is
	// silently treated as a query filter and returns 0 results.
	if (options?.sort) {
		for (const [field, direction] of Object.entries(options.sort)) {
			url.searchParams.set(`sort.${field}`, String(direction));
		}
	}

	const res = await fetch(url.toString(), {
		next: { revalidate: 60, tags: ["builder-content"] },
	});

	if (!res.ok) {
		return { results: [], count: 0 };
	}

	const json: BuilderContentResponse<T> = await res.json();
	const results = json.results.map((entry) => entry.data);

	return { results, count: results.length };
}
