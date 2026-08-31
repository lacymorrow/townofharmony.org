/**
 * Regression coverage for LAC-3555: Builder's Content API caps a single
 * request at 100 results even when the caller asks for more. The shared
 * fetcher has to page under the hood; otherwise callers that ask for `all`
 * (limit=1000) silently only ever see the first 100 entries.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_BUILDER_API_KEY", "test-builder-key");

import { fetchBuilderEntries } from "@/lib/builder-content-fetch";

const fetchMock = vi.fn();

const makePage = (count: number) => ({
	results: Array.from({ length: count }, (_, i) => ({
		id: `entry-${i}`,
		name: `Entry ${i}`,
		data: { title: `Entry ${i}` },
		published: "published",
		createdDate: 0,
		lastUpdated: 0,
	})),
});

const respondWith = (payload: unknown) =>
	new Response(JSON.stringify(payload), { status: 200 });

beforeEach(() => {
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe("fetchBuilderEntries pagination", () => {
	it("pages with offset when limit exceeds Builder's per-request cap of 100", async () => {
		fetchMock
			.mockResolvedValueOnce(respondWith(makePage(100)))
			.mockResolvedValueOnce(respondWith(makePage(70)));

		const { results, count } = await fetchBuilderEntries("town-meeting", {
			limit: 1000,
		});

		expect(count).toBe(170);
		expect(results).toHaveLength(170);
		expect(fetchMock).toHaveBeenCalledTimes(2);

		const firstUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
		expect(firstUrl.searchParams.get("limit")).toBe("100");
		expect(firstUrl.searchParams.get("offset")).toBeNull();

		const secondUrl = new URL(fetchMock.mock.calls[1]?.[0] as string);
		expect(secondUrl.searchParams.get("limit")).toBe("100");
		expect(secondUrl.searchParams.get("offset")).toBe("100");
	});

	it("stops paging once a page returns fewer than the page size", async () => {
		fetchMock.mockResolvedValueOnce(respondWith(makePage(42)));

		const { results } = await fetchBuilderEntries("town-meeting", {
			limit: 1000,
		});

		expect(results).toHaveLength(42);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("respects the caller's limit when smaller than the per-request cap", async () => {
		fetchMock.mockResolvedValueOnce(respondWith(makePage(10)));

		const { results } = await fetchBuilderEntries("town-meeting", { limit: 10 });

		expect(results).toHaveLength(10);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const url = new URL(fetchMock.mock.calls[0]?.[0] as string);
		expect(url.searchParams.get("limit")).toBe("10");
	});

	it("does not paginate when the caller supplies its own offset", async () => {
		fetchMock.mockResolvedValueOnce(respondWith(makePage(100)));

		const { results } = await fetchBuilderEntries("town-meeting", {
			limit: 500,
			offset: 100,
		});

		expect(results).toHaveLength(100);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const url = new URL(fetchMock.mock.calls[0]?.[0] as string);
		expect(url.searchParams.get("offset")).toBe("100");
	});

	it("preserves sort dot-notation params across paged requests", async () => {
		fetchMock
			.mockResolvedValueOnce(respondWith(makePage(100)))
			.mockResolvedValueOnce(respondWith(makePage(5)));

		await fetchBuilderEntries("town-meeting", {
			limit: 1000,
			sort: { meetingDate: -1 },
		});

		expect(fetchMock).toHaveBeenCalledTimes(2);
		for (const call of fetchMock.mock.calls) {
			const url = new URL(call[0] as string);
			expect(url.searchParams.get("sort.meetingDate")).toBe("-1");
		}
	});
});
