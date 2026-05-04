import type { Route } from "next";
import { siteConfig } from "./site-config";

type ParamValue = string | number | null;
export type RouteParams = Record<string, ParamValue>;

export interface RouteObject {
	path: Route;
	params?: RouteParams;
}

export const createRoute = (path: Route, params: RouteParams = {}): RouteObject => ({
	path,
	params,
});

// Flattened routes structure for better type safety and easier access
export const routes = {
	// Public routes
	home: "/",
	contact: "/contact",
	faq: "/faq",
	pricing: "/pricing",
	blog: "/blog",
	docs: "/",
	features: "/features",
	download: "/download",
	launch: "/launch",
	checkoutSuccess: "/checkout/success",

	// Legal routes
	terms: "/terms-of-service",
	privacy: "/privacy-policy",
	eula: "/eula",
	legal: "/legal",

	// Town routes
	town: {
		agendaMinutes: "/agenda-minutes",
		business: "/business",
		// elections removed — redirects to /our-team
		emergency: "/emergency",
		events: "/events",
		history: "/history",
		map: "/map",
		meetings: "/meetings",
		news: "/news",
		ourTeam: "/our-team",
		pointsOfInterest: "/points-of-interest",
		resources: "/resources",
		sewer: "/sewer",
		sewerPayment: "/pay/sewer",
	},

	// Auth routes
	auth: {
		signIn: "/sign-in",
		signUp: "/sign-up",
		signOut: "/sign-out",
		forgotPassword: "/forgot-password",
		resetPassword: "/reset-password",
		signInPage: "/api/auth/signin",
		signOutPage: "/api/auth/signout",
		error: "/error",
	},

	// Admin routes
	admin: {
		index: "/admin",
		users: "/admin/users",
		github: "/admin/github",
		integrations: "/admin/integrations",
		feedback: "/admin/feedback",
		payments: "/admin/payments",
	},

	settings: {
		index: "/settings",
		account: "/settings/account",
		profile: "/settings/profile",
		appearance: "/settings/appearance",
		security: "/settings/security",
	},

	// App routes (authenticated)
	app: {
		dashboard: "/",
		settings: "/settings",
		billing: "/settings/account",
		apiKeys: "/settings/api-keys",
		deployments: "/deployments",
		projects: "/projects",
		teams: "/teams",
		tools: "/tools",
	},

	// Demo routes (Shipkit feature demos — unused on TOH, stubs kept for build compatibility)
	demo: {
		payloadCms: "/cms",
		builderio: "/builder",
		trpc: "/trpc",
		network: "/network",
	},

	// Examples routes (used by search/demo components)
	examples: {
		dashboard: "/",
		index: "/",
		authentication: "/sign-in",
		forms: "/",
	},

	// CMS routes
	cms: {
		index: "/cms",
	},

	// Pages routes (Pages Router demos — unused on TOH)
	pages: {
		index: "/",
		dynamic: "/",
		markdown: "/",
	},

	// AI routes (Shipkit AI demo stubs — unused on TOH)
	ai: {
		index: "/",
		codeCompletion: "/",
		crossEncoder: "/",
		deepseekWeb: "/",
		florence: "/",
		gemma: "/",
		janusProWebgpu: "/",
		janusWebgpu: "/",
		llama: "/",
		moonshineWeb: "/",
		musicgenWeb: "/",
		phi: "/",
		removeBackground: "/",
		removeBackgroundWeb: "/",
		reportGen: "/",
		semanticImageSearchWeb: "/",
		semanticSearch: "/",
		smollmWeb: "/",
		smolvmWeb: "/",
		spam: "/",
		speecht: "/",
		textToSpeechWebgpu: "/",
		typeAhead: "/",
		videoBackgroundRemoval: "/",
		videoObjectDetection: "/",
		webgpuClip: "/",
		webgpuEmbeddingBenchmark: "/",
		webgpuNomicEmbed: "/",
		whisper: "/",
		whisperTimestamped: "/",
		zeroShotClassification: "/",
	},

	// API routes
	api: {
		docsSearch: "/api/docs/search",
		github: "/api/github",
		payments: "/api/payments",
		projects: "/api/projects",
		teams: "/api/teams",
	},

	// External links
	external: {
		email: `mailto:${siteConfig.creator.email}`,
		github: siteConfig.repo.url,
	},
};

interface Redirect {
	source: Route;
	destination: Route;
	permanent: boolean;
}

