# Releasing vc-shell

Releases are cut from `main` via a GitHub Actions workflow. Only maintainers with repository admin (or the `vc-ci` bot) can trigger a release.

## Workflow

1. Go to **Actions** → **Release** in the repository.
2. Click **Run workflow**.
3. Choose inputs:
   - **Release type**: `patch`, `minor`, or `major` (semver bump).
   - **Prerelease channel**:
     - `none` — stable release (publishes to npm with tag `latest`).
     - `alpha`, `beta`, or `rc` — prerelease (publishes with matching npm tag).
   - **Dry-run**: if true, runs preflight + release-it in dry-run mode (no commit, no push, no publish). Use for verification.
4. Click **Run workflow**.

The workflow:

- Runs preflight (`yarn check`) and builds all packages.
- Bumps versions in all workspace manifests and updates the lockfile.
- If stable: updates `CHANGELOG.md` with an entry consolidating all commits since the previous stable tag (including those that landed in intermediate alpha/beta releases).
- If prerelease: leaves `CHANGELOG.md` untouched.
- Commits the release bump (`release: v<version>`), creates an annotated tag (`v<version>`), and pushes both to `main`.
- Publishes the updated packages to npm with the appropriate dist-tag.
- Verifies the published dist-tags.

## Release Cycles

Typical paths through the workflow, assuming the repo is currently at `2.0.0-alpha.33`.

### Cut another alpha

Work accumulates in `main` via PRs. When ready to publish a dev preview:

- Actions → Release → Run workflow
- `release-type: patch`, `prerelease: alpha`, `dry-run: false`
- Result: `2.0.0-alpha.34`, npm dist-tag `alpha` updated. `CHANGELOG.md` unchanged.

Consumers:

```bash
npm install @vc-shell/framework@alpha
```

Repeat as many times as needed — `alpha.35`, `alpha.36`, etc. Each run picks up all commits landed since the previous alpha.

### Promote alpha to beta

When the alpha line is stable enough to invite broader testing:

- Actions → Release → Run workflow
- `release-type: patch`, `prerelease: beta`, `dry-run: false`
- Result: `2.0.0-beta.0`, npm dist-tag `beta` created. `alpha` dist-tag stays at its last alpha version.

Subsequent betas: `patch` + `beta` again → `2.0.0-beta.1`, `beta.2`, etc.

### Release candidate

Same pattern with `prerelease: rc` → `2.0.0-rc.0`, `rc.1`, etc.

### Cut a stable release

When ready to ship:

- Actions → Release → Run workflow
- `release-type: minor` (or whatever final bump you want), `prerelease: none`, `dry-run: false`
- Result: `2.0.0` (clean, no suffix), npm dist-tag `latest` updated.
- `CHANGELOG.md` gets a new section consolidating every commit from the previous stable tag to `HEAD` — including everything that shipped in alpha/beta/rc along the way.

After stable, the next alpha cycle starts from the next version (e.g. `2.1.0-alpha.0`).

### Comparison to PR previews

PR previews (automatic, per commit, dist-tag `pr-<N>`) and prereleases (manual, incremented counter, dist-tag `alpha`/`beta`/`rc`) are separate channels:

|           | PR preview                        | alpha/beta/rc                            |
| --------- | --------------------------------- | ---------------------------------------- |
| Trigger   | Automatic on every PR push        | Manual via `Release` workflow            |
| Version   | `<current>-pr<N>.<sha7>`          | `<next>-alpha.N` (counter increments)    |
| npm tag   | `pr-<N>` (removed when PR closes) | `alpha` / `beta` / `rc` (permanent)      |
| Audience  | Maintainer debug loop             | External testers / CI of downstream apps |
| CHANGELOG | Skipped                           | Skipped                                  |

See [CONTRIBUTING.md — Testing PR Previews](./CONTRIBUTING.md#testing-pr-previews) for the PR flow.

## Commit Convention

Releases rely on [Conventional Commits](https://www.conventionalcommits.org/). PR titles are validated by the `PR Title` workflow on every pull request. Detailed conventions: [`.github/COMMIT_CONVENTION.md`](./.github/COMMIT_CONVENTION.md).

Commit types that surface in `CHANGELOG.md` (Angular preset):

- `feat` → Features
- `fix` → Bug Fixes
- `perf` → Performance Improvements

For stable consolidation (`2.x.y` without prerelease suffix), changelog generation now keeps all conventional commit types from the stable baseline range (including `chore`, `docs`, `test`, `ci`, `build`, `style`, `refactor`, `revert`) so alpha/beta/rc work is not lost.

## Managed Packages

All release-managed workspace packages share the same version:

- `framework` (`@vc-shell/framework`)
- `cli/api-client` (`@vc-shell/api-client-generator`)
- `cli/create-vc-app` (`@vc-shell/create-vc-app`)
- `cli/migrate` (`@vc-shell/migrate`)
- `cli/vc-app-skill` (`@vc-shell/vc-app-skill`)
- `configs/vite-config` (`@vc-shell/config-generator`)
- `configs/ts-config` (`@vc-shell/ts-config`)
- `packages/mf-config` (`@vc-shell/mf-config`)
- `packages/mf-host` (`@vc-shell/mf-host`)
- `packages/mf-module` (`@vc-shell/mf-module`)

## Local Dry-Run

Before triggering the workflow in production, you can simulate locally:

```bash
yarn release:dry                          # simulates stable release
PRERELEASE_CHANNEL=alpha yarn release:dry # simulates alpha release (no CHANGELOG)
RELEASE_PREFLIGHT_NO_CACHE=1 yarn release:dry # force full preflight (ignore cache)
```

Output shows what release-it would do without making changes.
`yarn release:dry` caches the last successful preflight run in `.yarn/.cache/release-preflight.json` and skips repeated checks when git state and inputs are unchanged.

## Regenerating Full Changelog

To regenerate `CHANGELOG.md` from full git history (e.g., after cleaning up stale alpha entries):

```bash
yarn generate:changelogs
```

This regenerates:

- Root `CHANGELOG.md` (all commits)
- Each managed package `CHANGELOG.md` using `--commit-path`

Use when bootstrapping or auditing.

## Auth

The `Release` workflow uses `secrets.REPO_TOKEN` (bot account `vc-ci`, repository admin role) for pushing the release commit and tag to `main`. This token bypasses the branch protection ruleset via the `Repository admin` role. Publishing to npm uses `secrets.NPM_TOKEN`.
