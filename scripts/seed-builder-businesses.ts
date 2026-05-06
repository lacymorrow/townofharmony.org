/**
 * Seed Builder.io "business" data model with the 29 Harmony businesses.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-builder-businesses.ts
 *
 * Steps:
 *   1. Creates (or verifies) the "business" data model
 *   2. Seeds each business from src/data/town/map-businesses.ts
 *
 * Requires BUILDER_PRIVATE_KEY and NEXT_PUBLIC_BUILDER_API_KEY in .env.
 */

import { config } from "dotenv";
config();

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (!BUILDER_PRIVATE_KEY) {
	console.error("Missing BUILDER_PRIVATE_KEY env var");
	process.exit(1);
}

if (!BUILDER_API_KEY) {
	console.error("Missing NEXT_PUBLIC_BUILDER_API_KEY env var");
	process.exit(1);
}

interface MapBusiness {
	id: string;
	name: string;
	address: string;
	phone: string;
	category: string;
	lat: number;
	lng: number;
	description?: string;
}

const businesses: MapBusiness[] = [
	{ id: "b01", name: "Sharpe's Catering & Homemade Meals", address: "107 Grose St, Harmony, NC 28634", phone: "(704) 546-5700", category: "Restaurant & Food", lat: 35.9600098, lng: -80.7778713, description: "Homemade Southern meals, catering, and daily specials" },
	{ id: "b02", name: "Scotty's Hamburgers", address: "3384 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2044", category: "Restaurant & Food", lat: 35.958966, lng: -80.7713287, description: "Classic burgers and milkshakes — a local favorite since the 1970s" },
	{ id: "b03", name: "Dollar General", address: "3349 Harmony Hwy, Harmony, NC 28634", phone: "(336) 422-0610", category: "Retail & Shopping", lat: 35.9566902, lng: -80.7723721, description: "Discount retail and everyday essentials" },
	{ id: "b04", name: "Family Dollar", address: "3338 Harmony Hwy, Harmony, NC 28634", phone: "(704) 253-4278", category: "Retail & Shopping", lat: 35.956191, lng: -80.771063, description: "Budget-friendly household goods and more" },
	{ id: "b05", name: "Harmony Galaxy", address: "3235 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2633", category: "Retail & Shopping", lat: 35.9503325, lng: -80.7734661, description: "Full-service grocery store serving the Harmony community" },
	{ id: "b06", name: "Tienda La Despensa", address: "119 Grose St, Harmony, NC 28634", phone: "(980) 379-0082", category: "Retail & Shopping", lat: 35.9600333, lng: -80.7771432, description: "Hispanic grocery and supermarket" },
	{ id: "b07", name: "Lowry Livestock Feeds Inc.", address: "3300 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2410", category: "Retail & Shopping", lat: 35.9540787, lng: -80.7722204, description: "Animal feed, livestock supplies, and farm goods" },
	{ id: "b08", name: "LJ Place", address: "248 E Memorial Hwy, Harmony, NC 28634", phone: "(704) 546-2825", category: "Retail & Shopping", lat: 35.9512976, lng: -80.7626369, description: "Fishing supplies and outdoor goods" },
	{ id: "b09", name: "NAPA Auto Parts", address: "105 W Memorial Hwy, Harmony, NC 28634", phone: "(704) 546-2645", category: "Auto & Transportation", lat: 35.9553638, lng: -80.7726091, description: "Auto parts, accessories, and supplies" },
	{ id: "b10", name: "Eg Enterprise", address: "110 E Memorial Hwy, Harmony, NC 28634", phone: "(704) 546-3194", category: "Auto & Transportation", lat: 35.9549604, lng: -80.7714362, description: "Auto repair services" },
	{ id: "b11", name: "Harmony Car Wash", address: "148 E Memorial Hwy, Harmony, NC 28634", phone: "", category: "Auto & Transportation", lat: 35.9537984, lng: -80.7690682, description: "Self-service car wash facility" },
	{ id: "b12", name: "Banner Drug of Harmony", address: "111 W Memorial Hwy, Harmony, NC 28634", phone: "(704) 546-5885", category: "Health & Wellness", lat: 35.9554988, lng: -80.7728225, description: "Community pharmacy and health products" },
	{ id: "b13", name: "Harmony Medical Care", address: "3210 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-7587", category: "Health & Wellness", lat: 35.9489164, lng: -80.7722971, description: "Family medicine and primary care services" },
	{ id: "b14", name: "Absolute Harmony Massage", address: "3258 Harmony Hwy, Harmony, NC 28634", phone: "(704) 883-2524", category: "Health & Wellness", lat: 35.9517533, lng: -80.7724511, description: "Massage therapy and wellness services" },
	{ id: "b15", name: "Rosewood Assisted Living", address: "3134 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2671", category: "Health & Wellness", lat: 35.9445326, lng: -80.7737499, description: "Senior assisted living and nursing care" },
	{ id: "b16", name: "Diamond Shamrock", address: "3241 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2489", category: "Gas & Fuel", lat: 35.9507188, lng: -80.7730926, description: "Gas station with convenience store" },
	{ id: "b17", name: "Bud's Oil Co", address: "3305 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2542", category: "Gas & Fuel", lat: 35.9543859, lng: -80.7726857, description: "Fuel supply and heating oil delivery" },
	{ id: "b18", name: "Poole's Barber Shop", address: "3069 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-3053", category: "Services & Contractors", lat: 35.9412908, lng: -80.7763573, description: "Traditional barbershop services" },
	{ id: "b19", name: "Harmony Fire Department", address: "16 E Memorial Hwy, Harmony, NC 28634", phone: "(704) 546-2300", category: "Community & Government", lat: 35.954767, lng: -80.7711117, description: "Volunteer fire and emergency services" },
	{ id: "b20", name: "United States Post Office", address: "3348 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-2631", category: "Community & Government", lat: 35.956868, lng: -80.7714026, description: "USPS postal services and PO boxes" },
	{ id: "b21", name: "Harmony Branch Library", address: "3393 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-7086", category: "Community & Government", lat: 35.9592972, lng: -80.7721155, description: "Branch of the Iredell County Public Library system" },
	{ id: "b22", name: "Harmony Elementary School", address: "139 Harmony School Rd, Harmony, NC 28634", phone: "(704) 546-2643", category: "Community & Government", lat: 35.9615873, lng: -80.7745489, description: "Iredell-Statesville Schools elementary campus" },
	{ id: "b23", name: "Harmony Community Center", address: "187 Highland Point Ave, Harmony, NC 28634", phone: "(704) 546-2339", category: "Community & Government", lat: 35.9600106, lng: -80.7665864, description: "Community events, meetings, and recreation" },
	{ id: "b24", name: "Harmony Senior Dining Site", address: "136 W Memorial Hwy, Harmony, NC 28634", phone: "(704) 546-7006", category: "Community & Government", lat: 35.9567996, lng: -80.7740664, description: "Senior nutrition and meal programs" },
	{ id: "b25", name: "American Legion Hall", address: "3085 Harmony Hwy, Harmony, NC 28634", phone: "", category: "Community & Government", lat: 35.9422548, lng: -80.776495, description: "Veterans social hall and community events" },
	{ id: "b26", name: "Cash Points ATM", address: "3229 Harmony Hwy, Harmony, NC 28634", phone: "", category: "Banking & Finance", lat: 35.9500385, lng: -80.7729346, description: "ATM cash point near Harmony Galaxy grocery" },
	{ id: "b27", name: "Harmony Baptist Church", address: "135 Little Wilkesboro Rd, Harmony, NC 28634", phone: "(704) 546-7100", category: "Churches & Religious", lat: 35.9627469, lng: -80.7727604, description: "Baptist worship and community outreach" },
	{ id: "b28", name: "Northside Baptist Church", address: "3295 Harmony Hwy, Harmony, NC 28634", phone: "(704) 546-5026", category: "Churches & Religious", lat: 35.9538877, lng: -80.7731166, description: "Baptist congregation with community programs" },
	{ id: "b29", name: "Mount Nebo Church", address: "Harmony, NC 28634", phone: "", category: "Churches & Religious", lat: 35.9779127, lng: -80.7947909, description: "Historic Christian church" },
];

