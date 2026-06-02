/**
 * Build a searchable text index of all public documents.
 *
 * Walks public/docs/, extracts plain text from DOCX (mammoth) and PDF (unpdf),
 * and writes src/data/town/document-index.json. The search component lazy-loads
 * this file on first open so document content shows up in results.
 *
 * Usage:
 *   bun run scripts/build-document-index.ts
 */

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

import { meetings } from "../src/data/town/meetings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "public", "docs");
const OUT_PATH = path.join(ROOT, "public", "data", "document-index.json");

interface DocumentEntry {
	id: string;
	title: string;
	href: string;
	type: "minutes" | "ordinance" | "other";
	text: string;
}

const meetingByPath = new Map(meetings.filter((m) => m.minutesUrl).map((m) => [m.minutesUrl as string, m]));

const collapseWhitespace = (text: string): string => text.replace(/\s+/g, " ").trim();

const extractDocx = async (absPath: string): Promise<string> => {
	const buffer = await readFile(absPath);
	const result = await mammoth.extractRawText({ buffer });
	return collapseWhitespace(result.value);
};

const extractPdf = async (absPath: string): Promise<string> => {
	const buffer = await readFile(absPath);
	const pdf = await getDocumentProxy(new Uint8Array(buffer));
	const { text } = await extractText(pdf, { mergePages: true });
	return collapseWhitespace(Array.isArray(text) ? text.join(" ") : text);
};

const humanizeFilename = (filename: string): string =>
	filename
		.replace(/\.(docx|pdf)$/i, "")
		.replace(/_/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const walk = async (dir: string): Promise<string[]> => {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(full)));
		} else if (entry.isFile()) {
			files.push(full);
		}
	}
	return files;
};

const main = async () => {
	const start = Date.now();
	console.log(`Scanning ${path.relative(ROOT, DOCS_DIR)}...`);

	let allFiles: string[];
	try {
		allFiles = await walk(DOCS_DIR);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			console.log("No public/docs/ directory; writing empty index.");
			await writeFile(OUT_PATH, "[]\n");
			return;
		}
		throw err;
	}

	const supported = allFiles.filter((f) => /\.(docx|pdf)$/i.test(f));
	console.log(`Found ${supported.length} document(s).`);

	const entries: DocumentEntry[] = [];
	let skipped = 0;

	for (const absPath of supported) {
		const relFromPublic = `/${path.relative(path.join(ROOT, "public"), absPath).split(path.sep).join("/")}`;
		const filename = path.basename(absPath);
		const ext = path.extname(absPath).toLowerCase();

		try {
			const text = ext === ".pdf" ? await extractPdf(absPath) : await extractDocx(absPath);
			if (!text) {
				console.warn(`  empty text: ${filename}`);
				skipped++;
				continue;
			}

			const meeting = meetingByPath.get(relFromPublic);
			let title: string;
			let href: string;
			let type: DocumentEntry["type"];

			if (meeting) {
				title = meeting.title;
				href = relFromPublic;
				type = "minutes";
			} else if (filename === "town-ordinance.pdf") {
				title = "Town Ordinances";
				href = relFromPublic;
				type = "ordinance";
			} else if (relFromPublic.startsWith("/docs/meetings/")) {
				title = humanizeFilename(filename);
				href = relFromPublic;
				type = "minutes";
			} else {
				title = humanizeFilename(filename);
				href = relFromPublic;
				type = "other";
			}

			entries.push({
				id: relFromPublic,
				title,
				href,
				type,
				text,
			});
		} catch (err) {
			console.warn(`  failed: ${filename} — ${(err as Error).message}`);
			skipped++;
		}
	}

	entries.sort((a, b) => a.title.localeCompare(b.title));

	await writeFile(OUT_PATH, `${JSON.stringify(entries, null, 0)}\n`);
	const { size } = await stat(OUT_PATH);
	const sizeKb = (size / 1024).toFixed(1);
	const elapsed = ((Date.now() - start) / 1000).toFixed(1);

	console.log(
		`Wrote ${entries.length} entries (${sizeKb} KB) to ${path.relative(ROOT, OUT_PATH)} in ${elapsed}s. Skipped: ${skipped}.`,
	);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
