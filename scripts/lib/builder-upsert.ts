/**
 * Shared helpers for Builder.io seed scripts — fetch existing entries,
 * detect post-seed edits, and upsert (create-or-update) without duplicating.
 *
 * Match keys are caller-defined so each script can index by the field that
 * uniquely identifies its content (e.g. `data.url` for pages, `name` for data
 * entries, `data.name` for businesses).
 */

const BUILDER_CDN = "https://cdn.builder.io/api/v3/content";
const BUILDER_WRITE = "https://builder.io/api/v1/write";

/**
 * Difference above which we treat an entry as human-edited rather than
 * freshly seeded. Compared against `data.__seededAt` when present (set by
 * this helper on every write) or `createdDate` as fallback. Builder bumps
 * `lastUpdated` a few ms after each write, so a small window is needed.
 */
export const EDIT_THRESHOLD_MS = 60_000;

/** Field on each seeded entry's data that records the seed timestamp. */
export const SEED_TIMESTAMP_FIELD = "__seededAt";

export interface SeedClient {
	apiKey: string;
	privateKey: string;
}

export interface ExistingEntry {
	id: string;
	name: string;
	data?: Record<string, unknown>;
	createdDate: number;
	lastUpdated: number;
	published?: string;
}

export interface WriteBody {
	name: string;
	data: Record<string, unknown>;
	published?: string;
	query?: unknown[];
}

export type UpsertResult =
	| { kind: "created"; id: string }
	| { kind: "updated"; id: string; wasEdited: boolean }
	| { kind: "skipped-edited"; id: string; lastUpdated: number }
	| { kind: "skipped-only-new"; id: string }
	| { kind: "skipped-duplicates"; ids: string[] };

export interface UpsertOptions {
	overwriteEdited: boolean;
	onlyNew: boolean;
	dryRun: boolean;
}

export function isEdited(e: ExistingEntry): boolean {
	const seedAt = e.data?.[SEED_TIMESTAMP_FIELD];
	const baseline =
		typeof seedAt === "number" && seedAt > 0
			? Math.max(seedAt, e.createdDate)
			: e.createdDate;
	return e.lastUpdated - baseline > EDIT_THRESHOLD_MS;
}

export function formatTimestamp(ms: number): string {
	return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
}

export function parseUpsertFlags(args: string[]): UpsertOptions {
	return {
		overwriteEdited: args.includes("--overwrite-edited"),
		onlyNew: args.includes("--only-new"),
		dryRun: args.includes("--dry-run"),
	};
}

export async function fetchExisting(
	client: SeedClient,
	model: string,
): Promise<ExistingEntry[]> {
	// Builder's CDN caps responses at 100 per request, so paginate via offset
	// until a short page comes back. Without this, large models silently
	// produce duplicates: anything past position 100 looks "missing" and gets
	// re-POSTed instead of updated.
	const PAGE_SIZE = 100;
	const MAX_PAGES = 100; // 10k entries safety bound
	const all: ExistingEntry[] = [];

	for (let page = 0; page < MAX_PAGES; page++) {
		const url = new URL(`${BUILDER_CDN}/${model}`);
		url.searchParams.set("apiKey", client.apiKey);
		url.searchParams.set("limit", String(PAGE_SIZE));
		url.searchParams.set("offset", String(page * PAGE_SIZE));
		url.searchParams.set("includeUnpublished", "true");
		// Bypass Builder's edge cache so we see deletes/updates from this same run.
		url.searchParams.set("cachebust", "true");
		url.searchParams.set("noCache", "true");
		url.searchParams.set("_", `${Date.now()}-${page}`);

		const res = await fetch(url.toString(), { cache: "no-store" });
		if (!res.ok) {
			throw new Error(
				`Failed to fetch existing "${model}" (offset ${page * PAGE_SIZE}): ${res.status} ${await res.text()}`,
			);
		}
		const json = (await res.json()) as { results?: ExistingEntry[] };
		const results = json.results ?? [];
		all.push(...results);
		if (results.length < PAGE_SIZE) break;
	}

	return all;
}

export function indexExistingBy<K>(
	entries: ExistingEntry[],
	keyFn: (e: ExistingEntry) => K | undefined,
): Map<K, ExistingEntry[]> {
	const map = new Map<K, ExistingEntry[]>();
	for (const e of entries) {
		const k = keyFn(e);
		if (k === undefined || k === null || k === "") continue;
		const list = map.get(k);
		if (list) list.push(e);
		else map.set(k, [e]);
	}
	return map;
}

