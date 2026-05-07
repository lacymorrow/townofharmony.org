/**
 * Sync businesses from Google Places API for the Harmony, NC area.
 *
 * Usage:
 *   npx tsx scripts/sync-map-businesses.ts
 *   npx tsx scripts/sync-map-businesses.ts --dry-run
 *   npx tsx scripts/sync-map-businesses.ts --output=src/data/town/map-businesses-google.json
 *
 * Env vars (loaded from .env automatically):
 *   GOOGLE_PLACES_API_KEY - Google Places API key (New API)
 */

import { config } from "dotenv";
config();

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
	console.error("Missing GOOGLE_PLACES_API_KEY env var");
	process.exit(1);
}

const HARMONY_CENTER = { latitude: 35.9545, longitude: -80.7725 };
const SEARCH_RADIUS_METERS = 2000;
// Google Places API caps maxResultCount at 20 per page; this limits total across all pages
const MAX_TOTAL_RESULTS = 50;

const GOOGLE_TO_CATEGORY: Record<string, string> = {
	restaurant: "Restaurant & Food",
	cafe: "Restaurant & Food",
	bakery: "Restaurant & Food",
	meal_takeaway: "Restaurant & Food",
	meal_delivery: "Restaurant & Food",
	mexican_restaurant: "Restaurant & Food",
	food: "Restaurant & Food",

	store: "Retail & Shopping",
	shopping_mall: "Retail & Shopping",
	supermarket: "Retail & Shopping",
	grocery_store: "Retail & Shopping",
	grocery_or_supermarket: "Retail & Shopping",
	convenience_store: "Retail & Shopping",
	clothing_store: "Retail & Shopping",
	hardware_store: "Retail & Shopping",
	home_goods_store: "Retail & Shopping",
	pet_store: "Retail & Shopping",
	discount_store: "Retail & Shopping",
	food_store: "Retail & Shopping",
	garden_center: "Retail & Shopping",
	gift_shop: "Retail & Shopping",
	market: "Retail & Shopping",
	toy_store: "Retail & Shopping",
	auto_parts_store: "Retail & Shopping",

	car_repair: "Auto & Transportation",
	car_dealer: "Auto & Transportation",
	car_wash: "Auto & Transportation",

	pharmacy: "Health & Wellness",
	drugstore: "Health & Wellness",
	doctor: "Health & Wellness",
	dentist: "Health & Wellness",
	hospital: "Health & Wellness",
	health: "Health & Wellness",
	spa: "Health & Wellness",
	physiotherapist: "Health & Wellness",

	bank: "Banking & Finance",
	atm: "Banking & Finance",
	finance: "Banking & Finance",
	accounting: "Banking & Finance",
	insurance_agency: "Banking & Finance",

	plumber: "Services & Contractors",
	electrician: "Services & Contractors",
	painter: "Services & Contractors",
	roofing_contractor: "Services & Contractors",
	general_contractor: "Services & Contractors",
	hair_care: "Services & Contractors",
	beauty_salon: "Services & Contractors",
	laundry: "Services & Contractors",

	local_government_office: "Community & Government",
	government_office: "Community & Government",
	library: "Community & Government",
	school: "Community & Government",
	primary_school: "Community & Government",
	post_office: "Community & Government",
	fire_station: "Community & Government",
	police: "Community & Government",
	city_hall: "Community & Government",
	community_center: "Community & Government",

	church: "Churches & Religious",
	place_of_worship: "Churches & Religious",
	mosque: "Churches & Religious",
	synagogue: "Churches & Religious",
	hindu_temple: "Churches & Religious",

	gas_station: "Gas & Fuel",
};

interface GooglePlace {
	id: string;
	displayName?: { text: string };
	formattedAddress?: string;
	nationalPhoneNumber?: string;
	location?: { latitude: number; longitude: number };
	types?: string[];
	primaryType?: string;
	editorialSummary?: { text: string };
	businessStatus?: string;
}

interface SyncedBusiness {
	googlePlaceId: string;
	name: string;
	address: string;
	phone: string;
	category: string;
	lat: number;
	lng: number;
	description: string;
	googleTypes: string[];
	businessStatus: string;
	syncedAt: string;
}

function mapCategory(types: string[]): string {
	for (const type of types) {
		if (GOOGLE_TO_CATEGORY[type]) {
			return GOOGLE_TO_CATEGORY[type];
		}
	}
	return "Other";
}

