#!/usr/bin/env bash
# Decides which CI jobs can be skipped. Prints `<job>-pass=true|false` lines to
# $GITHUB_OUTPUT (stdout outside CI).
#
# pull_request: a job is skipped when the pull request changes none of the
#   files it reads. Nothing outside this checkout is consulted.
#
# push to main/dev: a job is skipped when the pull request this commit came
#   from already passed it on the same tree. main requires up-to-date
#   branches, so the squashed tree equals the pull request head's tree, and
#   every pull_request run on that head tested exactly that tree: main only
#   moves forward, so the base it merged was an ancestor of the head. Since the
#   tree is identical, the CI code that ran is the code now on main. Only job
#   conclusions are read, which code inside a run cannot set for other jobs.
#
# Env: GITHUB_EVENT_NAME, GITHUB_REPOSITORY, GITHUB_REF_NAME, GH_TOKEN,
#      FORCE=true to skip nothing.
# A failure anywhere means "run the job", never "skip it".
set -uo pipefail

out="${GITHUB_OUTPUT:-/dev/stdout}"
repo="$GITHUB_REPOSITORY"

ci_files=(.github/workflows/ci.yml .github/actions .github/scripts)
# Unit tests: the framework and what decides how it installs and compiles.
# No test imports markdown.
unit_files=(framework configs package.json yarn.lock .yarnrc.yml .yarn/releases ':(exclude,glob)**/*.md')
# Storybook jobs run `yarn build` over every workspace, so cli/ is an input,
# and Storybook renders framework/**/*.docs.md.
storybook_files=(. ':(exclude)docs' ':(exclude).claude' ':(exclude).github'
  ':(exclude,glob)*.md' ':(exclude,glob)cli/**/*.md' ':(exclude,glob)configs/**/*.md' ':(exclude,glob)packages/**/*.md')

say() { echo "$1-pass=$2" >>"$out"; echo "$1: $([ "$2" = true ] && echo skip || echo run) ($3)" >&2; }

all_run() {
  for job in static unit storybook-tests storybook-build; do say "$job" false "$1"; done
  exit 0
}

[ "${FORCE:-false}" = true ] && all_run "forced"

# --- pull_request ------------------------------------------------------------
# The checkout is the test merge commit; its first parent is the base tip.
unchanged() { git diff --quiet HEAD^1 HEAD -- "$@"; }

if [ "$GITHUB_EVENT_NAME" = pull_request ]; then
  git rev-parse -q --verify HEAD^2 >/dev/null || all_run "checkout is not a merge commit"
  say static false "always runs on a pull request"
  if unchanged "${unit_files[@]}" && unchanged "${ci_files[@]}"; then
    say unit true "no unit test input changed"
  else
    say unit false "unit test inputs changed"
  fi
  if unchanged "${storybook_files[@]}" && unchanged "${ci_files[@]}"; then
    say storybook-tests true "no Storybook input changed"
    say storybook-build true "no Storybook input changed"
  else
    say storybook-tests false "Storybook inputs changed"
    say storybook-build false "Storybook inputs changed"
  fi
  exit 0
fi

# --- push --------------------------------------------------------------------
[ "$GITHUB_EVENT_NAME" = push ] || all_run "event $GITHUB_EVENT_NAME"

branch="$GITHUB_REF_NAME"
sha=$(git rev-parse HEAD)
head=$(gh api "repos/$repo/commits/$sha/pulls" \
  --jq "[.[] | select(.merged_at != null and .base.ref == \"$branch\")][0].head.sha // empty") ||
  all_run "pull request lookup failed"
[ -n "$head" ] || all_run "no merged pull request into $branch for $sha"

head_tree=$(gh api "repos/$repo/git/commits/$head" --jq .tree.sha) || all_run "tree lookup failed"
[ "$head_tree" = "$(git rev-parse 'HEAD^{tree}')" ] ||
  all_run "pull request head ${head:0:9} has a different tree, main moved before the merge"

# Names of jobs that succeeded in any pull_request run of ci.yml on that head,
# latest attempt of each run. This is the evidence the branch ruleset already
# accepted to allow the merge: its required checks are job results on the head
# sha. (GitHub empties a run's pull_requests list once the PR is merged, so the
# base cannot be read back here.) The push run gates nothing; the merge is done.
runs=$(gh api "repos/$repo/actions/workflows/ci.yml/runs?head_sha=$head&event=pull_request&per_page=20" \
  --jq '.workflow_runs[].id') ||
  all_run "run lookup failed"
passed=""
for id in $runs; do
  names=$(gh api "repos/$repo/actions/runs/$id/jobs?filter=latest&per_page=100" \
    --jq '.jobs[] | select(.conclusion == "success") | .name') || continue
  passed+="$names"$'\n'
done

has() { grep -qxF "$1" <<<"$passed"; }
verdict() { # job required-job-name...
  local job=$1 name
  shift
  for name in "$@"; do
    has "$name" || { say "$job" false "pull request did not pass '$name'"; return; }
  done
  say "$job" true "passed in the pull request on the same tree"
}

verdict static "static-checks"
verdict unit "unit-tests (1/3)" "unit-tests (2/3)" "unit-tests (3/3)"
verdict storybook-tests "storybook-tests (1/2)" "storybook-tests (2/2)"
say storybook-build false "pull request only"
