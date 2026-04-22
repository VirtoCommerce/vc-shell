# CI Workflows

Overview of every GitHub Actions workflow in this repository. Each workflow file starts with a header comment that repeats the essentials below.

| Workflow       | File               | Trigger                                                                  | Purpose                                                                                                                              | Required for merge? |
| -------------- | ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **CI**         | `ci.yml`           | pull_request, push to main / dev / feat/\*\*                             | Static checks (lint, format, stylelint, typecheck, locales, circular, layers) and framework unit tests                               | Yes                 |
| **PR Title**   | `pr-title.yml`     | pull_request (opened, edited, synchronize, reopened)                     | Validates the PR title is Conventional Commits format                                                                                | Yes                 |
| **PR Preview** | `pr-preview.yml`   | pull_request (opened, synchronize, reopened, closed)                     | Publishes preview npm packages with `pr-<N>` dist-tag; removes the tag on PR close; posts install instructions as a PR comment       | No (informational)  |
| **Release**    | `release.yml`      | workflow_dispatch                                                        | Cuts a release: bumps versions, updates CHANGELOG (stable only), commits and tags, publishes to npm, creates GitHub Release (stable) | N/A (manual)        |
| **Storybook**  | `storybook-ci.yml` | push to main / feat/redesign, pull_request (indirect), workflow_dispatch | Builds Storybook + Docker image, pushes to ghcr.io, deploys to ArgoCD (`vc-shell-storybook.govirto.com`)                             | No                  |

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

## PR Preview (`pr-preview.yml`)

Three jobs:

- **`publish`** — PRs opened from a branch in this repository (not a fork). Computes a preview version `<current>-pr<N>.<sha7>`, syncs it to every workspace manifest via `scripts/compute-preview-version.ts`, runs `yarn publish:packages --tag pr-<N>`, and updates a PR comment with install instructions.
- **`notify-fork`** — Fork-origin PRs. Posts a one-time comment explaining previews aren't available for forks (GitHub doesn't expose secrets to fork workflows).
- **`cleanup`** — On PR close, removes the `pr-<N>` dist-tag from every managed package via `npm dist-tag rm`. Published versions remain in npm for archaeology; only the tag is cleaned up.

Install a preview in a consuming project:

```bash
npm install @vc-shell/framework@pr-<N>
```

## Release (`release.yml`)

Manual `workflow_dispatch` with three inputs:

- `release-type` — `patch` / `minor` / `major`
- `prerelease` — `none` (stable) / `alpha` / `beta` / `rc`
- `dry-run` — `true` / `false`

Steps:

1. Checkout with `secrets.REPO_TOKEN` (vc-ci bot, admin) so the release commit and tag push past the ruleset.
2. `yarn install --immutable` → `yarn check` → `yarn build`.
3. Configure git user as `vc-ci`.
4. Run `release-it` with the computed args. `PRERELEASE_CHANNEL` is exposed to `.release-it.cjs`, which conditionally enables/disables the CHANGELOG plugin and GitHub Release creation. During `after:bump`, release-it runs `yarn install` with `YARN_ENABLE_IMMUTABLE_INSTALLS=false` so the lockfile can be updated after workspace version bump.
5. For non-dry runs: configure npm auth and `yarn publish:packages --tag <channel>`, then verify dist-tags.

Creates a **GitHub Release** entry only for stable releases (`prerelease: none`). Prereleases produce a git tag and npm publish but skip the Release entry to avoid cluttering `/releases`.

Each run registers a **Deployment** in the `npm-<channel>` environment (`npm-latest`, `npm-alpha`, `npm-beta`, `npm-rc`), visible on the repository's Deployments tab with a URL pointing at the package on npmjs.

See `RELEASING.md` for the end-to-end release flow.

## Storybook CI (`storybook-ci.yml`)

Two jobs:

- **`ci`** — builds Storybook bundle, packages the Docker image, pushes to `ghcr.io/virtocommerce/vc-shell-storybook`. Emits Jira build info.
- **`cd`** — on main / feat/redesign / PRs, calls `vc-build CloudEnvSetParameter` to update the ArgoCD `vcmp-dev` environment with the new image tag. Registers a Deployment in the `storybook-dev` environment pointing at the hosted Storybook URL.

## Common Secrets

| Secret                                                  | Used by                  | Purpose                                                           |
| ------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `REPO_TOKEN`                                            | Release                  | PAT for `vc-ci` bot; pushes release commits/tags past the ruleset |
| `NPM_TOKEN`                                             | Release, PR Preview      | npm publish + dist-tag management                                 |
| `VCMP_PLATFORM_TOKEN`                                   | Storybook CI (`cd`)      | ArgoCD deployment via `vc-build`                                  |
| `CLIENT_ID`, `CLIENT_SECRET`, `CLOUD_INSTANCE_BASE_URL` | Storybook CI             | Jira build info integration (optional)                            |
| `GITHUB_TOKEN`                                          | All workflows (built-in) | Posting PR comments, creating GitHub Releases                     |

## Conventions Across Workflows

- **Node 22** — matches `engines.node` in root `package.json`.
- **Yarn 4 via Corepack** — `corepack enable` is always called before `yarn install`.
- **Yarn cache** — `actions/setup-node@v4` with `cache: "yarn"` restores / saves `.yarn/cache` keyed on `yarn.lock`.
- **`--immutable`** — CI install steps use `--immutable` to fail fast on lockfile drift, except the release-it `after:bump` hook where immutable is intentionally disabled to refresh `yarn.lock` after version bump. `ci.yml` has a dedicated "Lockfile drift hint" step that annotates the failure with recovery instructions.
- **Path filtering** — `ci.yml` is scoped to changes that can affect build/lint/tests; docs-only commits skip heavy verification.
