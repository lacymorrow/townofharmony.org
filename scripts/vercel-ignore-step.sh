#!/usr/bin/env bash
# Vercel "Ignored Build Step". Exit 0 = skip the build, exit 1 = build.
#
# Wired from vercel.json as `"ignoreCommand": "bash scripts/vercel-ignore-step.sh"`.
# vercel.json's ignoreCommand OVERRIDES the dashboard "Ignored Build Step" field,
# so this file is the live surface for any commit that contains it, and the
# dashboard field only governs branches cut before this landed (LAC-6380). Both
# dashboard fields were set to agree with this file rather than left to drift:
# townofharmony-org carries the same production + subject/branch marker logic
# inline, townofharmony-org-preview carries production-only, which is the same
# answer there because that project has no reason to build a branch at all.
#
# Two Vercel projects build this one repo, and both read this file (LAC-7152):
#
#   townofharmony-org          production = main -> townofharmony.org, www
#   townofharmony-org-preview  production = main -> preview.townofharmony.org
#
# The second project exists so the client-facing staging domain keeps serving a
# current build after previews became opt-in. It is a *production* target on its
# own project, so it is publicly reachable where the old SSO-gated preview
# deployment was not. What makes that safe is measured, not assumed: the
# host-scoped noindex headers in next.config.ts, and Stripe keys that are
# sk_test_/pk_test_ on that project, so the sewer flow it exposes and production
# hides cannot take real money.
#
# Production always builds on both. A skipped production build would leave a live
# client domain on an older deployment after a merge.
#
# Everything else is opt-in. Branch builds were 64.8 min/wk of build time on a repo
# where agents already run `verify` locally (typecheck, lint, tests, production
# build, route smoke) before pushing, and where both long-lived surfaces above stay
# current without them. Put [preview] in the commit subject or the branch name when
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

# Subject line only, not the whole body. Matching the body opts a branch in when a
# commit merely *mentions* the marker in prose, which is not a hypothetical: the
# commit that added the second noindex host said "No [preview] marker on purpose"
# and built anyway. Same reason `[skip ci]` is a subject-line convention.
SUBJECT="${MSG%%$'\n'*}"

case "$SUBJECT" in
  *"[preview]"*)
    echo "preview + [preview] in commit subject: building"
    exit 1
    ;;
esac

case "$REF" in
  *"[preview]"*)
    echo "preview + [preview] in branch name: building"
    exit 1
    ;;
esac

echo "preview: skipping (add [preview] to the commit subject or branch name to build)"
exit 0