/* eslint-disable-next-line @typescript-eslint/require-await */
export const redirects = async (): Promise<Redirect[]> => {
	return [
		...createRedirects(["/join", "/signup", "/sign-up"], routes.auth.signUp),
		...createRedirects(["/login", "/log-in", "/signin", "/sign-in"], routes.auth.signIn),
		...createRedirects(["/logout", "/log-out", "/signout", "/sign-out"], routes.auth.signOut),

		// 301 redirects from legacy townofharmony.org (Wagtail) URLs to new Next.js routes.
		{ source: "/government", destination: "/our-team", permanent: true },
		{ source: "/government/", destination: "/our-team", permanent: true },
		{ source: "/emergency-services", destination: "/emergency", permanent: true },
		{ source: "/emergency-services/", destination: "/emergency", permanent: true },
		{
			source: "/resources/ordinance",
			destination: "/town-ordinance.pdf",
			permanent: true,
		},
		{
			source: "/resources/ordinance/",
			destination: "/town-ordinance.pdf",
			permanent: true,
		},
		// Redirect old /docs/town-ordinance.pdf path (was incorrectly in docs dir)
		{
			source: "/docs/town-ordinance.pdf",
			destination: "/town-ordinance.pdf",
			permanent: true,
		},
		{
			source: "/resources/harmony-community-center-reservation-application-page",
			destination: "/resources/community-center-reservation",
			permanent: true,
		},
		{
			source: "/resources/harmony-community-center-reservation-application-page/",
			destination: "/resources/community-center-reservation",
			permanent: true,
		},
		{
			source: "/resources/tomlinson-moore-family-park-reservation-application",
			destination: "/resources/park-reservation",
			permanent: true,
		},
		{
			source: "/resources/tomlinson-moore-family-park-reservation-application/",
			destination: "/resources/park-reservation",
			permanent: true,
		},
		{ source: "/history/incorporation", destination: "/history", permanent: true },
		{ source: "/history/incorporation/", destination: "/history", permanent: true },
		{ source: "/history/first-school", destination: "/history", permanent: true },
		{ source: "/history/first-school/", destination: "/history", permanent: true },
		{ source: "/news", destination: "/", permanent: false },
		{ source: "/news/", destination: "/", permanent: false },
		// Legacy event slugs → new event slugs (current 2026 occurrences).
		{ source: "/events/farmers-market-may", destination: "/events/farmers-market-may-2026", permanent: true },
		{ source: "/events/farmers-market-may/", destination: "/events/farmers-market-may-2026", permanent: true },
		{ source: "/events/farmers-market-june", destination: "/events/farmers-market-june-2026", permanent: true },
		{ source: "/events/farmers-market-june/", destination: "/events/farmers-market-june-2026", permanent: true },
		{ source: "/events/spring-in-the-park", destination: "/events/spring-in-the-park-2026", permanent: true },
		{ source: "/events/spring-in-the-park/", destination: "/events/spring-in-the-park-2026", permanent: true },
		{ source: "/events/hwy-21-road-market", destination: "/events/hwy-21-road-market-2026", permanent: true },
		{ source: "/events/hwy-21-road-market/", destination: "/events/hwy-21-road-market-2026", permanent: true },
		// Legacy form-only pages (HTTP 500 on legacy) → contact page.
		{ source: "/host-an-event-or-other", destination: "/contact", permanent: true },
		{ source: "/host-an-event-or-other/", destination: "/contact", permanent: true },
		{ source: "/share-history-story", destination: "/contact", permanent: true },
		{ source: "/share-history-story/", destination: "/contact", permanent: true },
		{ source: "/contact-town-of-harmony-form", destination: "/contact", permanent: true },
		{ source: "/contact-town-of-harmony-form/", destination: "/contact", permanent: true },
		{ source: "/election-form", destination: "/contact", permanent: true },
		{ source: "/election-form/", destination: "/contact", permanent: true },
		{ source: "/election-form-access", destination: "/contact", permanent: true },
		{ source: "/election-form-access/", destination: "/contact", permanent: true },
		{ source: "/special-events-application", destination: "/contact", permanent: true },
		{ source: "/special-events-application/", destination: "/contact", permanent: true },
		{
			source: "/harmony-community-center-reservation-application-form",
			destination: "/resources/community-center-reservation",
			permanent: true,
		},
		{
			source: "/harmony-community-center-reservation-application-form/",
			destination: "/resources/community-center-reservation",
			permanent: true,
		},
		{
			source: "/tomlinson-moore-family-park-reservation-application-form",
			destination: "/resources/park-reservation",
			permanent: true,
		},
		{
			source: "/tomlinson-moore-family-park-reservation-application-form/",
			destination: "/resources/park-reservation",
			permanent: true,
		},
		{ source: "/elections", destination: "/our-team", permanent: false },
		{ source: "/elections/", destination: "/our-team", permanent: false },
	];
};

export const createRedirects = (
	sources: Route[],
	destination: Route,
	permanent = false
): Redirect[] => {
	if (!sources.length) return [];

	return sources
		.map((source) => {
			if (source === destination) return null;
			return { source, destination, permanent };
		})
		.filter((redirect): redirect is Redirect => redirect !== null);
};
