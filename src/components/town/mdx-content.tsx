"use client";

import { useMemo } from "react";

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  // For now, we'll render the content as plain HTML
  // In production, you'd want to use a proper MDX parser
  const renderedContent = useMemo(() => {
    // Basic markdown to HTML conversion
    let html = content
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^\* (.+)/gim, "<li>$1</li>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/gim, "<br />");

    // Wrap list items in ul
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

    return html;
  }, [content]);

  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
