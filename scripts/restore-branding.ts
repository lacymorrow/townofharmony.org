/**
 * Post-merge branding reset: the per-path exclude `git merge` doesn't have.
 *
 * Resets every path in BRANDING_ASSETS to its state in `--base` (the pre-merge
 * ref) and stages the result. A path present in base is restored; a path absent
 * from base but added by the merge is deleted. That second case is LAC-3976:
 * upstream re-added `src/app/icon.svg` and it beat the TOH favicon.ico.
 *
 * Usage: bun scripts/restore-branding.ts --base main
 *
 * Run after the upstream merge and before the sync commit.
 */

import { execFileSync } from "node:child_process";
import { BRANDING_ASSETS } from "./branding-assets";

const git = (...args: string[]): string =>
	execFileSync("git", args, { encoding: "utf8" }).trim();

/** True when `ref:path` resolves to a blob, i.e. the file existed in that ref. */
const existsInRef = (ref: string, path: string): boolean => {
	try {
		execFileSync("git", ["cat-file", "-e", `${ref}:${path}`], { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
};

/** True when the path is present in the current index or worktree. */
const existsNow = (path: string): boolean => {
	try {
		execFileSync("git", ["ls-files", "--error-unmatch", "--", path], { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
};

const baseIndex = process.argv.indexOf("--base");
const base = baseIndex === -1 ? undefined : process.argv[baseIndex + 1];

if (!base) {
	console.error("❌ restore-branding: --base <ref> is required (the pre-merge ref).");
	process.exit(1);
}

try {
	git("rev-parse", "--verify", `${base}^{commit}`);
} catch {
	console.error(`❌ restore-branding: '${base}' is not a valid git ref.`);
	process.exit(1);
}

const restored: string[] = [];
const removed: string[] = [];

for (const path of BRANDING_ASSETS) {
	const inBase = existsInRef(base, path);

	if (inBase) {
		// Skip the no-op case so a clean sync produces no commit at all.
		const changed = git("diff", "--name-only", base, "--", path) !== "";
		if (!changed) {
			continue;
		}
		git("checkout", base, "--", path);
		restored.push(path);
		continue;
	}

	// Not in base. If the merge introduced it, it is upstream art — drop it.
	if (existsNow(path)) {
		git("rm", "--force", "--quiet", "--", path);
		removed.push(path);
	}
}

if (restored.length === 0 && removed.length === 0) {
	console.info("✅ restore-branding: upstream left TOH branding assets alone, nothing to do.");
	process.exit(0);
}

console.info("🛡️ restore-branding: reverted upstream changes to TOH branding assets.");
for (const path of restored) {
	console.info(`  - restored from ${base}: ${path}`);
}
for (const path of removed) {
	console.info(`  - deleted (added by upstream, not in ${base}): ${path}`);
}
console.info("Changes are staged. Review them before the sync PR merges.");
