# CI Workflows

Overview of every GitHub Actions workflow in this repository. Each workflow file starts with a header comment that repeats the essentials below.

| Workflow              | File                    | Trigger                                                                                    | Purpose                                                                                                                                                                                       | Required for merge?                               |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **CI**                | `ci.yml`                | pull_request, push to main / dev, workflow_dispatch                                        | Static checks (lint, format, stylelint, typecheck, locales, circular, layers) and framework unit tests                                                                                        | Yes                                               |
| **Dependency review** | `dependency-review.yml` | pull_request                                                                               | Fails when the lockfile diff adds a dependency version with a high or critical advisory                                                                                                       | Yes                                               |
| **PR Title**          | `pr-title.yml`          | pull_request (opened, edited, synchronize, reopened)                                       | Validates the PR title is Conventional Commits format                                                                                                                                         | Yes                                               |
| **Publish**           | `publish.yml`           | pull_request (opened, synchronize, reopened; package paths only), workflow_dispatch        | One workflow for all npm publishing: `pr-<N>` previews on PR push and manual releases (version bump, CHANGELOG, tag, publish, GitHub Release). Both publish paths use OIDC — fully token-free | No (PR preview informational); manual for release |
| **Storybook**         | `storybook-ci.yml`      | reusable (`workflow_call`) — invoked by `ci.yml` on push to main; also `workflow_dispatch` | Builds Storybook + Docker image, pushes to ghcr.io, deploys to ArgoCD (`vc-shell-storybook.govirto.com`)                                                                                      | No                                                |

## CI (`ci.yml`)

Runs on `pull_request`, on push to `main` / `dev`, and on `workflow_dispatch`. Jobs:

