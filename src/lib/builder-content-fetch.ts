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

// Builder's Content API caps a single request at 100 results regardless of the
// `limit` param, so we page underneath our callers to honor larger `limit`
// values (LAC-3555).
const BUILDER_PAGE_SIZE = 100;

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
 * Fetch raw entries from a Builder.io data model.
 * Preserves the top-level `entry.id` so callers can use it (e.g. when the model
 * has no `id` field of its own but consumers need a stable identifier).
 *
 * When the requested `limit` exceeds Builder's per-request cap of 100 (or is
 * omitted — treated as "all"), this pages under the hood using `offset` until
 * either the requested `limit` is satisfied or a page returns fewer than the
 * page size (end of data). Callers that pass their own `offset` opt out of the
 * loop — a manual offset signals they're doing their own pagination.
 */
export async function fetchBuilderEntries<T>(
	modelName: string,
	options?: FetchOptions,
): Promise<{ results: BuilderContentEntry<T>[]; count: number }> {
	if (!BUILDER_API_KEY) {
		return { results: [], count: 0 };
	}

	const requestedLimit = options?.limit ?? BUILDER_PAGE_SIZE;
	const callerOffset = options?.offset;
	const paginate = callerOffset === undefined && requestedLimit > BUILDER_PAGE_SIZE;

	const fetchOnePage = async (
		pageLimit: number,
		offset: number,
	): Promise<BuilderContentEntry<T>[]> => {
		const url = new URL(`${BUILDER_CDN_BASE}/${modelName}`);
		url.searchParams.set("apiKey", BUILDER_API_KEY);
		url.searchParams.set("limit", String(pageLimit));
		url.searchParams.set("includeUnpublished", "false");

		if (offset > 0) {
			url.searchParams.set("offset", String(offset));
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
			return [];
		}

		const json: BuilderContentResponse<T> = await res.json();
		return json.results;
	};

	if (!paginate) {
		const pageLimit = Math.min(requestedLimit, BUILDER_PAGE_SIZE);
		const results = await fetchOnePage(pageLimit, callerOffset ?? 0);
		return { results, count: results.length };
	}

	const collected: BuilderContentEntry<T>[] = [];
	let offset = 0;
	while (collected.length < requestedLimit) {
		const remaining = requestedLimit - collected.length;
		const pageLimit = Math.min(remaining, BUILDER_PAGE_SIZE);
		const page = await fetchOnePage(pageLimit, offset);
		if (page.length === 0) break;
		collected.push(...page);
		if (page.length < pageLimit) break;
		offset += page.length;
	}

	return { results: collected, count: collected.length };
}

/**
 * Fetch entries from a Builder.io data model.
 * Returns the `data` field from each entry.
 */
export async function fetchBuilderContent<T>(
	modelName: string,
	options?: FetchOptions,
): Promise<{ results: T[]; count: number }> {
	const { results: entries } = await fetchBuilderEntries<T>(modelName, options);
	const results = entries.map((entry) => entry.data);
	return { results, count: results.length };
}
