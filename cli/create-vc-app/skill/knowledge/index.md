# Knowledge Index — Route Map for Subagents

This file maps each generation task to the pattern files and framework docs files it should read. Subagents must load ONLY the resources listed for their task — not all 146 docs files.

---

## How to Resolve Docs Paths at Runtime

Docs are searched in priority order:

1. `node_modules/@vc-shell/framework/**/<name>.docs.md` (if project has framework installed)
2. `<VC_SHELL_FRAMEWORK_PATH>/**/<name>.docs.md` (if env var or `.vc-app.json` sets a path)
3. `cli/create-vc-app/skill/knowledge/docs/**/<name>.docs.md` (built-in fallback, updated at release)

Paths use **basename glob** format (`**/<name>.docs.md`) because the sync script preserves relative paths from `framework/`. For example, `useBlade.docs.md` lives at `core/composables/useBlade/useBlade.docs.md` — search by basename only.

Notable location: `useDataTableSort.docs.md` is under `ui/composables/`, not `core/composables/`.

---

## List Blade Generator

**Task:** Generates `<module>-list.vue` + `use<Entity>s` composable.

### Pattern files to read:
- `knowledge/patterns/list-blade-pattern.md`
- `knowledge/patterns/composable-list.md`
- `knowledge/patterns/toolbar-pattern.md`
- `knowledge/patterns/blade-navigation.md`

### Framework docs to read (basename glob):
- `**/vc-blade.docs.md`
- `**/vc-data-table.docs.md`
- `**/vc-pagination.docs.md`
- `**/useBlade.docs.md`
- `**/useAsync.docs.md`
- `**/useLoading.docs.md`
- `**/useDataTableSort.docs.md`

---

## Details Blade Generator

**Task:** Generates `<module>-details.vue` + `use<Entity>` composable.

### Pattern files to read:
- `knowledge/patterns/details-blade-pattern.md`
- `knowledge/patterns/composable-details.md`
- `knowledge/patterns/toolbar-pattern.md`
- `knowledge/patterns/blade-navigation.md`

### Framework docs to read (basename glob):
- `**/vc-blade.docs.md`
- `**/vc-form.docs.md`
- `**/vc-input.docs.md`
- `**/vc-select.docs.md`
- `**/vc-switch.docs.md`
- `**/useBlade.docs.md`
- `**/useAsync.docs.md`
- `**/useModificationTracker.docs.md`
- `**/useLoading.docs.md`
- `**/validation.docs.md`

---

## Module Assembler

**Task:** Creates `index.ts`, `pages/index.ts`, `composables/index.ts`, `locales/index.ts`, and registers the module in the app's module registry.

### Pattern files to read:
- `knowledge/patterns/module-structure.md`

### Framework docs to read:
_(None required — module assembly is purely structural.)_

---

## Locales Generator

**Task:** Generates `locales/en.json` with i18n keys for all requested blades.

### Pattern files to read:
_(None — reads the already-generated blade files to extract `$t(...)` and `t(...)` calls.)_

### Framework docs to read:
_(None required.)_

### Instructions:
1. Read all generated `.vue` files for the module.
2. Extract every `$t('...')` and `t('...')` call.
3. Build a nested JSON object from the dot-separated keys (e.g., `"TEAM.PAGES.LIST.TITLE"` → `{ "TEAM": { "PAGES": { "LIST": { "TITLE": "" } } } }`).
4. Fill in reasonable English placeholder strings based on the key name.

---

## API Analyzer

**Task:** Analyzes a generated API client file to discover available types and methods for user selection.

### Pattern files to read:
_(None — reads the API client file directly.)_

### Framework docs to read:
- `**/useApiClient.docs.md`
- `**/useAsync.docs.md`

---

## Type Checker

**Task:** Runs `vue-tsc --noEmit`, analyzes errors in generated files, proposes and applies fixes.

### Pattern files to read:
_(All relevant pattern files for the blade types involved — re-read before fixing.)_

### Framework docs to read:
_(Read docs for any component/composable that appears in the error output.)_