- **`plan`** — decides which jobs can be skipped (see [Skipping jobs that already passed](#skipping-jobs-that-already-passed)).
- **`static-checks`** — lint (`--max-warnings=0`), Prettier, stylelint, typecheck, locales, circular deps (madge), layers, story argTypes. One step per check so the failing one is obvious.
- **`unit-tests`** — framework vitest suite in three parallel shards (`--shard=N/3`).
- **`test`** — reports one result for the three shards. It exists because `test` is a required check by name and a matrix job never reports a plain `test`.
- **`storybook-tests`** — every story rendered in Chromium with its play function and axe, in two parallel shards (one browser each; a single browser runs out of memory over the full set).
- **`storybook-build`** — pull requests only: `yarn build` + `yarn build:storybook`, no image, no deploy.
- **`storybook`** — push to `main` only: calls the reusable `storybook-ci.yml` to build, push the image, and deploy. It skips neither on `release:` commits nor through `plan`, so every push to `main` redeploys. See [Storybook CI](#storybook-ci-storybook-ciyml).
- **`ci-gate`** — one result for the whole workflow; a skipped job counts as passed.

The branch ruleset on `main` requires `static-checks`, `test` and `lint` (the last one comes from `pr-title.yml`).

Shared setup (Node 22, corepack, `yarn install --immutable` with `node_modules` restored from cache) lives in `.github/actions/setup`. Only `static-checks` saves the cache, so parallel jobs do not race for the key.

### Skipping jobs that already passed

`plan` runs `.github/scripts/ci-plan.sh`. For each job it hashes the tracked files the job reads, plus the CI files themselves. A job that passes uploads an empty artifact named `ci-pass-<job>-<hash>` (`.github/actions/record-pass`). If an artifact with that name already exists, `plan` skips the job, but only when the run that uploaded it was `ci.yml` from this repository with the same `ci.yml`, `.github/actions` and `.github/scripts` as the current commit. Anyone who can push a branch can upload an artifact with any name from a workflow of their own; a marker counts only if the real CI code wrote it, and that code writes it only after the job passed.

What that buys:

- **main after a merge.** Branches must be up to date before merging, so the squashed tree on `main` is the tree the pull request already tested, and the push run skips the checks. If `main` moved in between, the hash differs and everything runs.
- **Pushes that change only what a job does not read.** A `*.docs.md` edit reruns `static-checks` and the Storybook jobs, not the unit tests. A root `README.md` edit reruns only `static-checks`.
- **Re-running after a flaky failure.** "Re-run all jobs" skips the jobs that already passed. A matrix job is skipped only when all of its shards passed.

Inputs per job are listed in `ci-plan.sh`. When a job starts reading a new file outside its inputs, add the file there, or a change to it will not rerun the job. To ignore the markers, run the workflow manually with **force**.

If `plan` itself fails, every job runs: a broken plan never turns into skipped checks.

## Dependency review (`dependency-review.yml`)

Runs [`actions/dependency-review-action`](https://github.com/actions/dependency-review-action) on the PR's lockfile diff and fails on a new or upgraded dependency with a **high** or **critical** advisory, in any scope (yarn.lock does not separate dev from runtime). Only what the PR changes is checked, so an advisory published today against an existing dependency does not turn unrelated PRs red. Existing advisories are caught by the release audit below.

To block merges, "Dependency review" must be a required status check in the branch protection rules.

## PR Title (`pr-title.yml`)

Uses [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request) to ensure the PR title starts with one of the allowed Conventional Commits types (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `ci`, `build`, `style`, `revert`) and doesn't start the subject with an uppercase letter.

Required because we squash-merge: the PR title becomes the single commit message on `main`, and `@release-it/conventional-changelog` uses those commits to auto-build stable CHANGELOG sections.

## Publish (`publish.yml`)

A **single** workflow owns every npm publish. This is a hard requirement of npm Trusted Publishing: a package can have only **one** trusted publisher, and npm matches the **caller** workflow's filename — so PR-preview and release publishing cannot be split across two files (or hidden behind a reusable workflow). See [Trusted Publishing (OIDC)](#trusted-publishing-oidc).

Jobs are gated by `github.event_name`:

### On `pull_request`

Only when the push changes a published package: `framework/`, `cli/`, `configs/`, `packages/`, root manifests, `scripts/`, or this workflow. Markdown does not count, except under `cli/vc-app-skill/`, which publishes it.

- **`pr-preview`** — PRs from a branch in this repository (not a fork). Computes a preview version `<current>-pr<N>.<sha7>`, syncs it to every workspace manifest via `scripts/compute-preview-version.ts`, runs `yarn publish:packages --tag pr-<N>` (OIDC), and updates a PR comment with install instructions.
- **`notify-fork`** — Fork-origin PRs. Posts a one-time comment explaining previews aren't available for forks (GitHub doesn't expose secrets/OIDC to fork workflows).

**`pr-<N>` dist-tags are not auto-removed.** There is deliberately no cleanup job: `npm dist-tag rm` is a write that needs a token, and npm caps write tokens at a 90-day lifetime — keeping one purely for tag cleanup would reintroduce exactly the token-rotation burden this OIDC migration removed. Preview tags accumulate harmlessly (npm has no cap; the underlying versions stay published regardless). To sweep stale `pr-*` tags, a maintainer runs `npm dist-tag rm @vc-shell/<pkg> pr-<N>` locally under their own npm login (interactive 2FA) — no stored CI secret required.

### On `workflow_dispatch` (release)

Manual release with three inputs:

- `release-type` — `patch` / `minor` / `major`
- `prerelease` — `none` (stable) / `alpha` / `beta` / `rc`
- `dry-run` — `true` / `false`

The **`release`** job:

1. Checkout with `secrets.REPO_TOKEN` (vc-ci bot, admin) so the release commit and tag push past the ruleset.
2. `yarn install --immutable` → `yarn check` → `yarn check:audit` → `yarn build`. `check:audit` (`scripts/audit-published.ts`) runs `yarn npm audit` over the runtime dependencies of every published workspace and stops the release on a high or critical advisory. An advisory with no fix is accepted through `npmAuditIgnoreAdvisories` in `.yarnrc.yml`, with a comment saying why.
3. Configure git user as `vc-ci`.
4. Run `release-it` with the computed args. `PRERELEASE_CHANNEL` is exposed to `.release-it.cjs`, which conditionally enables/disables the CHANGELOG plugin and GitHub Release creation. During `after:bump`, release-it runs `yarn install` with `YARN_ENABLE_IMMUTABLE_INSTALLS=false` so the lockfile can be updated after workspace version bump.
5. For non-dry runs: `yarn publish:packages --tag <channel>` (OIDC — no token), then verify dist-tags.

Creates a **GitHub Release** entry only for stable releases (`prerelease: none`). Prereleases produce a git tag and npm publish but skip the Release entry to avoid cluttering `/releases`.

Each release run registers a **Deployment** in the `npm-<channel>` environment (`npm-latest`, `npm-alpha`, `npm-beta`, `npm-rc`), visible on the repository's Deployments tab with a URL pointing at the package on npmjs.

See `RELEASING.md` for the end-to-end release flow.

Install a preview in a consuming project:

```bash
npm install @vc-shell/framework@pr-<N>
```

## Storybook CI (`storybook-ci.yml`)

A **reusable** workflow (`workflow_call` + `workflow_dispatch`) — it has no `push` trigger of its own. `ci.yml` invokes it (via a `uses: ./.github/workflows/storybook-ci.yml` job with `secrets: inherit`) on every push to `main`, including the release commit. That caller job intentionally skips the `release:` guard the check/test jobs carry, so a release also redeploys Storybook. PRs do **not** invoke this workflow (it would push an image and deploy to the shared `vcmp-dev` env); they run the lighter build-only `storybook-build` job in `ci.yml` instead.

Two jobs:

- **`ci`** — builds Storybook bundle, packages the Docker image, pushes to `ghcr.io/virtocommerce/vc-shell-storybook`. Emits Jira build info.
- **`cd`** — on main / feat/redesign / PRs, calls `vc-build CloudEnvSetParameter` to update the ArgoCD `vcmp-dev` environment with the new image tag. Registers a Deployment in the `storybook-dev` environment pointing at the hosted Storybook URL.

## Common Secrets

| Secret                                                  | Used by                  | Purpose                                                           |
| ------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `REPO_TOKEN`                                            | Publish (`release`)      | PAT for `vc-ci` bot; pushes release commits/tags past the ruleset |
| `VCMP_PLATFORM_TOKEN`                                   | Storybook CI (`cd`)      | ArgoCD deployment via `vc-build`                                  |
| `CLIENT_ID`, `CLIENT_SECRET`, `CLOUD_INSTANCE_BASE_URL` | Storybook CI             | Jira build info integration (optional)                            |
| `GITHUB_TOKEN`                                          | All workflows (built-in) | Posting PR comments, creating GitHub Releases                     |

> **No `NPM_TOKEN`.** npm publishing is entirely token-free via Trusted Publishing (OIDC); there is no automated `npm dist-tag rm` (see [Publish](#publish-publishyml)), so no npm secret exists in this repo at all. If you reintroduce automated dist-tag mutation, note that npm write tokens are capped at a 90-day lifetime and must be rotated.

## Trusted Publishing (OIDC)

Both publish paths (PR preview + release) use [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) instead of a long-lived `NPM_TOKEN`. At publish time GitHub's OIDC provider mints a one-shot, workflow-scoped credential, and npm auto-attaches a **provenance attestation** to each published version (the green "Provenance" badge on npmjs.com).

**Why one workflow file:** npm allows only **one** trusted publisher per package, and it matches the **caller** workflow's filename (not a reusable/downstream workflow). That is why all publishing lives in `publish.yml` — two separate workflows (or a shared reusable workflow invoked by two callers) cannot both be authorized for the same package.

How it is wired:

- Each publish job in `publish.yml` declares `permissions: id-token: write` so the runner can request an OIDC token.
- The runner installs an OIDC-capable npm (`npm install -g npm@latest`; needs npm ≥ 11.5.1 on Node ≥ 22.14) after `corepack enable`.
- `yarn publish:packages` runs `scripts/publish-packages.ts`, which shells out to the real `npm publish` (Yarn's `yarn npm publish` does not reliably exchange the OIDC token for workspaces). The script also rewrites the `workspace:` protocol to concrete versions before each publish, because — unlike `yarn npm publish` — bare `npm publish` does not strip it.

**Adding a package — required npmjs.com step:** Adding an entry to `scripts/release-packages.ts` is not sufficient. Every package must be registered as a Trusted Publisher on npmjs.com (Settings → "Trusted Publisher" → GitHub Actions) with a **single** entry:

| Field             | Value                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization      | `VirtoCommerce`                                                                                                                                       |
| Repository        | `vc-shell`                                                                                                                                            |
| Workflow filename | `publish.yml`                                                                                                                                         |
| Environment       | _(leave blank — the release job uses `npm-latest` / `npm-{channel}` environments, but pinning one here would reject PR-preview runs, which use none)_ |
| Allowed actions   | `npm publish`                                                                                                                                         |

Notes:

- npm matches on the workflow **filename only** (not path), case-sensitive, `.yml` required.
- Leave **Environment blank**: PR-preview runs have no environment, while the release job runs in `npm-latest`/`npm-alpha`/`npm-beta`/`npm-rc`. A pinned environment would reject one or the other.
- A package listed in `release-packages.ts` but **not** registered fails its first publish with a silent **404** on `PUT https://registry.npmjs.org/...`. This was the original failure mode that motivated the migration.

## Conventions Across Workflows

- **Node 22** — matches `engines.node` in root `package.json`.
- **Yarn 4 via Corepack** — `corepack enable` is always called before `yarn install`.
- **Yarn cache** — `actions/setup-node@v4` with `cache: "yarn"` restores / saves `.yarn/cache` keyed on `yarn.lock`.
- **`--immutable`** — CI install steps use `--immutable` to fail fast on lockfile drift, except the release-it `after:bump` hook where immutable is intentionally disabled to refresh `yarn.lock` after version bump. `ci.yml` has a dedicated "Lockfile drift hint" step that annotates the failure with recovery instructions.
- **Path filtering** — `ci.yml` is scoped to changes that can affect build/lint/tests; docs-only commits skip heavy verification.
