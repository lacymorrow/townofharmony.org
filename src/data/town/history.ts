import type { TownHistoryArticle } from "./types";
import { mediaUrls } from "./media";

export const historyArticles: TownHistoryArticle[] = [
	// Periods
	{
		id: 1,
		title: "Camp Meeting Grounds Era",
		slug: "camp-meeting-grounds-era",
		type: "period",
		era: "1846-1907",
		description: "The Harmony Hill Camp Meeting and early community formation",
		content:
			"The area that would become the Town of Harmony has its roots in the Harmony Hill Camp Meeting, a two-week revival first held in 1846. This gathering, still held the second weekend every October, drew people from across the region and established the crossroads of Highway 21 N and Highway 901 in north Iredell County as a community gathering place.",
		image: mediaUrls["history-early"],
		highlights: [
			"Harmony Hill Camp Meeting first held in 1846",
			"Two-week revival tradition continues today",
			"Community forms at crossroads of Highway 21 N and Highway 901",
		],
		sortOrder: 0,
	},
	{
		id: 2,
		title: "Harmony Academy & Farm Life School",
		slug: "academy-and-farm-life-school",
		type: "period",
		era: "1908-1927",
		description: "From academy to vocational agricultural high school",
		content:
			"In 1908, Harmony Academy was established, providing education to the growing community. By 1916, it became the Harmony Farm Life School, a vocational agricultural high school. The Smith-Hughes Act brought vocational training programs to the school, strengthening the agricultural education mission that served the rural community.",
		image: mediaUrls["history-founding"],
		highlights: [
			"1908: Harmony Academy established",
			"1916: Became Harmony Farm Life School (vocational agricultural high school)",
			"Smith-Hughes Act brought vocational training",
		],
		sortOrder: 1,
	},
	{
		id: 3,
		title: "Town Incorporation & Growth",
		slug: "incorporation-and-growth",
		type: "period",
		era: "1927-1966",
		description: "Official incorporation and Harmony High School era",
		content:
			"The Town of Harmony was officially incorporated in 1927, located at the crossroads of Highway 21 N and Highway 901 in north Iredell County. In 1928, the Farm Life School became Harmony High School. The town grew around its school, churches, and the enduring tradition of the annual camp meeting.",
		image: mediaUrls["history-growth"],
		highlights: [
			"1927: Town of Harmony officially incorporated",
			"1928: Became Harmony High School",
			"Community grows around school and camp meeting tradition",
		],
		sortOrder: 2,
	},
	{
		id: 4,
		title: "Modern Harmony",
		slug: "modern-era",
		type: "period",
		era: "1966-Present",
		description: "County consolidation and preserving small-town character",
		content:
			"In 1966, county consolidation turned Harmony High School into an elementary school. Today, the Town of Harmony (population 543, 2020 census) maintains its small-town character with a public library, family park, community center, public elementary school, post office, and volunteer fire department. The Harmony Hill Camp Meeting continues every October, connecting modern Harmony to its 1846 roots.",
		image: mediaUrls["history-modern"],
		highlights: [
			"1966: County consolidation — high school becomes elementary school",
			"Population 543 (2020 census)",
			"Town amenities: library, family park, community center, post office, volunteer fire department",
		],
		sortOrder: 3,
	},
	// Landmarks
	{
		id: 5,
		title: "Town Hall",
		slug: "town-hall-landmark",
		type: "landmark",
		year: "1927",
		address: "3389 Harmony Hwy, Harmony, NC 28634",
		description:
			"The seat of town government since Harmony's incorporation, serving as the center of civic life.",
		content:
			"Town Hall has served as the center of government and civic life in Harmony since the town's incorporation in 1927. It continues to house town offices and serve as the meeting place for the Town Council.",
		image: mediaUrls["landmark-town-hall"],
		sortOrder: 0,
	},
	{
		id: 6,
		title: "Community Center",
		slug: "community-center",
		type: "landmark",
		address: "Harmony, NC",
		description:
			"A gathering place for community events, celebrations, and civic activities.",
		content:
			"The Community Center provides a dedicated space for community gatherings, events, and civic activities. It serves as a vital hub for the people of Harmony.",
		image: mediaUrls["landmark-community-center"],
		sortOrder: 1,
	},
	{
		id: 7,
		title: "Harmony Hill Camp Meeting Grounds",
		slug: "camp-meeting-grounds",
		type: "landmark",
		year: "1846",
		address: "On the grounds of present-day Harmony Elementary School",
		description:
			"The historic camp meeting grounds where the community first gathered, with a revival tradition dating back to 1846.",
		content:
			"The Harmony Hill Camp Meeting Grounds are the birthplace of the Harmony community. The two-week revival was first held in 1846 and continues to be held the second weekend every October. The grounds are located on the present-day Harmony Elementary School campus.",
		image: mediaUrls["landmark-camp-grounds"],
		sortOrder: 2,
	},
];
