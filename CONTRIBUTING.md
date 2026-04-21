# Contributing to vc-shell

Thanks for your interest in contributing. This document describes the workflow for submitting changes.

## Development Setup

See the [Getting Started](./README.md#getting-started) section of the README for prerequisites and install instructions.

## Workflow

1. **Fork** this repository to your GitHub account.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/<your-handle>/vc-shell.git
   cd vc-shell
   yarn install
   ```

3. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

   Branch naming: `feat/<short-description>`, `fix/<short-description>`, `docs/<short-description>`, etc.

4. **Make your changes**. Keep commits focused; prefer small, logical units.

5. **Run checks locally** before pushing:

   ```bash
   yarn check                                      # full verification
   yarn workspace @vc-shell/framework run test     # unit tests
   ```

6. **Push** to your fork and **open a PR** against `main` in this repo.

## PR Requirements

Your PR must:

- **Have a title in [Conventional Commits](https://www.conventionalcommits.org/) format**. Automated check enforces this. Examples:
  - `feat(table): add column resize`
  - `fix(blade): memory leak on close`
  - `docs(readme): update installation steps`
- **Pass CI**: `CI / static-checks`, `CI / test`, and `PR Title` must be green.
- **Be up to date with `main`** (rebase before requesting merge if needed).
- **Have review approval** from a CODEOWNER (auto-assigned).

All PRs are **squash-merged** into `main`: your commits within the PR are collapsed into a single commit with the PR title as its message. The PR number is automatically appended (e.g. `feat(table): add column resize (#123)`).

## Commit Conventions

Detailed conventions: [`.github/COMMIT_CONVENTION.md`](./.github/COMMIT_CONVENTION.md).

## Testing PR Previews

Every push to a PR (opened from a branch in this repository) automatically publishes preview versions of all managed packages to npm with a `pr-<N>` dist-tag. The preview workflow comments on the PR with install instructions.

To test a preview in a consuming project:

```bash
npm install @vc-shell/framework@pr-<N>
```

Or pin to a specific commit:

```bash
npm install @vc-shell/framework@<current>-pr<N>.<sha7>
```

Previews use the exact PR commit — each push creates a new version. The `pr-<N>` dist-tag is automatically removed when the PR closes; pinned exact-version installs continue to work (versions remain in npm for archaeology).

**Fork PRs**: external contributor PRs from forks do not get automatic previews (GitHub secrets are unavailable to fork workflows). Maintainers can cherry-pick fork changes into a branch in this repository to trigger a preview.

## Releasing

Releases are cut from `main` by maintainers via the `Release` GitHub Actions workflow. Contributors don't need to update `CHANGELOG.md` — stable releases auto-generate entries from conventional commit messages. See [`RELEASING.md`](./RELEASING.md) for details.
