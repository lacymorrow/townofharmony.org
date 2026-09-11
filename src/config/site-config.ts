import type { Metadata } from "next";
import type { Manifest } from "next/dist/lib/metadata/types/manifest-types";

// import { routes } from "@/config/routes"; // Import if needed for startUrl

/**
 * Site Configuration
 *
 * Central configuration for site-wide settings, branding, and metadata.
 * Used throughout the application for consistent branding and functionality.
 */

interface ManifestConfig {
	startUrl: string;
	display: Manifest["display"];
	displayOverride?: Manifest["display_override"];
	orientation: Manifest["orientation"];
	categories: Manifest["categories"];
	dir: Manifest["dir"];
	lang: Manifest["lang"];
	preferRelatedApplications: Manifest["prefer_related_applications"];
	scope: Manifest["scope"];
	launchHandler?: Manifest["launch_handler"];
	icons: {
		favicon: string;
		appIcon192: string;
		appIcon512: string;
	};
	relatedApplications?: Manifest["related_applications"];
}

interface PayloadConfig {
	adminTitleSuffix: string;
	adminIconPath: string;
	adminLogoPath: string;
	dbSchemaName: string;
	emailFromName: string;
}

interface SiteConfig {
	// Core site information
	name: string;
	title: string;
	url: string;
	ogImage: string;
	description: string;
	tagline: string;
	// UI behavior settings
	behavior: {
		pageTransitions: boolean;
	};

	// Branding information
	branding: {
		projectName: string;
		projectSlug: string;
		productNames: {
			// TODO: Remove these once we have a proper product name
			bones: string;
			brains: string;
			main: string;
		};
		domain: string;
		protocol: string;
		githubOrg: string;
		githubRepo: string;
		vercelProjectName: string;
		databaseName: string;
	};

	// External links
	links: {
		twitter: string;
		twitter_follow: string;
		x: string;
		x_follow: string;
		github: string;
	};

	// Repository information
	repo: {
		owner: string;
		name: string;
		url: string;
		format: {
			clone: () => string;
			ssh: () => string;
		};
	};

	// Email addresses and formatting
	email: {
		support: string;
		team: string;
		noreply: string;
		domain: string;
		legal: string;
		privacy: string;
		format: (type: Exclude<keyof SiteConfig["email"], "format">) => string;
	};

	// Creator information
	creator: {
		name: string;
		email: string;
		url: string;
		twitter: string;
		twitter_handle: string;
		domain: string;
		fullName: string;
		role: string;
		avatar: string;
		location: string;
		bio: string;
	};

	// E-commerce store configuration
	store: {
		id: string;
		products: {
			[key: string]: string;
		};
	};

	// SEO and metadata
	metadata: {
		keywords: string[];
		themeColor: {
			light: string;
			dark: string;
		};
		locale: string;
		generator: string;
		referrer: Metadata["referrer"];
		category: string;
		classification: string;
		openGraph: {
			imageWidth: number;
			imageHeight: number;
		};
		twitter: {
			card: "summary" | "summary_large_image" | "app" | "player";
		};
		robots: Metadata["robots"];
		formatDetection: Metadata["formatDetection"];
		alternates: Metadata["alternates"];
		appleWebApp: Metadata["appleWebApp"];
		appLinks: Metadata["appLinks"];
		assetsPath: string;
		bookmarksPath: string;
		blogPath: string;
	};

	// Application settings
	app: {
		apiKeyPrefix: string;
	};

	// PWA Manifest settings
	manifest: ManifestConfig;

	// Payload CMS settings
	payload: PayloadConfig;
}

