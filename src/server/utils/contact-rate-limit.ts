import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { ErrorService } from "@/server/services/error-service";
import { rateLimitService } from "@/server/services/rate-limit-service";
import { rateLimits } from "@/config/rate-limits";

const WINDOW_MS = rateLimits.contactForm.duration * 1000;
const MAX_REQUESTS = rateLimits.contactForm.requests;

// In-memory fallback when Redis is not available (best-effort per instance)
const inMemoryStore = new Map<string, { count: number; windowStart: number }>();

function inMemoryCheck(ip: string): boolean {
	const now = Date.now();
	const entry = inMemoryStore.get(ip);

	if (!entry || now - entry.windowStart > WINDOW_MS) {
		inMemoryStore.set(ip, { count: 1, windowStart: now });
		return true;
	}

	if (entry.count >= MAX_REQUESTS) {
		return false;
	}

	entry.count++;
	return true;
}

export async function getClientIp(): Promise<string> {
	const headersList = await headers();
	const forwarded = headersList.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	return headersList.get("x-real-ip") ?? "unknown";
}

export async function checkContactFormRateLimit(
	ip: string,
	action: string,
): Promise<{ allowed: boolean; error?: string }> {
	try {
		await rateLimitService.checkLimit(ip, action, rateLimits.contactForm);
		return { allowed: true };
	} catch (err: unknown) {
		if (ErrorService.isAppError(err) && err.code === "RATE_LIMITED") {
			logger.warn("Contact form rate limited (Redis)", { ip, action });
			return {
				allowed: false,
				error: "You've submitted too many messages. Please try again in an hour.",
			};
		}
		// Redis unavailable — fall back to in-memory check
		if (!inMemoryCheck(ip)) {
			logger.warn("Contact form rate limited (in-memory fallback)", { ip, action });
			return {
				allowed: false,
				error: "You've submitted too many messages. Please try again in an hour.",
			};
		}
		return { allowed: true };
	}
}

const TIMING_MIN_MS = 5_000;

export function validateSubmissionTiming(loadedAtStr: string | null | undefined): boolean {
	if (!loadedAtStr) return true;
	const loadedAt = parseInt(loadedAtStr, 10);
	if (Number.isNaN(loadedAt)) return true;
	return Date.now() - loadedAt >= TIMING_MIN_MS;
}
