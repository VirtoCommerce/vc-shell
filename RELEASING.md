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

## Commit Convention

Releases rely on [Conventional Commits](https://www.conventionalcommits.org/). PR titles are validated by the `PR Title` workflow on every pull request. Detailed conventions: [`.github/COMMIT_CONVENTION.md`](./.github/COMMIT_CONVENTION.md).

Commit types that surface in `CHANGELOG.md` (Angular preset):

- `feat` → Features
- `fix` → Bug Fixes
- `perf` → Performance Improvements

Filtered out (not shown in public changelog): `chore`, `docs`, `test`, `ci`, `build`, `style`, `refactor`, `revert`.

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
```

Output shows what release-it would do without making changes.

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
