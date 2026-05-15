import type { Where } from "payload";
import type { Config } from "@/payload-types";
import { getPayloadClient } from "@/lib/payload/payload";

type Collections = Config["collections"];
type CollectionKey = keyof Collections;

interface GetCollectionOptions {
	limit?: number;
	page?: number;
	where?: Where;
	sort?: string;
	depth?: number;
}

/**
 * Fetch documents from a Payload CMS collection.
 * Returns an empty array if Payload is disabled or not configured.
 */
export async function getPayloadCollection<T extends CollectionKey>(
	collection: T,
	options: GetCollectionOptions = {},
): Promise<Collections[T][]> {
	const payload = await getPayloadClient();
	if (!payload) return [];

	try {
		const result = await payload.find({
			collection: collection as string,
			limit: options.limit ?? 100,
			page: options.page ?? 1,
			where: options.where,
			sort: options.sort,
			depth: options.depth ?? 1,
		});
		return (result.docs ?? []) as Collections[T][];
	} catch (error) {
		console.warn(`getPayloadCollection(${String(collection)}) failed:`, error);
		return [];
	}
}
