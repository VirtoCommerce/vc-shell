#!/usr/bin/env bash
# Decides which CI jobs can be skipped because their inputs already passed.
#
# Each job gets a key: a hash of the tracked files it reads, plus the CI files
# themselves. A job that passes uploads an artifact named after its key. When an
# artifact with that name already exists in this repository, the same files
# have already passed the same job, and the job is skipped. This covers:
#   - main after a merge: main requires up-to-date branches, so the squashed
#     tree is the tree the pull request already tested;
#   - a push that changes only files a job does not read (docs for unit tests);
#   - "Re-run all jobs" after one flaky job: the jobs that passed stay skipped.
#
# Usage: ci-plan.sh            prints key/pass lines (to $GITHUB_OUTPUT in CI)
# Env:   GITHUB_REPOSITORY, REPO_ID (numeric), FORCE=true to skip nothing,
#        GH_TOKEN for the artifacts API.
set -euo pipefail

out="${GITHUB_OUTPUT:-/dev/stdout}"

# Blob ids and paths of the matching tracked files, hashed. Content and renames
# both change it; untracked and ignored files do not exist for it.
files_hash() { git ls-files -s -- "$@" | git hash-object --stdin; }

ci_files=$(files_hash .github/workflows/ci.yml .github/actions .github/scripts)
key() { printf '%s\n%s\n' "$(files_hash "$@")" "$ci_files" | git hash-object --stdin | cut -c1-20; }

# Only artifacts uploaded by a run of this repository count. A fork's pull
# request runs its own copy of the workflows and could upload any name.
passed() {
  local name count
  for name in "$@"; do
    count=$(gh api "repos/$GITHUB_REPOSITORY/actions/artifacts?name=$name&per_page=100" \
      --jq "[.artifacts[] | select((.expired | not) and .workflow_run.head_repository_id == $REPO_ID)] | length") ||
      count=0 # an API failure means "run the job", never "skip it"
    [ "$count" -gt 0 ] || return 1
  done
}

decide() { # job key marker-name...
  local job=$1 k=$2
  shift 2
  echo "$job-key=$k" >>"$out"
  if [ "${FORCE:-false}" != "true" ] && passed "$@"; then
    echo "$job-pass=true" >>"$out"
    echo "$job: inputs already passed ($k), skipping" >&2
  else
    echo "$job-pass=false" >>"$out"
    echo "$job: will run ($k)" >&2
  fi
}

# Lint, format, typecheck and friends read the whole tree, markdown included.
k=$(key .)
decide static "$k" "ci-pass-static-$k"

# Unit tests: the framework and everything that decides how it installs and
# compiles. No test imports markdown.
k=$(key framework configs package.json yarn.lock .yarnrc.yml .yarn/releases ':(exclude,glob)**/*.md')
decide unit "$k" "ci-pass-unit-$k-1" "ci-pass-unit-$k-2" "ci-pass-unit-$k-3"

# Storybook jobs run `yarn build` over every workspace, so cli/ is an input.
# framework/**/*.docs.md is too: Storybook renders the guides.
k=$(key . ':(exclude)docs' ':(exclude).claude' ':(exclude).github' \
  ':(exclude,glob)*.md' ':(exclude,glob)cli/**/*.md' ':(exclude,glob)configs/**/*.md' ':(exclude,glob)packages/**/*.md')
decide storybook-tests "$k" "ci-pass-storybook-tests-$k-1" "ci-pass-storybook-tests-$k-2"
decide storybook-build "$k" "ci-pass-storybook-build-$k"

