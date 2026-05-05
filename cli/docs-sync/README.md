# @vc-shell/docs-sync

Internal CLI tool that publishes co-located `*.docs.md` files from the vc-shell framework to the public documentation site (vc-docs). Generates Markdown pages, copies image assets, validates the docs template, captures Storybook screenshots, and emits `awesome-pages` navigation files — all driven by frontmatter declared next to the source code.

This package is **internal**. It is not published to npm. It is invoked locally by maintainers and by GitHub Actions on framework releases.

> Design spec: `docs/superpowers/specs/2026-04-28-vc-shell-docs-sync-design.md`
> Implementation plan: `docs/superpowers/plans/2026-04-28-vc-shell-docs-sync.md`

---

## Why this exists

Documentation for `@vc-shell/framework` lives next to the code in `*.docs.md` files. The public docs site is a separate repository (`vc-docs`) built with mkdocs-material and versioned via [`mike`](https://github.com/jimporter/mike). Without automation those two sources drift — fixes to a component's docs file never reach users.

`docs-sync` is a one-way pipeline: framework `*.docs.md` → transformed Markdown in vc-docs. Manual pages in vc-docs (introduction, getting-started guides, how-tos) are untouched.

---

## Quick start

From the vc-shell repo root:

```bash
# 1. Validate every *.docs.md against the template
yarn docs:lint

# 2. Sync all docs into a sibling vc-docs checkout
yarn docs:sync

# 3. Capture a Storybook screenshot via Playwright
yarn docs:screenshot --story organisms-vc-data-table--default --out /tmp/preview.png
```

The root-level shortcuts assume `../vc-docs` exists as a sibling checkout. To target a different path:

```bash
yarn workspace @vc-shell/docs-sync exec docs-sync sync --target /custom/path/to/vc-docs
```

---

## Pipeline at a glance

```
┌──────────────────────┐
│  framework/**/*.docs.md │  ← source of truth (frontmatter + Markdown)
└──────────┬───────────┘
           │
           ▼
   ┌──────────────┐
   │   parser     │  zod-validate frontmatter, gray-matter body, extract image refs
   └───────┬──────┘
           ▼
   ┌──────────────┐
   │ transformer  │  strip-internal → expand-storybook → rewrite-links → AUTO-GENERATED header
   └───────┬──────┘
           ▼
   ┌──────────────┐
   │   writer     │  atomic write to target tree, copy image assets, emit .pages files
   └───────┬──────┘
           ▼
   ┌──────────────┐
   │   report     │  detect orphans, render markdown report, exit code
   └───────┬──────┘
           ▼
┌────────────────────────────────────┐
│  vc-docs/.../vc-shell/<category>/   │
│   ├── components/                   │
│   ├── composables/                  │
│   ├── concepts/                     │
│   └── reference/                    │
└────────────────────────────────────┘
```

The pipeline is deterministic and idempotent — running `yarn docs:sync` twice in a row produces zero changes the second time.

---

## The `*.docs.md` format

Every file destined for the public site declares its routing and metadata in frontmatter:

````markdown
---
title: VcDataTable
category: components
group: data-display
slug: vc-data-table # optional; defaults to source filename without `.docs`
---

# VcDataTable

Public-facing description (1–2 sentences for the developer using the framework).

## Quick Start

::storybook id="organisms-vc-data-table--default"

## Examples

### With Sorting

::storybook id="organisms-vc-data-table--with-sorting" height="500"

```vue
<VcDataTable :items="products">
  <VcColumn id="name" field="name" sortable />
</VcDataTable>
```
````

## Props

| Name  | Type  | Default | Description |
| ----- | ----- | ------- | ----------- |
| items | `T[]` | `[]`    | Row data.   |

<!-- internal:start -->

## Architecture notes

This block is for vc-shell contributors. Stripped from the public site.

<!-- internal:end -->

````

### Frontmatter contract

| Field      | Required | Allowed values                                                 |
| ---------- | -------- | -------------------------------------------------------------- |
| `title`    | yes      | Free text — used in mkdocs nav.                                |
| `category` | yes      | `components` / `composables` / `concepts` / `reference`        |
| `group`    | yes      | A folder under `category/`. See below.                         |
| `slug`     | no       | Filename in target without `.md`. Defaults to source filename. |
| `internal` | no       | `true` to skip this file entirely.                             |

### Allowed groups per category

| Category     | Groups                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| components   | `layout` · `form` · `data-display` · `feedback` · `navigation` · `media` · `misc`                                                                     |
| composables  | `blade-navigation` · `data` · `ui-state` · `services` · `user` · `notifications` · `forms` · `utilities`                                              |
| concepts     | `root` (single-level — files land directly in `concepts/<slug>.md`)                                                                                   |
| reference    | `api` · `api/directives` · `modules` · `cli`                                                                                                          |

A wrong `group` for the chosen `category` is rejected by `frontmatter-required` lint with a clear "allowed groups" message.

### Routing rules

Target path is computed as `<category>/<group>/<slug>.md`, with one special case: `group: root` flattens (no group folder).

| Source                                                                | Target                                       |
| --------------------------------------------------------------------- | -------------------------------------------- |
| `framework/ui/components/organisms/vc-data-table/vc-data-table.docs.md` | `components/data-display/vc-data-table.md`   |
| `framework/ui/composables/useDataTableSort.docs.md`                   | `composables/data/useDataTableSort.md`       |
| `framework/core/services/services.docs.md` (group: root)              | `concepts/services.md`                       |
| `framework/core/directives/loading/loading.docs.md`                   | `reference/api/directives/v-loading.md`      |

### Internal-only blocks

Wrap any contributor-only sections in `<!-- internal:start -->` / `<!-- internal:end -->` markers. The transformer strips them on every sync. Use this for architecture notes, gotchas, and references to internal file paths that don't belong in the public site.

### Storybook embeds

Use the `::storybook` directive to embed a live story:

```markdown
::storybook id="organisms-vc-data-table--with-filters" height="500" theme="dark"
````

| Param    | Purpose                                              | Default  |
| -------- | ---------------------------------------------------- | -------- |
| `id`     | Story ID matching the URL slug.                      | required |
| `height` | iframe height in px.                                 | `400`    |
| `theme`  | `light` / `dark` / `auto`. Sets `?globals=theme:..`. | `auto`   |

The directive expands at sync time into a styled iframe block plus an "Open in Storybook" link, both styled by `vc-shell-docs.css` in the docs site. Story IDs are validated against the live Storybook `index.json` — unknown IDs fail the lint.

### Image assets

Images referenced relative to the source file are copied alongside the Markdown:

```
framework/ui/components/organisms/vc-data-table/
  vc-data-table.docs.md
  images/
    column-resize.png
    mobile-card-view.png
```

```markdown
![Column resize](./images/column-resize.png)
```

The writer copies `./images/X.png` into the target tree at the parallel relative path. Allowed extensions: `png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`. Anything else is rejected by `image-size-limit` lint (also enforces 500 KB warn / 2 MB error budgets).

### Cross-doc links

Internal cross-references between two `*.docs.md` files (e.g. linking from `vc-button` to `vc-link`) are rewritten at sync time to point at the correct target path:

```markdown
<!-- in vc-button.docs.md -->

See also [VcLink](../vc-link).
```

becomes

```markdown
<!-- in components/misc/vc-button.md -->

See also [VcLink](../navigation/vc-link.md).
```

External URLs and anchor-only fragments are left alone. Image refs (`![...](...)`) are handled by the asset copier, not the link rewriter.

### AUTO-GENERATED marker

Every synced page begins with:

```markdown
<!-- AUTO-GENERATED FROM vc-shell — DO NOT EDIT MANUALLY -->
<!-- Source: framework/ui/components/.../X.docs.md -->
<!-- To update: edit the source file in vc-shell, then run yarn docs:sync -->
```

The vc-docs `.github/workflows/protect-generated.yml` workflow blocks PRs (other than from the bot) that try to edit files containing this marker.

---

## Commands

### `yarn docs:sync`

Walks `framework/**/*.docs.md`, applies the transform pipeline, and writes into a vc-docs checkout.

```bash
yarn docs:sync                                              # default --target ../vc-docs
yarn workspace @vc-shell/docs-sync exec docs-sync sync \
  --target /Users/me/DEV/vc-docs                            # explicit target
  --dry-run                                                 # report only, no writes
  --report ./my-report.md                                   # custom report path
  --framework-dir /alt/framework                            # override source root (testing)
```

Output:

```
vc-shell@v2.0.3 → /Users/me/DEV/vc-docs
  changes: 47
  skipped: 5
  orphans: 1
  errors:  0
  report:  /Users/me/.../sync-report.md
```

Exit code: `0` on success, `1` if any errors were recorded.

### `yarn docs:lint`

Runs all lint rules against every `*.docs.md` in `framework/`. Returns exit `1` on any error so CI can block bad PRs.

```bash
yarn docs:lint
```

Sample output:

````
warn  vue-block-present  framework/ui/.../vc-button.docs.md: component page contains no ```vue example block
error frontmatter-required  framework/ui/.../bad.docs.md: missing frontmatter

1 errors, 1 warnings
````

### `yarn docs:screenshot`

Capture a Playwright screenshot using the style-guide defaults below.

```bash
# Capture from a running dev server
yarn workspace @vc-shell/docs-sync exec docs-sync screenshot \
  --url http://localhost:3000/products \
  --selector ".vc-blade--list" \
  --out apps/vendor-portal/.../guides/blades/images/list-blade.png

# Capture a Storybook story
yarn workspace @vc-shell/docs-sync exec docs-sync screenshot \
  --story organisms-vc-data-table--with-filters \
  --theme dark \
  --viewport 1280x800 \
  --out framework/.../images/data-table-filters-dark.png
```

| Option       | Purpose                                                     |
| ------------ | ----------------------------------------------------------- |
| `--url`      | Direct URL (dev server, deployed site).                     |
| `--story`    | Storybook story ID. Loads `<storybookUrl>/iframe.html?id=…` |
| `--selector` | CSS selector to crop to. Default: full viewport.            |
| `--theme`    | `light` / `dark` for theme-aware components.                |
| `--viewport` | `<width>x<height>`. Default: `1280x800`.                    |
| `--out`      | Output file path. Required.                                 |

#### Screenshot style guide

| Rule           | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Viewport       | `1280×800` desktop, `390×844` mobile (iPhone 14 frame)                            |
| Pixel density  | `2×` (retina)                                                                     |
| Browser chrome | None (headless)                                                                   |
| Theme          | Both light + dark when visual differs meaningfully; light only otherwise          |
| Format         | `png` (Playwright limitation — webp post-process via `sharp` is a follow-up)      |
| Filename       | kebab-case, descriptive: `list-blade-with-filters.png`                            |
| Crop           | Crop to relevant CSS selector, not viewport. Avoid empty space.                   |
| Demo data      | Realistic — product names, prices, emails. **No "Test 1 / Test 2 / Lorem ipsum"** |
| Sensitive data | Never real customer data. Use seed fixtures or Storybook story args.              |

---

## Lint rules

`yarn docs:lint` runs six rules against every `*.docs.md`. Errors block CI; warnings are advisory.

| Rule                    | Severity                     | What it checks                                                                                                                  |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `frontmatter-required`  | error                        | Frontmatter is present and parses against the schema (title/category/group).                                                    |
| `storybook-id-valid`    | error                        | Every `::storybook id="X"` directive references a real story in `index.json`. Skipped gracefully when Storybook is unreachable. |
| `image-size-limit`      | warn @ 500 KB / error @ 2 MB | Referenced images stay under size budget. Allowed types: png/jpg/jpeg/gif/webp/svg.                                             |
| `vue-block-present`     | warn                         | Component pages should include at least one ` ```vue ` block.                                                                   |
| `material-feature-warn` | warn                         | Long pages (>200 lines) without any admonition / tabs / details / mermaid block — likely missing structure.                     |
| `mermaid-syntax`        | error                        | Each ` ```mermaid ` block is non-empty and starts with a known diagram keyword.                                                 |

---

## CI integration

Three GitHub Actions wire docs-sync into the release flow.

| Workflow                                  | Repo     | Trigger                                                       | Effect                                                                                      |
| ----------------------------------------- | -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `.github/workflows/docs-lint.yml`         | vc-shell | PR touching `*.docs.md` / `*.stories.ts` / `cli/docs-sync/**` | Runs `yarn docs:lint`. Failure blocks merge.                                                |
| `.github/workflows/sync-docs.yml`         | vc-shell | `release: published` (non-prerelease)                         | Syncs into vc-docs `main` and opens an auto-PR labeled `auto-generated` from a bot account. |
| `.github/workflows/protect-generated.yml` | vc-docs  | PR touching `vc-shell/**`                                     | Blocks edits to AUTO-GENERATED files unless from the bot or label `auto-generated`.         |

The release sync workflow requires repo secret `VC_DOCS_BOT_TOKEN` — a PAT or GitHub App token with `contents:write` and `pull-requests:write` on `VirtoCommerce/vc-docs`.

---

## Versioning model

vc-docs is versioned via [`mike`](https://github.com/jimporter/mike). Each major (`2.0`, `3.0`, …) lives on its own branch (`main` for current, `release/X.0` for frozen previous majors). vc-shell and vc-docs version **independently**.

Implications for docs-sync:

- Generator only ever writes to vc-docs `main`. Frozen `release/X.0` branches stay immutable.
- Each vc-shell release re-syncs into the active major. There's no per-release mapping table — `git log` of vc-docs gives the audit trail of which framework version produced which content.
- Live Storybook embeds in frozen snapshots will show the **latest** framework version (single Storybook deployment in Phase 1). A banner injected via `overrides/main.html` in vc-docs alerts users on numbered-release URLs ("Live demos may differ from documented version").
- Phase 2 follow-up: per-version Storybook deployments at `vc-shell-storybook.govirto.com/<docs-version>/`. The generator will read the active docs version from `vc-docs/VERSION` and substitute it into iframe URLs at sync time.

---

## Development

### Build and test

From the vc-shell repo root:

```bash
yarn workspace @vc-shell/docs-sync build       # tsc → dist/
yarn workspace @vc-shell/docs-sync test        # vitest run, 47 tests
yarn workspace @vc-shell/docs-sync test:watch  # vitest watch
```

### Project layout

```
cli/docs-sync/
  src/
    index.ts                        # CLI entry, commander setup
    config.ts                       # paths, allowed categories/groups, env override
    types.ts                        # Frontmatter, ParsedDoc, SyncReport, …
    commands/
      sync.ts                       # `sync` command
      lint.ts                       # `lint` command
      screenshot.ts                 # `screenshot` command
    parser/
      frontmatter.ts                # zod schema + cross-field refinement
      images.ts                     # extract relative ![alt](./path) refs
      parser.ts                     # gray-matter + frontmatter validation
    transformer/
      strip-internal.ts             # remove <!-- internal:* --> blocks
      storybook-directive.ts        # ::storybook → iframe HTML
      header.ts                     # AUTO-GENERATED header
      links.ts                      # rewrite cross-doc relative links
      pipeline.ts                   # orchestrator
    storybook/
      index-fetcher.ts              # download index.json, validate IDs
    writer/
      atomic.ts                     # write-file-atomic wrapper
      writer.ts                     # computeTargetPath + writeMarkdown
      assets.ts                     # copy referenced images
      pages.ts                      # emit .pages files for awesome-pages
    report/
      tracker.ts                    # accumulate change/skip/error/orphan entries
      orphans.ts                    # detect orphaned auto-generated files
      formatter.ts                  # render SyncReport → markdown
    screenshot/
      defaults.ts                   # style-guide constants
      capture.ts                    # Playwright wrapper
    lint/
      runner.ts                     # rules registry, runLint orchestrator
      rules/
        frontmatter-required.ts
        storybook-id-valid.ts
        image-size-limit.ts
        vue-block-present.ts
        material-feature-warn.ts
        mermaid-syntax.ts
  tests/
    *.test.ts                       # 14 unit + 1 integration test files
    fixtures/                       # *.docs.md fixtures (simple-component, integration source tree)
```

Tests use real `fs.mkdtemp` for isolation and `vi.spyOn(globalThis, "fetch")` to mock network calls.

### Adding a new lint rule

1. Implement `src/lint/rules/<rule-name>.ts` exporting a `LintRule` (object with `name` and `check(file, ctx) -> LintIssue[]` — sync or async).
2. Register it in `src/lint/runner.ts` `ALL_RULES`.
3. Add a test case to `tests/lint.test.ts`.
4. Update the **Lint rules** table in this README.

### Adding a new transformer step

1. Implement `src/transformer/<step>.ts` exporting a pure function `(body: string, ctx: TransformContext) => string`.
2. Wire it into `src/transformer/pipeline.ts` in the right order. Order matters — `strip-internal` runs before `expand-storybook` so internal blocks containing storybook directives don't get expanded.
3. Add unit tests for the step.

### Stack

- TypeScript ESM with `moduleResolution: "NodeNext"` (matches `cli/migrate`)
- Node 20+
- `commander` (CLI argv)
- `gray-matter` (frontmatter)
- `zod` (frontmatter schema)
- `globby` (file walking)
- `write-file-atomic` (safe atomic writes)
- `chalk` (terminal output)
- `@playwright/test` (screenshot)
- `vitest` (tests)

---

## Phase 0 — editorial pass

Before automation can produce useful docs the source files need a one-time editorial pass: 150 `*.docs.md` files normalised to the template (frontmatter added, sections aligned, contributor-only chunks wrapped in `<!-- internal:* -->`, examples added, Storybook embeds added). This is content work, not engineering work — done as a separate workstream over several PRs grouped by category.

Until Phase 0 is complete, `yarn docs:lint` reports many errors and warnings against the current framework. That's expected. CI for `docs-lint.yml` may need `continue-on-error: true` while Phase 0 is in flight.

---

## Troubleshooting

**`error frontmatter-required: missing frontmatter`** — the file has no `---` block at the top, or the block parses to an empty object. Add the four required fields.

**`error storybook-id-valid: unknown Storybook story id "X"`** — the story ID doesn't exist in the live Storybook `index.json`. Either the story was renamed in the `.stories.ts` file, or there's a typo in the directive. Check `https://vc-shell-storybook.govirto.com/index.json`.

**Sync exits 1 with no error in stdout** — open `sync-report.md` in the working directory; the full error list is there.

**Newly created `*.docs.md` is skipped without comment** — `yarn docs:lint` to surface the reason. Most often a frontmatter issue.

**`docs:sync` shows N orphans** — files in vc-docs that carry the AUTO-GENERATED marker but no longer have a matching source. Decide per-file: either restore the source (rename happened?), or delete the orphan in a follow-up PR. The generator never deletes orphans automatically.

**Screenshot command hangs / times out** — Playwright needs the chromium binary on first run. From inside the workspace: `yarn workspace @vc-shell/docs-sync exec playwright install chromium`.

**Storybook iframe inside synced docs shows the wrong version** — expected during Phase 1. See "Versioning model" above. The frozen-snapshot banner explains this to readers.

---

## Status (2026-05)

| Component                                | Status                          |
| ---------------------------------------- | ------------------------------- |
| `cli/docs-sync` package                  | ✅ shipped                      |
| 6 lint rules                             | ✅ shipped                      |
| Sync, lint, screenshot commands          | ✅ shipped                      |
| `docs-lint.yml` workflow (vc-shell)      | ✅ shipped                      |
| `sync-docs.yml` workflow (vc-shell)      | ✅ shipped                      |
| `protect-generated.yml` (vc-docs)        | ✅ on branch, awaiting merge    |
| `vc-shell-docs.css` (vc-docs)            | ✅ on branch, awaiting merge    |
| Frozen-version banner (vc-docs)          | ✅ on branch, awaiting merge    |
| Phase 0 editorial pass (150 files)       | ⏳ separate workstream          |
| Folder restructure in vc-docs            | ⏳ deferred until Phase 0 lands |
| Versioned Storybook deployment (Phase 2) | ⏳ follow-up                    |
| Auto-screenshot pipeline                 | ⏳ follow-up                    |
