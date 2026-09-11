import { htmlToPlainText } from "@/lib/html-to-text";
import { sanitizeHtml } from "@/lib/sanitize-html";

// Builder richText fields store HTML strings (usually one line); static data
// stores plain newline-delimited text. Detect any HTML tag to branch. (LAC-3639)
const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

interface PayloadRichTextProps {
	content: string | Record<string, unknown> | null | undefined;
	className?: string;
}

/**
 * Renders rich text content as HTML.
 * Handles plain strings (static data) and Lexical editor state (legacy).
 */
export function PayloadRichText({ content, className }: PayloadRichTextProps) {
	if (!content) {
		return null;
	}

	// Handle plain string content (from static data) or HTML string (Builder)
	if (typeof content === "string") {
		// Builder richText fields are HTML strings — sanitize + render as markup
		// so tags don't print as literal text (same fix as LAC-3559 / PR #258).
		if (HTML_TAG_PATTERN.test(content)) {
			return (
				<div
					className={className ?? "prose prose-lg max-w-none"}
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
				/>
			);
		}

		const paragraphs = content.split("\n").filter((p) => p.trim());
		return (
			<div className={className ?? "prose prose-lg max-w-none"}>
				{paragraphs.map((paragraph, index) => (
					<p key={index}>{paragraph}</p>
				))}
			</div>
		);
	}

	// Handle Lexical editor state (legacy fallback)
	const lexical = content as { root?: { children?: any[] } };
	if (!lexical?.root?.children) {
		return null;
	}

	return (
		<div className={className ?? "prose prose-lg max-w-none"}>
			{lexical.root.children.map((node: any, index: number) => (
				<RichTextNode key={index} node={node} />
			))}
		</div>
	);
}

function RichTextNode({ node }: { node: any }) {
	const n = node;

	if (n.type === "paragraph") {
		return (
			<p>
				{n.children?.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</p>
		);
	}

	if (n.type === "heading") {
		const level = n.tag as number;
		const HeadingTag = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : level === 4 ? "h4" : level === 5 ? "h5" : "h6";
		return (
			<HeadingTag>
				{n.children?.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</HeadingTag>
		);
	}

	if (n.type === "list") {
		const Tag = n.listType === "number" ? "ol" : "ul";
		return (
			<Tag>
				{n.children?.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</Tag>
		);
	}

	if (n.type === "listitem") {
		return (
			<li>
				{n.children?.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</li>
		);
	}

	if (n.type === "link") {
		const url = n.fields?.url || n.url || "#";
		const target = n.fields?.newTab ? "_blank" : undefined;
		return (
			<a href={url} target={target} rel={target ? "noopener noreferrer" : undefined}>
				{n.children?.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</a>
		);
	}

	if (n.type === "quote") {
		return (
			<blockquote>
				{n.children?.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</blockquote>
		);
	}

	if (n.type === "text") {
		let text: React.ReactNode = n.text ?? "";

		if (n.format & 1) text = <strong>{text}</strong>;
		if (n.format & 2) text = <em>{text}</em>;
		if (n.format & 8) text = <u>{text}</u>;
		if (n.format & 4) text = <s>{text}</s>;
		if (n.format & 16) text = <code>{text}</code>;

		return <>{text}</>;
	}

	if (n.type === "linebreak") {
		return <br />;
	}

	// Fallback: render children if present
	if (n.children) {
		return (
			<>
				{n.children.map((child: any, i: number) => (
					<RichTextNode key={i} node={child} />
				))}
			</>
		);
	}

	return null;
}

/**
 * Extracts plain text from content for use in excerpts.
 */
export function extractTextFromRichText(content: string | Record<string, unknown> | null | undefined): string {
	if (!content) return "";
	// Builder rich text fields store HTML strings — strip markup for excerpts (LAC-3559)
	if (typeof content === "string") return htmlToPlainText(content);

	const lexical = content as { root?: { children?: any[] } };
	if (!lexical?.root?.children) return "";

	const extractFromNode = (node: any): string => {
		if (node.type === "text") return node.text ?? "";
		if (node.children) return node.children.map(extractFromNode).join("");
		return "";
	};

	return lexical.root.children.map(extractFromNode).join(" ").trim();
}