export async function upsert<K>(
	client: SeedClient,
	model: string,
	body: WriteBody,
	matchKey: K,
	existingByKey: Map<K, ExistingEntry[]>,
	opts: UpsertOptions,
): Promise<UpsertResult> {
	const matches = existingByKey.get(matchKey) ?? [];

	if (matches.length === 0) {
		if (opts.dryRun) return { kind: "created", id: "dry-run" };
		const now = Date.now();
		const stampedBody: WriteBody = {
			...body,
			data: { ...body.data, [SEED_TIMESTAMP_FIELD]: now },
		};
		const id = await createEntry(client, model, stampedBody);
		// Register the new entry in the index so subsequent same-run lookups
		// for the same matchKey find it instead of POSTing a duplicate.
		existingByKey.set(matchKey, [
			{
				id,
				name: stampedBody.name,
				data: stampedBody.data,
				createdDate: now,
				lastUpdated: now,
			},
		]);
		return { kind: "created", id };
	}

	if (matches.length > 1) {
		// Builder has multiple entries matching this key — refuse to choose one.
		return { kind: "skipped-duplicates", ids: matches.map((m) => m.id) };
	}

	const existing = matches[0]!;

	if (opts.onlyNew) {
		return { kind: "skipped-only-new", id: existing.id };
	}

	const wasEdited = isEdited(existing);
	if (wasEdited && !opts.overwriteEdited) {
		return {
			kind: "skipped-edited",
			id: existing.id,
			lastUpdated: existing.lastUpdated,
		};
	}

	if (opts.dryRun) return { kind: "updated", id: existing.id, wasEdited };

	const now = Date.now();
	const stampedBody: WriteBody = {
		...body,
		data: { ...body.data, [SEED_TIMESTAMP_FIELD]: now },
	};
	await updateEntry(client, model, existing.id, stampedBody);
	// Mutate the cached entry so isEdited() returns false for any same-run
	// subsequent check on this matchKey.
	existing.data = stampedBody.data;
	existing.lastUpdated = now;
	return { kind: "updated", id: existing.id, wasEdited };
}

async function createEntry(
	client: SeedClient,
	model: string,
	body: WriteBody,
): Promise<string> {
	const res = await fetch(
		`${BUILDER_WRITE}/${model}?apiKey=${client.apiKey}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${client.privateKey}`,
			},
			body: JSON.stringify({ published: "published", ...body }),
		},
	);
	if (!res.ok) {
		throw new Error(`POST ${model} failed: ${res.status} ${await res.text()}`);
	}
	const data = (await res.json()) as { id: string };
	return data.id;
}

async function updateEntry(
	client: SeedClient,
	model: string,
	entryId: string,
	body: WriteBody,
): Promise<void> {
	const res = await fetch(
		`${BUILDER_WRITE}/${model}/${entryId}?apiKey=${client.apiKey}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${client.privateKey}`,
			},
			body: JSON.stringify({ published: "published", ...body }),
		},
	);
	if (!res.ok) {
		throw new Error(
			`PUT ${model}/${entryId} failed: ${res.status} ${await res.text()}`,
		);
	}
}

export interface RunCounters {
	created: number;
	updated: number;
	overwroteEdited: number;
	skippedEdited: number;
	skippedOnlyNew: number;
	skippedDuplicates: number;
	failed: number;
}

export function emptyCounters(): RunCounters {
	return {
		created: 0,
		updated: 0,
		overwroteEdited: 0,
		skippedEdited: 0,
		skippedOnlyNew: 0,
		skippedDuplicates: 0,
		failed: 0,
	};
}

export function tallyResult(c: RunCounters, r: UpsertResult): void {
	switch (r.kind) {
		case "created":
			c.created++;
			break;
		case "updated":
			c.updated++;
			if (r.wasEdited) c.overwroteEdited++;
			break;
		case "skipped-edited":
			c.skippedEdited++;
			break;
		case "skipped-only-new":
			c.skippedOnlyNew++;
			break;
		case "skipped-duplicates":
			c.skippedDuplicates++;
			break;
	}
}

export function formatResult(label: string, r: UpsertResult): string {
	switch (r.kind) {
		case "created":
			return `  [CREATED]  ${label} → ${r.id}`;
		case "updated":
			return r.wasEdited
				? `  [OVERWROTE] ${label} → ${r.id}  (had post-seed edits)`
				: `  [UPDATED]  ${label} → ${r.id}`;
		case "skipped-edited":
			return `  [SKIPPED]  ${label}  (edited ${formatTimestamp(r.lastUpdated)} — re-run with --overwrite-edited to force)`;
		case "skipped-only-new":
			return `  [SKIPPED]  ${label}  (--only-new; already exists ${r.id})`;
		case "skipped-duplicates":
			return `  [AMBIGUOUS] ${label}  (multiple matches in Builder: ${r.ids.join(", ")} — dedupe in Builder first)`;
	}
}

export function printSummary(counters: RunCounters, opts: UpsertOptions): void {
	const parts: string[] = [];
	if (counters.created) parts.push(`${counters.created} created`);
	if (counters.updated) {
		const editedNote = counters.overwroteEdited
			? ` (${counters.overwroteEdited} overwrote edits)`
			: "";
		parts.push(`${counters.updated} updated${editedNote}`);
	}
	if (counters.skippedEdited) parts.push(`${counters.skippedEdited} skipped (edited)`);
	if (counters.skippedOnlyNew) parts.push(`${counters.skippedOnlyNew} skipped (--only-new)`);
	if (counters.skippedDuplicates) parts.push(`${counters.skippedDuplicates} ambiguous`);
	if (counters.failed) parts.push(`${counters.failed} failed`);

	console.log(`\n${opts.dryRun ? "[DRY RUN] " : ""}Summary: ${parts.join(", ") || "no changes"}`);

	if (counters.skippedEdited > 0 && !opts.overwriteEdited) {
		console.log(
			`\nTo overwrite the ${counters.skippedEdited} edited entr${counters.skippedEdited === 1 ? "y" : "ies"} anyway, re-run with --overwrite-edited.`,
		);
	}
	if (counters.skippedDuplicates > 0) {
		console.log(
			`\n${counters.skippedDuplicates} ambiguous match${counters.skippedDuplicates === 1 ? "" : "es"} — dedupe in Builder UI before re-running.`,
		);
	}
}
