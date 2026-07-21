import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const REVALIDATE_TAGS = ["town-settings", "town-navigation", "builder-content"];

function safeEqual(a: string, b: string) {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
	const secret = process.env.BUILDER_WEBHOOK_SECRET;
	// Fail closed: without a secret this endpoint would let anyone flush every cache tag.
	if (!secret) {
		return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
	}
	const incoming =
		request.headers.get("x-webhook-secret") ?? request.headers.get("authorization") ?? "";
	if (!safeEqual(incoming, secret) && !safeEqual(incoming, `Bearer ${secret}`)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	for (const tag of REVALIDATE_TAGS) {
		revalidateTag(tag);
	}

	return NextResponse.json({ revalidated: true, tags: REVALIDATE_TAGS });
}
