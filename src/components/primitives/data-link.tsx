import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { getHrefKind } from "@/lib/href-kind";

interface DataLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** A Builder- or data-authored href. Not assumed to be an App Router route. */
  href: string | null | undefined;
  children: ReactNode;
  /** Rendered in place of the link when the href is missing or unsafe. */
  fallback?: ReactNode;
}

/**
 * Renders a data-authored href with the element it actually needs: `next/link`
 * for in-app routes, a plain `<a>` for everything else.
 *
 * Use this anywhere an href comes from Builder or `src/data/town/*` instead of
 * from the route table. A static file path handed to `<Link>` 404s on
 * client-side navigation and only works after a reload (LAC-6284), and files
 * and external sites should open in a new tab so the visitor keeps their place.
 */
export const DataLink = ({ href, children, fallback = null, ...props }: DataLinkProps) => {
  const resolved = href?.trim() ?? "";
  const kind = getHrefKind(resolved);

  if (kind === "unsafe") return <>{fallback}</>;

  if (kind === "route") {
    return (
      <Link href={resolved} {...props}>
        {children}
      </Link>
    );
  }

  const opensInNewTab = kind === "file" || kind === "external";

  return (
    <a
      href={resolved}
      target={opensInNewTab ? "_blank" : undefined}
      rel={opensInNewTab ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};
