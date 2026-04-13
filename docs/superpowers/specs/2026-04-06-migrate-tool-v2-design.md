# @vc-shell/migrate v2 — Reliability & Coverage Improvements

## Context

After testing the migrator on 4 real applications (push-messages, news, pagebuilder, task-management), multiple infrastructure bugs were found and fixed in-session. This spec covers the remaining architectural improvements needed to make the migrator production-quality.

## Goals

1. **Dependency graph** — explicit ordering between transforms to prevent sequencing bugs
2. **Idempotency** — re-running migration produces no changes on already-migrated code
3. **Migration report** — `MIGRATION_REPORT.md` generated after migration with actionable items
4. **New simple transforms** — 4 additional transforms covering guides 04, 12, 21 (complete), 33

## Non-Goals

- Interactive mode (`--interactive`)
- Post-migration `vue-tsc` validation
- Complex transforms: moment-to-datefns, vc-table-to-data-table, login-form

---

## 0. Runner Refactoring

### Problem

`runner.ts` is ~400 lines doing everything: file scanning, SFC parsing, dedup, validation, transform orchestration, dependency updates. Adding features (topological sort, report) will make it worse.

### Design

Split into focused modules:

| Module | Responsibility |
|--------|---------------|
| `runner.ts` | Orchestration only: select → sort → run → report (~120 lines) |
| `file-scanner.ts` | `findFiles()`, `collectNotifyTypeMap()`, `DEFAULT_EXCLUDES` |
| `sfc-processor.ts` | `preDedupSource()`, `collapseMultiLineImports()`, `parseValidate()` |
| `dep-updater.ts` | `updateDependencyVersions()` |
| `report-generator.ts` | `generateMigrationReport()` (new, Task 5) |

Additionally, standardize diagnostic output: all transforms must use `api.report()` instead of direct `console.log`. Files with violations: `use-assets-migration.ts`, `dynamic-properties-refactor.ts`, `use-blade-form.ts`.

---

## 1. Dependency Graph

### Problem

Transform order is implicit (array position in `registry.ts`). `blade-props-simplification` depends on `define-options-to-blade` having run first (needs `defineOptions`/`defineBlade` for its guard), but was positioned before it.

### Design

Add optional `after` field to `VersionedTransform`:

```ts
interface VersionedTransform {
  // ... existing fields
  after?: string[];  // transform names that must run before this one
}
```

Runner changes in `runner.ts`:
1. After `selectTransforms()`, topologically sort `selected` using `after` edges
2. Transforms without `after` retain their current relative order (stable sort)
3. Cycle detection: if a cycle exists, throw with descriptive error at startup (before any files are touched)

### Dependencies to declare

| Transform | after |
|-----------|-------|
| `blade-props-simplification` | `["define-options-to-blade"]` |
| `define-options-to-blade` | `["use-blade-migration"]` |
| `remove-pathmatch-route` | `["use-blade-migration"]` |

Implementation: topological sort function (~30 lines) in `runner.ts`, Kahn's algorithm. Falls back to registry order for transforms with no `after`.

---

## 2. Idempotency

### Problem

Re-running migration modifies already-migrated files (dedup reformats, project-scoped transforms re-apply).

### Design

Three fixes:

**2a. Runner dedup guard** — in `runner.ts`, skip `deduplicateImportSpecifiers` when `result === source` (transform returned modified content that is identical after dedup):

```ts
// Current
if (result != null && result !== source) {
  result = deduplicateImportSpecifiers(result, j);
  // ...
}

// Fixed: also skip dedup if it produces same output
if (result != null && result !== source) {
  try {
    const deduped = deduplicateImportSpecifiers(result, j);
    result = deduped !== result ? deduped : result;
  } catch { /* use result as-is */ }
  // ...
}
```

This is already mostly correct — the real issue is that dedup can reformat whitespace without semantic changes. Fix: compare after trimming trailing whitespace per line.

**2b. Project-scoped transform guards** — `nswag-class-to-interface` already skips files with no `new DtoClass()`. `shims-to-globals` already checks `currentTypes.includes(GLOBALS_ENTRY)`. Verify both are truly no-op on second run.

**2c. Test** — integration test: run full pipeline on a fixture, run again, assert zero files modified on second pass.

---

## 3. Migration Report

### Problem

Migration output goes to console and is lost. No actionable document for manual follow-up.

### Design

After all transforms complete, generate `MIGRATION_REPORT.md` in `options.cwd`:

