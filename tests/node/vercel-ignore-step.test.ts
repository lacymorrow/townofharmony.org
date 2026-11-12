/**
 * Tests for scripts/vercel-ignore-step.sh (LAC-7152).
 *
 * Two Vercel projects build this repo and both read this one script, and since
 * LAC-7939 they get different answers on the same `VERCEL_ENV=production`:
 *
 *   townofharmony-org          the live town site, always builds
 *   townofharmony-org-preview  preview.townofharmony.org, opt-in like a branch
 *
 * The only thing separating them inside the ignore step is
 * VERCEL_PROJECT_PRODUCTION_URL, so the discriminator is the load-bearing part
 * of this file. A regression that makes the live site's production arm exit 0
 * would silently freeze townofharmony.org on an older deployment after a merge,
 * which is exactly the failure this file exists to catch. Every live-site case
 * below therefore also exists in a fail-safe form, where an absent or unexpected
 * production URL must still build.
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

const LIVE_SITE_URL = "www.townofharmony.org";
const STAGING_URL = "preview.townofharmony.org";

describe("vercel-ignore-step.sh: the live site always builds", () => {
  it("builds production", () => {
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: LIVE_SITE_URL,
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
    expect(stdout).toContain(`production (${LIVE_SITE_URL}): building`);
  });

  it("builds production even when the commit asks to skip CI", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: LIVE_SITE_URL,
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "chore(deps): bump things [skip ci]",
    });

    expect(status).toBe(BUILD);
  });

  it("builds production on the apex host as well as www", () => {
    // VERCEL_PROJECT_PRODUCTION_URL is whichever production domain Vercel
    // prefers, and this project carries three. Only the staging hosts are
    // matched by name, so every other value lands here.
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "townofharmony.org",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
  });

  it("builds production when the production URL is absent", () => {
    // Fail-safe. The discriminator is a system env var this script cannot
    // verify, so its absence has to mean "build", never "skip". Getting this
    // backwards is the one failure here that is a client incident rather than a
    // build-minutes regression.
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
    expect(stdout).toContain("no production url");
  });

  it("builds production when the production URL is empty", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
  });

  it("builds production when the production URL is one it has never seen", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "townofharmony-org.vercel.app",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
  });

  it("does not let a staging host as a substring gate the live site", () => {
    // `case` patterns are matched whole here, not as prefixes. A host that
    // merely contains the staging name must not take the staging arm.
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "not-preview.townofharmony.org.example.com",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(BUILD);
  });
});

describe("vercel-ignore-step.sh: the staging project is opt-in too (LAC-7939)", () => {
  // townofharmony-org-preview tracks main, so before LAC-7939 every merge built
  // twice: once here, skippably, and once there, unskippably. That second build
  // was 38.4 wall-min/wk. The domain keeps serving its last deployment, so what
  // this trades is freshness, not availability.

  it("skips the staging production build with no marker", () => {
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: STAGING_URL,
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(SKIP);
    expect(stdout).toContain(`staging (${STAGING_URL}, env=production): skipping`);
  });

  it("names the discriminator it saw on a skip, so a build log can verify it", () => {
    // The script cannot prove from the inside that VERCEL_PROJECT_PRODUCTION_URL
    // reaches the ignore step, and a wrong answer there is a silent revert of
    // LAC-7939 rather than a failure. Printing the value on the free ~2s skips a
    // PR branch already generates is what makes that checkable without
    // spending a real build.
    // Both skip paths, because a PR branch produces one build per project and
    // either log alone would settle it.
    for (const productionUrl of [LIVE_SITE_URL, STAGING_URL]) {
      const { stdout } = runIgnoreStep({
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: productionUrl,
        VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix",
        VERCEL_GIT_COMMIT_MESSAGE: "fix: some fix",
      });

      expect(stdout).toContain(productionUrl);
      expect(stdout).toContain("env=preview");
    }
  });

  it("skips the staging production build on its generated vercel.app host too", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "townofharmony-org-preview.vercel.app",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: a routine production merge",
    });

    expect(status).toBe(SKIP);
  });

  it("builds the staging production build when [preview] is in the subject", () => {
    const { status, stdout } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: STAGING_URL,
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "feat: new business listings for staff review [preview] (#412)",
    });

    expect(status).toBe(BUILD);
    expect(stdout).toContain("commit subject");
  });

  it("ignores a staging marker that appears only in the commit body", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: STAGING_URL,
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE:
        "fix: a routine production merge\n\nNot refreshing staging: no [preview] marker on purpose.",
    });

    expect(status).toBe(SKIP);
  });

  it("skips the staging production build on [skip ci] like any other commit", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: STAGING_URL,
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_GIT_COMMIT_MESSAGE: "chore(deps): bump things [skip ci]",
    });

    expect(status).toBe(SKIP);
  });

  it("still skips the staging project's own branch previews", () => {
    const { status } = runIgnoreStep({
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: STAGING_URL,
      VERCEL_GIT_COMMIT_REF: "LAC-1234/some-fix",
      VERCEL_GIT_COMMIT_MESSAGE: "fix: some fix",
    });

    expect(status).toBe(SKIP);
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
