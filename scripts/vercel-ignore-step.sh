#!/usr/bin/env bash
# Vercel "Ignored Build Step". Exit 0 = skip the build, exit 1 = build.
#
# Wired from vercel.json as `"ignoreCommand": "bash scripts/vercel-ignore-step.sh"`.
# vercel.json's ignoreCommand OVERRIDES the dashboard "Ignored Build Step" field,
# so this file is the live surface for any commit that contains it, and the
# dashboard field only governs branches cut before this landed (LAC-6380).
#
# The two dashboard fields are set to the fleet's own strings, not to a copy of
# this file, so that `tools/vercel-build-guard.py` recognises them instead of
# reporting this repo as `custom` forever:
#
#   townofharmony-org          FLEET_DEFAULT verbatim
#   townofharmony-org-preview  production-only, byte-identical to
#                              rcbconstructionmgmt.com-preview, the other split pair
#
# FLEET_DEFAULT differs from this file on one point: it matches `[preview]`
# anywhere in the commit message, where this file matches the subject line only
# (see below). That is strictly looser, so the only way the two can disagree is
# an extra preview build on a pre-landing branch. Neither can skip a production
# deploy, which is the property that matters.
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
# current without them. Put [preview] in the commit subject when a branch actually
# needs a deployed URL, or redeploy it from the Vercel dashboard, which bypasses
# this step entirely.
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

# Deliberately NOT a second escape on VERCEL_GIT_COMMIT_REF. An earlier cut of
# this file matched the branch name too, which made this the only project in the
# fleet whose rule was looser than FLEET_DEFAULT -- a one-project policy
# divergence of the kind the CEO ruled against on LAC-6903, for an escape hatch
# nothing in this repo uses. The per-commit marker and the dashboard Redeploy
# button are the two supported ways in.

echo "preview: skipping (add [preview] to the commit subject to build)"
exit 0
