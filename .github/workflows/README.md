# CI Workflows

Overview of every GitHub Actions workflow in this repository. Each workflow file starts with a header comment that repeats the essentials below.

| Workflow                       | File                             | Trigger                                                                  | Purpose                                                                                                                              | Required for merge? |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **CI**                         | `ci.yml`                         | pull_request, push to main / dev / feat/\*\*                             | Static checks (lint, format, stylelint, typecheck, locales, circular, layers) and framework unit tests                               | Yes                 |
| **PR Title**                   | `pr-title.yml`                   | pull_request (opened, edited, synchronize, reopened)                     | Validates the PR title is Conventional Commits format                                                                                | Yes                 |
| **Publish**                    | `publish.yml`                    | pull_request (opened, synchronize, reopened), workflow_dispatch          | One workflow for all npm publishing: `pr-<N>` previews on PR push and manual releases (version bump, CHANGELOG, tag, publish, GitHub Release). Both publish paths use OIDC — fully token-free | No (PR preview informational); manual for release |
| **Storybook**                  | `storybook-ci.yml`               | push to main / feat/redesign, pull_request (indirect), workflow_dispatch | Builds Storybook + Docker image, pushes to ghcr.io, deploys to ArgoCD (`vc-shell-storybook.govirto.com`)                             | No                  |

## CI (`ci.yml`)

Splits pre-merge verification into two parallel jobs:

- **`static-checks`** — after `yarn install --immutable`, runs each of the checks below as a separate step so the failing one is obvious in the Actions UI:
  - `yarn lint:check` (ESLint, `--max-warnings=0`)
  - `yarn format:check` (Prettier)
  - `yarn stylelint:check`
  - `yarn typecheck` (framework `check:types`)
  - `yarn check:locales`
  - `yarn check:circular` (madge)
  - `yarn check:layers`
- **`test`** — `yarn workspace @vc-shell/framework run test` (vitest, single run).

Both are **required status checks** in the branch ruleset on `main`.

## PR Title (`pr-title.yml`)

Uses [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request) to ensure the PR title starts with one of the allowed Conventional Commits types (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `ci`, `build`, `style`, `revert`) and doesn't start the subject with an uppercase letter.

Required because we squash-merge: the PR title becomes the single commit message on `main`, and `@release-it/conventional-changelog` uses those commits to auto-build stable CHANGELOG sections.

## Publish (`publish.yml`)

A **single** workflow owns every npm publish. This is a hard requirement of npm Trusted Publishing: a package can have only **one** trusted publisher, and npm matches the **caller** workflow's filename — so PR-preview and release publishing cannot be split across two files (or hidden behind a reusable workflow). See [Trusted Publishing (OIDC)](#trusted-publishing-oidc).

Jobs are gated by `github.event_name`:

### On `pull_request`

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
2. `yarn install --immutable` → `yarn check` → `yarn build`.
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

Two jobs:

- **`ci`** — builds Storybook bundle, packages the Docker image, pushes to `ghcr.io/virtocommerce/vc-shell-storybook`. Emits Jira build info.
- **`cd`** — on main / feat/redesign / PRs, calls `vc-build CloudEnvSetParameter` to update the ArgoCD `vcmp-dev` environment with the new image tag. Registers a Deployment in the `storybook-dev` environment pointing at the hosted Storybook URL.

## Common Secrets

| Secret                                                  | Used by                                          | Purpose                                                                          |
| ------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `REPO_TOKEN`                                            | Publish (`release`)                              | PAT for `vc-ci` bot; pushes release commits/tags past the ruleset                |
| `VCMP_PLATFORM_TOKEN`                                   | Storybook CI (`cd`)                              | ArgoCD deployment via `vc-build`                                                 |
| `CLIENT_ID`, `CLIENT_SECRET`, `CLOUD_INSTANCE_BASE_URL` | Storybook CI                                     | Jira build info integration (optional)                                           |
| `GITHUB_TOKEN`                                          | All workflows (built-in)                         | Posting PR comments, creating GitHub Releases                                    |

> **No `NPM_TOKEN`.** npm publishing is entirely token-free via Trusted Publishing (OIDC); there is no automated `npm dist-tag rm` (see [Publish](#publish-publishyml)), so no npm secret exists in this repo at all. If you reintroduce automated dist-tag mutation, note that npm write tokens are capped at a 90-day lifetime and must be rotated.

## Trusted Publishing (OIDC)

Both publish paths (PR preview + release) use [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) instead of a long-lived `NPM_TOKEN`. At publish time GitHub's OIDC provider mints a one-shot, workflow-scoped credential, and npm auto-attaches a **provenance attestation** to each published version (the green "Provenance" badge on npmjs.com).

**Why one workflow file:** npm allows only **one** trusted publisher per package, and it matches the **caller** workflow's filename (not a reusable/downstream workflow). That is why all publishing lives in `publish.yml` — two separate workflows (or a shared reusable workflow invoked by two callers) cannot both be authorized for the same package.

How it is wired:

- Each publish job in `publish.yml` declares `permissions: id-token: write` so the runner can request an OIDC token.
- The runner installs an OIDC-capable npm (`npm install -g npm@latest`; needs npm ≥ 11.5.1 on Node ≥ 22.14) after `corepack enable`.
- `yarn publish:packages` runs `scripts/publish-packages.ts`, which shells out to the real `npm publish` (Yarn's `yarn npm publish` does not reliably exchange the OIDC token for workspaces). The script also rewrites the `workspace:` protocol to concrete versions before each publish, because — unlike `yarn npm publish` — bare `npm publish` does not strip it.

**Adding a package — required npmjs.com step:** Adding an entry to `scripts/release-packages.ts` is not sufficient. Every package must be registered as a Trusted Publisher on npmjs.com (Settings → "Trusted Publisher" → GitHub Actions) with a **single** entry:

| Field             | Value                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| Organization      | `VirtoCommerce`                                                         |
| Repository        | `vc-shell`                                                              |
| Workflow filename | `publish.yml`                                                           |
| Environment       | _(leave blank — the release job uses `npm-latest` / `npm-{channel}` environments, but pinning one here would reject PR-preview runs, which use none)_ |
| Allowed actions   | `npm publish`                                                           |

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