// Use 'let' to allow modification after definition
export const siteConfig: SiteConfig = {
	behavior: {
		pageTransitions: true,
	},

	name: "Town of Harmony",
	title: "Town of Harmony",
	tagline: "Your Community, Your Home.",
	url: "https://www.townofharmony.org",
	ogImage: "https://www.townofharmony.org/app/og-image.png",
	description:
		"Official website of the Town of Harmony, NC. Explore community events, government services, town meetings, and local resources in Harmony, North Carolina.",

	branding: {
		projectName: "Town of Harmony",
		projectSlug: "toh",
		productNames: {
			bones: "Bones",
			brains: "Brains",
			main: "Town of Harmony",
		},
		domain: "townofharmony.org",
		protocol: "web+toh",
		githubOrg: "lacymorrow",
		githubRepo: "toh-new",
		vercelProjectName: "townofharmony-org",
		databaseName: "toh",
	},

	links: {
		twitter: "",
		twitter_follow: "",
		x: "",
		x_follow: "",
		github: "",
	},

	repo: {
		owner: "",
		name: "",
		url: "",
		format: {
			// Placeholder format functions - assigned below
			clone: () => "",
			ssh: () => "",
		},
	},

	email: {
		support: "admin@townofharmony.org",
		team: "admin@townofharmony.org",
		noreply: "noreply@townofharmony.org",
		domain: "townofharmony.org",
		legal: "admin@townofharmony.org",
		privacy: "admin@townofharmony.org",
		// Placeholder format function - assigned below
		format: (type) => "",
	},

	creator: {
		name: "Town of Harmony",
		email: "admin@townofharmony.org",
		url: "https://townofharmony.org",
		twitter: "",
		twitter_handle: "",
		domain: "townofharmony.org",
		fullName: "Town of Harmony",
		role: "Municipal Government",
		avatar: "",
		location: "Harmony, NC",
		bio: "Official website of the Town of Harmony, North Carolina.",
	},

	store: {
		id: "toh",
		products: {
			// LemonSqueezy Checkout URLs use Variant IDs (not Product IDs)
			// Format: variant UUID from LemonSqueezy dashboard
			shipkit: "411883",
			// Examples:
			bones: "411883",
			brains: "411883",
		},
	},

	metadata: {
		keywords: [
			"Town of Harmony",
			"Harmony NC",
			"Harmony North Carolina",
			"Harmony community center",
			"local government",
			"community events",
			"sewer services",
			"town meetings",
			"Iredell County",
		],
		themeColor: {
			light: "white",
			dark: "black",
		},
		locale: "en-US",
		generator: "Next.js", // Use Next.js as generator
		referrer: "origin-when-cross-origin",
		category: "government",
		classification: "Government",
		openGraph: {
			imageWidth: 1200,
			imageHeight: 630,
		},
		twitter: {
			card: "summary_large_image",
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		alternates: {},
		appleWebApp: {
			capable: true,
			statusBarStyle: "default",
			startupImage: [
				{
					url: "/apple-touch-icon.png",
					media: "(device-width: 768px) and (device-height: 1024px)",
				},
			],
		},
		appLinks: {},
		// This site has no /assets index or /blog — empty paths keep the
		// rel="assets"/rel="archives" head links (and their soft-404 targets)
		// out of every page (LAC-3516).
		assetsPath: "",
		bookmarksPath: "/",
		blogPath: "",
	},

	manifest: {
		startUrl: "/", // Use literal for now, update below if needed
		display: "standalone",
		displayOverride: ["window-controls-overlay"],
		orientation: "portrait-primary",
		categories: ["government", "community", "local"],
		dir: "ltr",
		lang: "en-US",
		preferRelatedApplications: false,
		scope: "/",
		launchHandler: { client_mode: ["navigate-existing", "auto"] },
		icons: {
			favicon: "/favicon.ico",
			appIcon192: "/app/web-app-manifest-192x192.png",
			appIcon512: "/app/web-app-manifest-512x512.png",
		},
		relatedApplications: [],
	},

	payload: {
		adminTitleSuffix: " CMS", // Updated below
		adminIconPath: "./lib/payload/components/payload-icon",
		adminLogoPath: "./lib/payload/components/payload-logo",
		dbSchemaName: "payload",
		emailFromName: "Payload CMS",
	},

	app: {
		apiKeyPrefix: "sk",
	},
};

// Assign dynamic values AFTER the main object is defined
siteConfig.repo.format = {
	clone: () => `https://github.com/${siteConfig.repo.owner}/${siteConfig.repo.name}.git`,
	ssh: () => `git@github.com:${siteConfig.repo.owner}/${siteConfig.repo.name}.git`,
};

siteConfig.email.format = (type: Exclude<keyof SiteConfig["email"], "format">) =>
	siteConfig.email[type];

siteConfig.payload.adminTitleSuffix = ` - ${siteConfig.title} CMS`;

// siteConfig.manifest.startUrl = routes.home; // Uncomment and import routes if needed

// Make sure alternates exists before assigning canonical
if (!siteConfig.metadata.alternates) {
	siteConfig.metadata.alternates = {};
}
siteConfig.metadata.alternates.canonical = siteConfig.url;

// Check appleWebApp is an object before assigning title
if (siteConfig.metadata.appleWebApp && typeof siteConfig.metadata.appleWebApp === "object") {
	siteConfig.metadata.appleWebApp.title = siteConfig.title;
}

// Ensure appLinks and appLinks.web are objects before assigning url
if (!siteConfig.metadata.appLinks) {
	siteConfig.metadata.appLinks = {};
}
if (!siteConfig.metadata.appLinks.web) {
	siteConfig.metadata.appLinks.web = { url: "", should_fallback: false }; // Initialize web if needed
}
// Check type again after potential initialization
if (
	siteConfig.metadata.appLinks?.web &&
	typeof siteConfig.metadata.appLinks.web === "object" &&
	!Array.isArray(siteConfig.metadata.appLinks.web) // Ensure it's not an array
) {
	siteConfig.metadata.appLinks.web.url = siteConfig.url;
}

// Update paths to be absolute URLs based on siteConfig.url; empty paths stay
// empty so pages that don't exist are never advertised (LAC-3516).
siteConfig.metadata.assetsPath = siteConfig.metadata.assetsPath
	? `${siteConfig.url}${siteConfig.metadata.assetsPath}`
	: "";
siteConfig.metadata.bookmarksPath = siteConfig.metadata.bookmarksPath
	? `${siteConfig.url}${siteConfig.metadata.bookmarksPath}`
	: "";
siteConfig.metadata.blogPath = siteConfig.metadata.blogPath
	? `${siteConfig.url}${siteConfig.metadata.blogPath}`
	: "";

// Freeze the object to prevent accidental modifications later (optional)
// Object.freeze(siteConfig);
