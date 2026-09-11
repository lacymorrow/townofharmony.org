import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

import { SafeBlock, withSafeBlock } from "@/components/town/safe-block";

const Boom = (): null => {
  throw new Error("bad entry");
};

describe("SafeBlock", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when nothing throws", () => {
    render(
      <SafeBlock name="Block">
        <p>fine</p>
      </SafeBlock>
    );
    expect(screen.getByText("fine")).toBeInTheDocument();
  });

  it("hides a throwing block from visitors by default", () => {
    const { container } = render(
      <div>
        <p>before</p>
        <SafeBlock name="Block">
          <Boom />
        </SafeBlock>
        <p>after</p>
      </div>
    );
    expect(screen.getByText("before")).toBeInTheDocument();
    expect(screen.getByText("after")).toBeInTheDocument();
    expect(container.querySelector("[role=alert]")).toBeNull();
  });

  it("renders the given fallback for visitors", () => {
    render(
      <SafeBlock name="Map" fallback={<p>map unavailable</p>}>
        <Boom />
      </SafeBlock>
    );
    expect(screen.getByText("map unavailable")).toBeInTheDocument();
  });

  it("tells editors which block failed in Builder preview", () => {
    window.history.replaceState(null, "", "/?builder.preview=page");
    render(
      <SafeBlock name="TownNewsGrid">
        <Boom />
      </SafeBlock>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("TownNewsGrid could not render");
  });

  it("withSafeBlock wraps a component and keeps its props", () => {
    const Hello = ({ who }: { who: string }) => <p>hi {who}</p>;
    const Safe = withSafeBlock(Hello, "Hello");
    render(<Safe who="harmony" />);
    expect(screen.getByText("hi harmony")).toBeInTheDocument();
    expect(Safe.displayName).toBe("Safe(Hello)");
  });
});