```markdown
# Migration Report: {currentVersion} → {targetVersion}
Generated: {date}

## Automated Changes ({totalModified} files)
- ✅ define-app-module — 1 file
- ✅ useBlade — 4 files
- ...

## Manual Migration Required
- ⚠ **useWidgets → useBladeWidgets** — `src/pages/messageDetails.vue`
  API completely changed. [Migration guide →](migration/13-widgets.md)
- ...

## Rolled Back (parse errors)
- ⟲ `src/file.vue` — SFC parse error after transform

## Not Covered by Migrator
- 03-moment-to-datefns — `grep -rn "moment" src/`
- 16-login-form — review useLogin composable
- ...
```

Implementation:
- Collect `TransformReport[]` (already exists in runner)
- Collect `api.report()` messages (already collected per-transform)
- New function `generateMigrationReport(reports, options)` → writes file
- "Not Covered" section: static list of guides without transforms, each with a grep command. Filter by scanning `sourceFiles` for relevance (e.g., only show "moment" guide if `moment` is found in source).
- Skip report generation in `--dry-run` mode
- `--no-report` flag to opt out

---

## 4. New Transforms

### 4a. Complete injection-keys (guide 21)

Extend `remove-deprecated-aliases.ts` rename map with missing entry:

| Old | New |
|-----|-----|
| `NotificationTemplatesSymbol` | `NotificationTemplatesKey` |

`BladeInstance` stays as diagnostic-only (already fixed in this session — needs `useBlade()` not a rename).

String inject keys (`inject("isMobile")` etc.) are already handled by `responsive-composable` transform.

### 4b. `replace-cover-method` (guide 12)

Diagnostic-only: detect `replaceWith` usage and report that semantics changed. `replaceWith` now truly replaces (destroys old blade). Code using old `replaceWith` to "hide and open on top" should use `coverWith`.

```ts
// Scan for replaceWith calls, report with guidance
api.report(`${path}: replaceWith() semantics changed. If you relied on the old blade staying alive, use coverWith() instead.`);
```

Template transform: not needed (replaceWith is script-only).

### 4c. `locale-imports` (guide 33)

Rewrite framework locale imports:

```ts
// Before
import en from '@vc-shell/framework/dist/locales/en.json'
// After  
import en from '@vc-shell/framework/locales/en'
```

Implementation: find `ImportDeclaration` with source matching `@vc-shell/framework/dist/locales/*.json`, rewrite to `@vc-shell/framework/locales/{name}` (strip `.json`, strip `dist/`).

File extensions: `.ts` only.

### 4d. `window-globals` (guide 04)

Diagnostic-only: scan for `window.Vue`, `window._`, `window.moment`, `window.VcShellFramework`, etc. Report each occurrence with migration guidance.

Not a mechanical rewrite — the replacement depends on context (dynamic module vs app code). Report file/line with specific advice per global.

---

## 5. Testing

### New tests

- **Dependency graph**: unit test for topological sort — correct ordering, cycle detection
- **Idempotency**: integration test — run pipeline twice on fixture, second run modifies 0 files
- **Migration report**: integration test — verify report file generated with expected sections
- **New transforms**: standard unit tests per transform (input → output or input → diagnostic)

### Existing test updates

- `select-transforms.test.ts` — update count for new transforms
- `full-migration.test.ts` — update count

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/runner.ts` | Slim down to orchestration only (~120 lines) |
| `src/file-scanner.ts` | New — extracted findFiles, collectNotifyTypeMap |
| `src/sfc-processor.ts` | New — extracted preDedupSource, parseValidate |
| `src/dep-updater.ts` | New — extracted updateDependencyVersions |
| `src/report-generator.ts` | New — MIGRATION_REPORT.md generation |
| `src/transforms/types.ts` | Add `after?: string[]` to `VersionedTransform` |
| `src/transforms/registry.ts` | Add `after` to relevant transforms, add new transforms |
| `src/cli.ts` | Add `--no-report` flag |
| `src/transforms/remove-deprecated-aliases.ts` | Add `NotificationTemplatesSymbol` to rename map |
| `src/transforms/replace-cover-method.ts` | New — diagnostic-only |
| `src/transforms/locale-imports.ts` | New — rewrite import paths |
| `src/transforms/window-globals.ts` | New — diagnostic-only |
| `tests/runner/topological-sort.test.ts` | New |
| `tests/integration/idempotency.test.ts` | New |
| `tests/integration/migration-report.test.ts` | New |
| `tests/transforms/*/transform.test.ts` | New tests for new transforms |
