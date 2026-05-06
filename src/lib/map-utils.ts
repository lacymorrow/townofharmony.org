export type BusinessCategory =
	| "Restaurant & Food"
	| "Retail & Shopping"
	| "Auto & Transportation"
	| "Health & Wellness"
	| "Banking & Finance"
	| "Services & Contractors"
	| "Community & Government"
	| "Churches & Religious"
	| "Gas & Fuel"
	| "Other";

export interface MapBusiness {
	id: string;
	name: string;
	address: string;
	phone: string;
	category: BusinessCategory;
	lat: number;
	lng: number;
	description?: string;
	website?: string;
}

export const CATEGORY_CONFIG: Record<BusinessCategory, { color: string; icon: string }> = {
	"Restaurant & Food": { color: "#B85C38", icon: "utensils" },
	"Retail & Shopping": { color: "#2E86AB", icon: "shopping-bag" },
	"Auto & Transportation": { color: "#6B7280", icon: "car" },
	"Health & Wellness": { color: "#5B7553", icon: "heart-pulse" },
	"Banking & Finance": { color: "#7C6DAF", icon: "landmark" },
	"Services & Contractors": { color: "#C9B57E", icon: "wrench" },
	"Community & Government": { color: "#3D5038", icon: "building-2" },
	"Churches & Religious": { color: "#8B6DAF", icon: "church" },
	"Gas & Fuel": { color: "#8B3A3A", icon: "fuel" },
	Other: { color: "#78716C", icon: "map-pin" },
};

export const ALL_CATEGORIES: BusinessCategory[] = Object.keys(CATEGORY_CONFIG) as BusinessCategory[];

export const HARMONY_CENTER: [number, number] = [35.9545, -80.7725];
export const DEFAULT_ZOOM = 14;

export const getCategoryColor = (category: BusinessCategory): string => {
	return CATEGORY_CONFIG[category]?.color ?? "#78716C";
};

export const getDirectionsUrl = (address: string): string => {
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
};
