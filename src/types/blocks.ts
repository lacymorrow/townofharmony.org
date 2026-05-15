/**
 * Block shapes consumed by the `(cms)` block renderers. These mirror the
 * Payload CMS block schemas; types are intentionally loose so they accept
 * whatever Payload returns at runtime.
 */

interface PayloadMedia {
	url?: string;
}

export interface HeroBlock {
	blockType: "hero";
	heading: string;
	subheading?: string;
	image?: PayloadMedia;
	ctaText?: string;
	ctaLink?: string;
	style?: "default" | "centered" | "split";
}

interface LexicalRoot {
	root?: {
		children?: Array<{
			type: string;
			tag?: string;
			children?: Array<{ text?: string }>;
		}>;
	};
}

export interface ContentBlock {
	blockType: "content";
	content?: LexicalRoot;
	width?: "default" | "wide" | "narrow";
	background?: "none" | "gray" | "accent";
}

export interface Feature {
	id?: string;
	name: string;
	description?: string;
	icon?: React.ComponentType<{ className?: string }>;
}

export interface FeaturesBlock {
	blockType: "features";
	heading?: string;
	features: Feature[];
	layout?: "grid" | "list" | "carousel";
	columns?: "2" | "3" | "4";
}

export interface Testimonial {
	id?: string;
	name: string;
	title?: string;
	content: string;
	image?: PayloadMedia;
}

export interface TestimonialsBlock {
	blockType: "testimonials";
	heading?: string;
	testimonials: Testimonial[];
	layout?: "grid" | "slider" | "single";
	background?: "none" | "light" | "dark";
}

export type PageBlock =
	| HeroBlock
	| ContentBlock
	| FeaturesBlock
	| TestimonialsBlock;
