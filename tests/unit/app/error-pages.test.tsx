import { fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-sign-in-redirect-url", () => ({ useSignInRedirectUrl: () => "/sign-in" }));
vi.mock("@/lib/utils/redirect-with-code", () => ({ redirectWithCode: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn() } }));
// authentication-error imports next-auth, which needs the real Next runtime.
vi.mock("@/lib/errors/authentication-error", () => ({
  AuthenticationError: class extends Error {},
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import GlobalError from "@/app/(app)/global-error";

/**
 * global-error must follow the Next.js contract ({ error, reset }). Town route
 * errors stop at (town)/error.tsx; this file only renders when the root layout
 * itself throws. Visitors must not see raw error messages in production.
 */
const boom = Object.assign(new Error("db password is hunter2"), { digest: "abc123" });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("(app)/global-error.tsx", () => {
  it("renders a full document with inline styles only and wires reset", () => {
    vi.stubEnv("NODE_ENV", "production");
    const html = renderToStaticMarkup(<GlobalError error={boom} reset={vi.fn()} />);
    expect(html.startsWith("<html")).toBe(true);
    expect(html).toContain("Try again");
    expect(html).toContain('href="/"');
    expect(html).toContain("Reference abc123");
    expect(html).not.toContain("hunter2");
    // No class attributes: there is no stylesheet when this page renders.
    expect(html).not.toMatch(/class="/);
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    const { container } = render(<GlobalError error={boom} reset={reset} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
