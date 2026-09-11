"use client";

import { AlertTriangle } from "lucide-react";
import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/lib/logger";

interface SafeBlockProps {
  /** Shown in logs and in the editor notice. Use the Builder component name. */
  name: string;
  children: ReactNode;
  /** What visitors see if the block throws. Defaults to nothing at all. */
  fallback?: ReactNode;
}

interface SafeBlockState {
  failed: boolean;
}

/**
 * Isolates one content block from the rest of the page.
 *
 * Builder editors publish whatever they like; a block that throws on bad data
 * should disappear on its own, not take the page down with it. Visitors see
 * the fallback (nothing, by default). Editors previewing in Builder see a
 * short notice so they know which block to fix.
 */
export class SafeBlock extends Component<SafeBlockProps, SafeBlockState> {
  state: SafeBlockState = { failed: false };

  static getDerivedStateFromError(): SafeBlockState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error(`[SafeBlock] ${this.props.name} failed to render`, {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (isBuilderEditor()) {
      return <EditorNotice name={this.props.name} />;
    }
    return this.props.fallback ?? null;
  }
}

/**
 * True inside Builder's visual editor or preview. Checked via the URL instead
 * of importing the Builder SDK so route bundles that never use Builder (the
 * /map page) stay light.
 */
function isBuilderEditor(): boolean {
  if (typeof window === "undefined") return false;
  return /builder\.(preview|editing|frameEditing)=/.test(window.location.search);
}

const EditorNotice = ({ name }: { name: string }) => (
  <div
    role="alert"
    className="m-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
  >
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
    <div>
      <p className="font-semibold">{name} could not render</p>
      <p>One of its entries is incomplete. Visitors will not see this block until it is fixed.</p>
    </div>
  </div>
);

/** Wrap a component so it renders inside a SafeBlock. Used at Builder registration. */
export function withSafeBlock<P extends object>(
  Wrapped: ComponentType<P>,
  name: string
): ComponentType<P> {
  const Safe = (props: P) => (
    <SafeBlock name={name}>
      <Wrapped {...props} />
    </SafeBlock>
  );
  Safe.displayName = `Safe(${name})`;
  return Safe;
}
