import { Source_Sans_3 as FontSans, Libre_Baskerville as FontSerif } from "next/font/google";

export const fontSerif = FontSerif({
	weight: ["400", "700"],
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-serif",
});

export const fontSans = FontSans({
	weight: ["300", "400", "500", "600", "700"],
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-sans",
});

export type FontCategory =
	| "serif"
	| "sans-serif"
	| "display"
	| "handwriting"
	| "monospace";

export interface GoogleFont {
	family: string;
	category?: FontCategory;
}

export const GOOGLE_FONTS: GoogleFont[] = [
	{ family: "Inter" },
	{ family: "Roboto" },
	{ family: "Open Sans" },
	{ family: "Lato" },
	{ family: "Montserrat" },
	{ family: "Poppins" },
	{ family: "Source Sans Pro" },
	{ family: "Oswald" },
	{ family: "Raleway" },
	{ family: "Nunito" },
	{ family: "Merriweather" },
	{ family: "Playfair Display" },
	{ family: "Ubuntu" },
	{ family: "Work Sans" },
	{ family: "Fira Sans" },
	{ family: "Noto Sans JP" },
	{ family: "Roboto Mono" },
	{ family: "Comic Neue" },
];
