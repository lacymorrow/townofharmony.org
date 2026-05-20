"use client";

import { BuilderComponent, useIsPreviewing } from "@builder.io/react";
import { builder } from "@builder.io/sdk";
import { env } from "@/env";
import "@/builder-registry-town";

builder.init(env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface RenderBuilderSectionProps {
	model: string;
	content?: Record<string, unknown>;
}

/**
 * Renders a Builder.io Section model entry.
 * Unlike RenderBuilderContent, returns null (not a 404) when no content is active —
 * safe to use in layouts and shared UI zones.
 */
export function RenderBuilderSection({ model, content }: RenderBuilderSectionProps) {
	const isPreviewing = useIsPreviewing();
	if (!content && !isPreviewing) return null;
	return <BuilderComponent model={model} content={content} />;
}