const MODEL_FIELDS = [
	{ name: "name", type: "text", required: true, helperText: "Business name" },
	{ name: "address", type: "text", required: true, helperText: "Street address" },
	{ name: "phone", type: "text", helperText: "Phone number" },
	{
		name: "category",
		type: "text",
		required: true,
		enum: [
			"Restaurant & Food",
			"Retail & Shopping",
			"Auto & Transportation",
			"Health & Wellness",
			"Banking & Finance",
			"Services & Contractors",
			"Community & Government",
			"Churches & Religious",
			"Gas & Fuel",
			"Other",
		],
		helperText: "Business category",
	},
	{ name: "lat", type: "number", required: true, helperText: "Latitude" },
	{ name: "lng", type: "number", required: true, helperText: "Longitude" },
	{ name: "description", type: "longText", helperText: "Short description" },
	{ name: "isOverride", type: "boolean", defaultValue: false, helperText: "Manual override (won't be replaced by Google sync)" },
	{ name: "googlePlaceId", type: "text", helperText: "Google Places ID (merge key for auto-sync)" },
];

async function ensureModel() {
	const res = await fetch("https://builder.io/api/v1/models", {
		headers: { Authorization: `Bearer ${BUILDER_PRIVATE_KEY}` },
	});

	if (!res.ok) {
		throw new Error(`Failed to list models: ${res.status} ${await res.text()}`);
	}

	const models = await res.json();
	const existing = models.find(
		(m: { name: string }) => m.name === "business",
	);

	if (existing) {
		console.log(`Model "business" already exists (${existing.id})`);
		return existing;
	}

	console.log('Creating "business" data model...');
	const createRes = await fetch("https://builder.io/api/v1/models", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
		},
		body: JSON.stringify({
			name: "business",
			kind: "data",
			fields: MODEL_FIELDS,
		}),
	});

	if (!createRes.ok) {
		throw new Error(
			`Failed to create model: ${createRes.status} ${await createRes.text()}`,
		);
	}

	const created = await createRes.json();
	console.log(`Created model "business" (${created.id})`);
	return created;
}

async function seedBusiness(biz: MapBusiness) {
	const body = {
		name: biz.name,
		data: {
			name: biz.name,
			address: biz.address,
			phone: biz.phone,
			category: biz.category,
			lat: biz.lat,
			lng: biz.lng,
			description: biz.description ?? "",
			isOverride: false,
			googlePlaceId: "",
		},
		published: "published" as const,
	};

	const res = await fetch(
		`https://builder.io/api/v1/write/business?apiKey=${BUILDER_API_KEY}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
			},
			body: JSON.stringify(body),
		},
	);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to seed "${biz.name}": ${res.status} ${text}`);
	}

	return res.json();
}

async function main() {
	await ensureModel();

	console.log(`\nSeeding ${businesses.length} businesses...\n`);

	let success = 0;
	let failed = 0;

	for (const biz of businesses) {
		try {
			const result = await seedBusiness(biz);
			console.log(`  [OK] ${biz.name} → ${result.id}`);
			success++;
		} catch (err) {
			console.error(
				`  [FAIL] ${biz.name}: ${err instanceof Error ? err.message : err}`,
			);
			failed++;
		}
	}

	console.log(`\nDone: ${success} seeded, ${failed} failed.`);
	if (failed > 0) process.exit(1);
}

main();