async function searchNearby(): Promise<GooglePlace[]> {
	const url = "https://places.googleapis.com/v1/places:searchNearby";

	const body = {
		includedTypes: [
			"restaurant",
			"cafe",
			"store",
			"supermarket",
			"gas_station",
			"pharmacy",
			"doctor",
			"bank",
			"atm",
			"church",
			"school",
			"library",
			"post_office",
			"fire_station",
			"local_government_office",
			"car_repair",
			"car_wash",
			"hair_care",
			"beauty_salon",
			"convenience_store",
			"hardware_store",
			"plumber",
			"electrician",
			"roofing_contractor",
		],
		locationRestriction: {
			circle: {
				center: HARMONY_CENTER,
				radius: SEARCH_RADIUS_METERS,
			},
		},
		maxResultCount: 20,
	};

	const fieldMask = [
		"places.id",
		"places.displayName",
		"places.formattedAddress",
		"places.nationalPhoneNumber",
		"places.location",
		"places.types",
		"places.primaryType",
		"places.editorialSummary",
		"places.businessStatus",
	].join(",");

	const apiKey = GOOGLE_PLACES_API_KEY as string;
	const allPlaces: GooglePlace[] = [];
	let pageToken: string | undefined;

	do {
		const requestBody = pageToken ? { ...body, pageToken } : body;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": apiKey,
				"X-Goog-FieldMask": fieldMask,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Google Places API error ${response.status}: ${errorText}`);
		}

		const data = await response.json();
		const places: GooglePlace[] = data.places ?? [];
		allPlaces.push(...places);

		pageToken = allPlaces.length < MAX_TOTAL_RESULTS ? data.nextPageToken : undefined;

		if (pageToken) {
			await new Promise((r) => setTimeout(r, 2000));
		}
	} while (pageToken);

	return allPlaces.slice(0, MAX_TOTAL_RESULTS);
}

function transformPlace(place: GooglePlace): SyncedBusiness | null {
	if (!place.location || !place.displayName?.text) return null;
	if (place.businessStatus === "CLOSED_PERMANENTLY") return null;

	const types = place.types ?? [];

	return {
		googlePlaceId: place.id,
		name: place.displayName.text,
		address: place.formattedAddress ?? "",
		phone: place.nationalPhoneNumber ?? "",
		category: mapCategory(types),
		lat: place.location.latitude,
		lng: place.location.longitude,
		description: place.editorialSummary?.text ?? "",
		googleTypes: types,
		businessStatus: place.businessStatus ?? "OPERATIONAL",
		syncedAt: new Date().toISOString(),
	};
}

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const outputArg = args.find((a) => a.startsWith("--output="))?.split("=")[1];
	const outputPath = resolve(
		process.cwd(),
		outputArg ?? "src/data/town/map-businesses-google.json",
	);

	console.log("Fetching businesses from Google Places API...");
	console.log(`  Center: ${HARMONY_CENTER.latitude}, ${HARMONY_CENTER.longitude}`);
	console.log(`  Radius: ${SEARCH_RADIUS_METERS}m`);

	const places = await searchNearby();
	console.log(`  Found ${places.length} places from Google`);

	const businesses = places.map(transformPlace).filter(Boolean) as SyncedBusiness[];
	console.log(`  ${businesses.length} businesses after filtering`);

	const categoryCounts: Record<string, number> = {};
	for (const b of businesses) {
		categoryCounts[b.category] = (categoryCounts[b.category] ?? 0) + 1;
	}
	console.log("\n  Categories:");
	for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
		console.log(`    ${cat}: ${count}`);
	}

	if (dryRun) {
		console.log("\n  Dry run — not writing file");
		console.log(JSON.stringify(businesses, null, "\t"));
		return;
	}

	const output = {
		syncedAt: new Date().toISOString(),
		source: "google-places-api",
		center: HARMONY_CENTER,
		radiusMeters: SEARCH_RADIUS_METERS,
		count: businesses.length,
		businesses,
	};

	writeFileSync(outputPath, JSON.stringify(output, null, "\t") + "\n");
	console.log(`\n  Written to ${outputPath}`);
}

main().catch((err) => {
	console.error("Sync failed:", err);
	process.exit(1);
});
