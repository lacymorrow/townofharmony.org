#!/usr/bin/env bash
# Vercel "Ignored Build Step". Exit 0 = skip the build, exit 1 = build.
#
# Wired from vercel.json as `"ignoreCommand": "bash scripts/vercel-ignore-step.sh"`.
# vercel.json's ignoreCommand OVERRIDES the dashboard "Ignored Build Step" field,
# so this file is the live surface for any commit that contains it. The dashboard
# field still governs branches cut before this landed, and carries the same
# semantics on both projects so the two surfaces cannot disagree (LAC-6380).
#
# Two Vercel projects build this one repo, and both read this file (LAC-7152):
#
#   townofharmony-org          production = main -> townofharmony.org, www
#   townofharmony-org-preview  production = main -> preview.townofharmony.org
#
# Production always builds on both. A skipped production build would leave a live
# client domain on an older deployment after a merge.
#
# Everything else is opt-in. Branch builds were 64.8 min/wk of build time on a repo
# where agents already run `verify` locally (typecheck, lint, tests, production
# build, route smoke) before pushing, and where both long-lived surfaces above stay
# current without them. Put [preview] in the commit message or the branch name when
# a branch actually needs a deployed URL, or redeploy it from the Vercel dashboard,
# which bypasses this step entirely.
set -eu

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "production: building"
  exit 1
fi

# Vercel sets VERCEL_GIT_COMMIT_MESSAGE in the build environment. `git log` is the
# fallback for a local run, where the checkout is the only source of truth.
MSG="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if [ -z "$MSG" ]; then
  MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
fi
REF="${VERCEL_GIT_COMMIT_REF:-}"

case "$MSG" in
  *"[preview]"*)
    echo "preview + [preview] in commit message: building"
    exit 1
    ;;
esac

case "$REF" in
  *"[preview]"*)
    echo "preview + [preview] in branch name: building"
    exit 1
    ;;
esac

echo "preview: skipping (add [preview] to the commit message or branch name to build)"
exit 0
