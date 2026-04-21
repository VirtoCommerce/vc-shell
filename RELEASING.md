# Releasing VC-Shell Monorepo

## Commit Convention

This repository uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages drive version bump recommendations and changelog content.

Format:

```text
<type>[scope]: description

[optional body]

[optional footer]
```

Common types used in changelogs:

- `feat` -> Features
- `fix` -> Bug Fixes
- `perf` -> Performance
- `refactor` -> Refactoring
- `docs` -> Documentation
- `test` -> Tests

## What Happens During Release

`release-it` is configured in `.release-it.json`.

On every release run:

1. Root version is bumped.
2. Root `CHANGELOG.md` is updated from conventional commits.
3. Workspace package versions are synced to the same version.
4. Package-level changelogs are generated (commit-path scoped).
5. Boilerplate/template `@vc-shell/*` versions are synced.
6. `apps/*` `@vc-shell/*` dependencies are synced.
7. Release commit and tag are created and pushed.

Tag format: `v<version>`

Release commit message format: `chore(release): v<version>`

## Managed Packages

All release-managed workspace packages share the same version:

- `framework` (`@vc-shell/framework`)
- `cli/api-client` (`@vc-shell/api-client-generator`)
- `cli/create-vc-app` (`@vc-shell/create-vc-app`)
- `configs/vite-config` (`@vc-shell/config-generator`)
- `configs/ts-config` (`@vc-shell/ts-config`)

## Prerequisites

Before releasing:

- be on an allowed branch (`main` or `feat/*`)
- ensure clean working tree (`git status`)
- ensure branch is up to date (`git pull`)

## Dry Run

```bash
yarn release:dry
```

This prints the release plan without writing files, creating commits, tags, or pushes.

## Stable Releases

Interactive/default release:

```bash
yarn release
```

Force explicit bump:

```bash
yarn release patch
yarn release minor
yarn release major
```

## Prereleases

Start a prerelease line (examples):

```bash
yarn release major --preRelease=beta   # -> 2.0.0-beta.0
yarn release minor --preRelease=alpha  # -> 1.1.0-alpha.0
```

Continue current prerelease line:

```bash
yarn release --preRelease              # -> beta.1, beta.2, ...
```

Switch prerelease channel:

```bash
yarn release --preRelease=rc           # -> rc.0
```

Finalize to stable:

```bash
yarn release major
# or minor/patch depending on target
```

## Regenerate Full Changelogs

To regenerate **all** changelogs from full git history:

```bash
yarn generate:changelogs
```

This regenerates:

- root `CHANGELOG.md` (all commits)
- each managed package `CHANGELOG.md` using `--commit-path`

Use this when bootstrapping release history or rebuilding changelogs from scratch.
