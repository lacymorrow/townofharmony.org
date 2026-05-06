import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json().catch(() => null);
	const model = (body as Record<string, unknown> | null)?.modelName ?? (body as Record<string, unknown> | null)?.model;

	if (model === "town-settings" || !model) {
		revalidateTag("town-settings");
	}

	return NextResponse.json({ revalidated: true });
}
