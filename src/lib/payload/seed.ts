import { getPayloadClient } from "./payload";
import { seedAllDirect } from "./seed-utils";

/**
 * Seed Payload CMS collections (RBAC, Features, FAQs, Testimonials).
 * Used by `bun run db:seed`.
 */
export async function seed() {
	const payload = await getPayloadClient();
	if (!payload) {
		console.warn("Payload not configured — skipping seed.");
		return;
	}
	await seedAllDirect(payload);
}
