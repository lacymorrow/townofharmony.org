#!/usr/bin/env bash
# Vercel "Ignored Build Step". Exit 0 = skip the build, exit 1 = build.
#
# Wired from vercel.json as `"ignoreCommand": "bash scripts/vercel-ignore-step.sh"`.
# vercel.json's ignoreCommand OVERRIDES the dashboard "Ignored Build Step" field,
# so this file is the live surface for any commit that contains it, and the
# dashboard field only governs branches cut before this landed (LAC-6380).
# Proof it governs, build log of dpl_6QuEu39gTsxpXmPAzdmWJDYQTUUJ (the staging
# project's own production deploy of f13dc46):
#
#   Running "bash scripts/vercel-ignore-step.sh"
#   production: building
#
# The two dashboard fields are left at the fleet's own strings, not at a copy of
# this file, so that `tools/vercel-build-guard.py` recognises them instead of
# reporting this repo as `custom` forever. They are dead surfaces either way, and
# the wiring test in tests/node/vercel-ignore-step.test.ts fails CI if the
# vercel.json line that makes them dead is ever removed.
#
# Two Vercel projects build this one repo, both with production branch `main`
# (LAC-7152):
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
# THE LIVE SITE ALWAYS BUILDS. A skipped production build there would leave a
# live client domain on an older deployment after a merge.
#
# EVERYTHING ELSE IS OPT-IN, including the staging project's production target
# (LAC-7939). Because both projects track main, every merge used to build twice:
# once skippably here and once unskippably on the staging project, which made
# Town of Harmony 31.4% of all fleet Vercel build minutes and the only project
# whose build minutes rose while the fleet's fell 78%. Trailing 7d to
# 2026-11-12T22:04Z: 38.4 wall-min on the staging project's production target
# (n=14) out of 123.5 for the two projects together.
#
# The staging domain keeps serving its last successful deployment, so gating it
# costs freshness, never availability. Two ways to refresh it:
#
#   1. Put [preview] in the commit SUBJECT. That one merge builds both projects.
#   2. Redeploy it from the Vercel dashboard, which bypasses this step entirely.
#
# Branch builds were 64.8 min/wk on a repo where CI already gates every PR
# (typecheck, branding, format, vitest; see .github/workflows/ci.yml).
set -eu

# ---------------------------------------------------------------------------
# Which of the two projects is building?
#
# Both read this file and both have production branch `main`, so VERCEL_ENV says
# "production" on both and cannot tell them apart. The project's own production
# domain can. VERCEL_PROJECT_PRODUCTION_URL is a Vercel system env var and
# autoExposeSystemEnvs is true on both projects; the echoes below print whatever
# it actually held, so a build log settles its value rather than this comment.
#
# Matched POSITIVELY against the staging project's two production hosts, never as
# "is this not the live site". An inverse test would freeze townofharmony.org the
# first time the variable came through empty. This way an unset or unexpected
# value can only ever produce one extra staging build -- the old behaviour, 2.7
# min -- which is the harmless direction.
# ---------------------------------------------------------------------------
PRODUCTION_URL="${VERCEL_PROJECT_PRODUCTION_URL:-}"
IS_STAGING_PROJECT=no
case "$PRODUCTION_URL" in
  preview.townofharmony.org | townofharmony-org-preview.vercel.app)
    IS_STAGING_PROJECT=yes
    ;;
esac

if [ "${VERCEL_ENV:-}" = "production" ] && [ "$IS_STAGING_PROJECT" = "no" ]; then
  echo "production (${PRODUCTION_URL:-no production url}): building"
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
    echo "[preview] in commit subject: building (${PRODUCTION_URL:-no production url})"
    exit 1
    ;;
esac

# Deliberately NOT a second escape on VERCEL_GIT_COMMIT_REF. An earlier cut of
# this file matched the branch name too, which made this the only project in the
# fleet whose rule was looser than FLEET_DEFAULT -- a one-project policy
# divergence of the kind the CEO ruled against on LAC-6903, for an escape hatch
# nothing in this repo uses. The per-commit marker and the dashboard Redeploy
# button are the two supported ways in.

# Keyed on the project, not on VERCEL_ENV, so that every skip -- including the
# free ~2s ones on a PR branch -- prints the discriminator it actually saw. That
# is the only way to verify VERCEL_PROJECT_PRODUCTION_URL reaches this step
# without spending a real build, and an empty value here is what a silent revert
# of LAC-7939 would look like.
if [ "$IS_STAGING_PROJECT" = "yes" ]; then
  echo "staging ($PRODUCTION_URL, env=${VERCEL_ENV:-none}): skipping (add [preview] to the commit subject, or Redeploy in Vercel)"
else
  echo "preview (${PRODUCTION_URL:-no production url}, env=${VERCEL_ENV:-none}): skipping (add [preview] to the commit subject to build)"
fi
exit 0
