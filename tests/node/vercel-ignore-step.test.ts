/**
 * Tests for scripts/vercel-ignore-step.sh (LAC-7152).
 *
 * Two Vercel projects build this repo and both read this one script, so the
 * production arm is load-bearing for two live client domains: townofharmony.org
 * via `townofharmony-org`, and preview.townofharmony.org via the production
 * target of `townofharmony-org-preview`. A regression that makes the production
 * arm exit 0 would silently freeze a client site on an older deployment after a
 * merge, which is exactly the failure this file exists to catch.
 *
 * Exit 1 = build. Exit 0 = skip.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../..");
const scriptPath = path.join(repoRoot, "scripts/vercel-ignore-step.sh");

const BUILD = 1;
const SKIP = 0;

function runIgnoreStep(vercelEnv: Record<string, string>) {
  // Run outside any git work tree so the script's `git log` fallback cannot pick
  // up a real HEAD message and make a case pass for the wrong reason.
  const result = spawnSync("bash", [scriptPath], {
    cwd: os.tmpdir(),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
      ...vercelEnv,
    },
  });

  expect(result.error).toBeUndefined();
  expect(result.signal).toBeNull();
  expect(typeof result.status).toBe("number");

  return { status: result.status, stdout: result.stdout };
}

describe("vercel-ignore-step.sh: production", () => {
  it("builds production", () => {
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
    expect(stdout).toContain("production: building");
  });

  it("builds production even when the commit asks to skip CI", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "chore(deps): bump things [skip ci]",
    });

    expect(status).toBe(BUILD);
  });
});

describe("vercel-ignore-step.sh: previews are opt-in", () => {
  it("skips a preview with no marker", () => {
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: some fix",
    });

    expect(status).toBe(SKIP);
    expect(stdout).toContain("skipping");
  });

  it("skips the preview branch, which townofharmony-org-preview now serves", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "preview",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: fast-forwarded from main",
    });

    expect(status).toBe(SKIP);
  });

  it("builds a preview when [preview] is in the commit subject", () => {
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix",
      VERCEL_GIT_COMMIT_MESSAGE: "feat: new events page [preview]",
    });

    expect(status).toBe(BUILD);
    expect(stdout).toContain("commit subject");
  });

  it("ignores a marker that appears only in the commit body", () => {
    // Regression: the first cut matched the whole message, so a commit whose body
    // merely discussed the marker opted itself in. That cost a real build, and a
    // failed one, on townofharmony-org-preview.
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix",
      VERCEL_GIT_COMMIT_MESSAGE:
        "ci: document the opt-in marker\n\nNo [preview] marker on purpose: this commit should not build.",
    });

    expect(status).toBe(SKIP);
    expect(stdout).toContain("skipping");
  });

  it("builds on a subject marker even when the body also mentions it", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix",
      VERCEL_GIT_COMMIT_MESSAGE: "feat: events page [preview]\n\nUsing [preview] deliberately.",
    });

    expect(status).toBe(BUILD);
  });

  it("does not treat a [preview] branch name as an escape", () => {
    // Regression: an earlier cut carried a second `case` on VERCEL_GIT_COMMIT_REF,
    // which made this the only project in the fleet with a rule looser than the
    // fleet default. The marker is per-commit on purpose, so that opting a branch
    // in is a visible act in history rather than a property of its name.
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix-[preview]",
      VERCEL_GIT_COMMIT_MESSAGE: "feat: new events page",
    });

    expect(status).toBe(SKIP);
    expect(stdout).toContain("skipping");
  });

  it("matches the fleet default on every arm it shares with it", () => {
    // The dashboard field on townofharmony-org is FLEET_DEFAULT verbatim while
    // this script is the live surface, so a divergence beyond the documented
    // subject-vs-body narrowing would be invisible until a build ran. Asserting
    // the script carries no ref-based escape at all is what keeps the two in step.
    const script = readFileSync(scriptPath, "utf8");
    const executable = script
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("#"))
      .join("\n");

    expect(executable).not.toContain("VERCEL_GIT_COMMIT_REF");
  });

  it("skips when VERCEL_ENV is absent, rather than defaulting to a build", () => {
    const { status } = runIgnoreStep({});

    expect(status).toBe(SKIP);
  });
});

describe("vercel-ignore-step.sh: wiring", () => {
  it("is the ignoreCommand in vercel.json", () => {
    // vercel.json's ignoreCommand overrides the dashboard field, so this is the
    // line that makes the script above live at all (LAC-6380).
    const vercelConfig = JSON.parse(readFileSync(path.join(repoRoot, "vercel.json"), "utf8")) as {
      ignoreCommand?: string;
    };

    expect(vercelConfig.ignoreCommand).toBe("bash scripts/vercel-ignore-step.sh");
  });
});
