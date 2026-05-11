import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { PREVIEW_COOKIE, FLAGS, type FeatureFlagName } from "@/lib/preview-flags";

// GET /api/feature-preview?feature_flag_map=1&feature_flag_sewer=1
// GET /api/feature-preview?clear=1
// When PREVIEW_SECRET is set, include ?token=SECRET to authenticate.
// Redirects to ?redirect= path (default: /) after setting/clearing the cookie.
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	// Auth: only enforce when PREVIEW_SECRET is configured
	if (env.PREVIEW_SECRET && searchParams.get("token") !== env.PREVIEW_SECRET) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const store = await cookies();
	const redirectTo = searchParams.get("redirect") ?? "/";

	if (searchParams.get("clear") === "1") {
		store.delete(PREVIEW_COOKIE);
		return NextResponse.redirect(new URL(redirectTo, request.url));
	}

	const overrides: Partial<Record<FeatureFlagName, boolean>> = {};
	for (const name of Object.keys(FLAGS) as FeatureFlagName[]) {
		const val = searchParams.get(`feature_flag_${name}`);
		if (val === "1" || val === "true") overrides[name] = true;
		if (val === "0" || val === "false") overrides[name] = false;
	}

	store.set(PREVIEW_COOKIE, JSON.stringify(overrides), {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 8, // 8 hours
	});

	return NextResponse.redirect(new URL(redirectTo, request.url));
}
