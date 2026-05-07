import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const secret = process.env.BUILDER_WEBHOOK_SECRET;
	if (secret) {
		const incoming = request.headers.get("x-webhook-secret") ?? request.headers.get("authorization");
		if (incoming !== secret && incoming !== `Bearer ${secret}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	const body = await request.json().catch(() => null);
	const model = (body as Record<string, unknown> | null)?.modelName ?? (body as Record<string, unknown> | null)?.model;

	if (model === "town-settings" || !model) {
		revalidateTag("town-settings");
	}

	return NextResponse.json({ revalidated: true });
}
