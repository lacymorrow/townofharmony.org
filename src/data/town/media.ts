/**
 * Media URL map for town content images.
 * Uses real photos from the Town of Harmony sourced from the legacy Django site.
 * Remaining entries use the town logo as a generic placeholder.
 */

const TOWN_IMG = "/images/town";

export const mediaUrls = {
	// Homepage hero slides
	"hero-welcome": `${TOWN_IMG}/family-park-1.webp`,
	"hero-events": `${TOWN_IMG}/christmas-parade-float.webp`,
	"hero-meetings": `${TOWN_IMG}/town-hall.webp`,
	"hero-explore": `${TOWN_IMG}/harmony-town-view.webp`,

	// News articles
	"news-spring-cleanup": `${TOWN_IMG}/spring-in-the-park.webp`,
	"news-park-improvements": `${TOWN_IMG}/flowers-at-park.webp`,
	"news-farmers-market": `${TOWN_IMG}/farmers-market.webp`,

	// Events
	"event-farmers-market": `${TOWN_IMG}/farmers-market.webp`,
	"event-fall-festival": `${TOWN_IMG}/event-background.webp`,
	"event-christmas-parade": `${TOWN_IMG}/christmas-parade-float.webp`,
	"event-spring-cleanup": `${TOWN_IMG}/spring-in-the-park.webp`,

	// Points of Interest
	"poi-park": `${TOWN_IMG}/family-park-1.webp`,
	"poi-town-hall": `${TOWN_IMG}/town-hall.webp`,
	"poi-camp-grounds": `${TOWN_IMG}/camp-meeting-grounds.webp`,
	"poi-memorial": `${TOWN_IMG}/harmony-town-view.webp`,
	"poi-community-center": `${TOWN_IMG}/community-center.webp`,
	"poi-school": `${TOWN_IMG}/harmony-school.webp`,

	// History
	"history-early": `${TOWN_IMG}/camp-meeting-grounds.webp`,
	"history-founding": `${TOWN_IMG}/harmony-school.webp`,
	"history-growth": `${TOWN_IMG}/town-hall.webp`,
	"history-modern": `${TOWN_IMG}/tomlinson-park.webp`,
	"landmark-camp-grounds": `${TOWN_IMG}/camp-meeting-grounds.webp`,
	"landmark-town-hall": `${TOWN_IMG}/town-hall.webp`,
	"landmark-church": `${TOWN_IMG}/harmony-road.webp`,
	"landmark-community-center": `${TOWN_IMG}/community-center-2.webp`,

	// Emergency & civic
	"emergency-fire-dept": `${TOWN_IMG}/fire-department.webp`,
	"emergency-911": `${TOWN_IMG}/911-building.webp`,

	// Additional landmarks
	"poi-thread-trail": `${TOWN_IMG}/thread-trail.webp`,
	"poi-about-hero": `${TOWN_IMG}/about-hero.webp`,
	"contact-map": `${TOWN_IMG}/contact-map.webp`,

	// Businesses (civic institutions) — no specific photos available
	"biz-general-store": `${TOWN_IMG}/harmony-town-view.webp`,
	"biz-diner": `${TOWN_IMG}/logo.webp`,
	"biz-medical": `${TOWN_IMG}/logo.webp`,
	"biz-hardware": `${TOWN_IMG}/logo.webp`,
	"biz-auto": `${TOWN_IMG}/logo.webp`,
	"biz-thrift": `${TOWN_IMG}/logo.webp`,
} as const;

export type MediaKey = keyof typeof mediaUrls;
