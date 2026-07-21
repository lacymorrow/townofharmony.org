import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const REVALIDATE_TAGS = ["town-settings", "town-navigation", "builder-content"];

export async function POST(request: NextRequest) {
	const secret = process.env.BUILDER_WEBHOOK_SECRET;
	if (secret) {
		const incoming = request.headers.get("x-webhook-secret") ?? request.headers.get("authorization");
		if (incoming !== secret && incoming !== `Bearer ${secret}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	for (const tag of REVALIDATE_TAGS) {
		revalidateTag(tag);
	}

	return NextResponse.json({ revalidated: true, tags: REVALIDATE_TAGS });
}
