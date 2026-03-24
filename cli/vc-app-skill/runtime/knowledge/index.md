# Knowledge Index — Route Map for Subagents

This file maps each generation task to the pattern files and framework docs files it should read. Subagents must load ONLY the resources listed for their task — not all 146 docs files.

---

## How to Resolve Docs Paths at Runtime

Docs are searched in priority order:

1. `node_modules/@vc-shell/framework/**/<name>.docs.md` (if project has framework installed)
2. `<VC_SHELL_FRAMEWORK_PATH>/**/<name>.docs.md` (if env var or `.vc-app.json` sets a path)
3. `node_modules/@vc-shell/vc-app-skill/runtime/knowledge/docs/**/<name>.docs.md` (built-in fallback, updated at release)

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

**Core table components (always read):**
- `**/vc-blade.docs.md`
- `**/vc-data-table.docs.md`
- `**/vc-pagination.docs.md`

**Cell renderer components (read for custom #body slots in VcColumn):**
- `**/vc-status.docs.md` — for status/state columns (variant-colored badge)
- `**/vc-status-icon.docs.md` — for boolean columns (check/cross icon)
- `**/vc-badge.docs.md` — for count/tag columns (numeric badge, category tag)
- `**/vc-image.docs.md` — for image/avatar/thumbnail columns
- `**/vc-link.docs.md` — for clickable URL/email columns
- `**/vc-progress.docs.md` — for percentage/progress columns
- `**/vc-rating.docs.md` — for rating columns (read-only stars)
- `**/vc-tooltip.docs.md` — for columns with truncated text that need hover detail

**Composable docs (always read):**
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

**Core form components (always read):**
- `**/vc-blade.docs.md`
- `**/vc-form.docs.md`
- `**/vc-input.docs.md`
- `**/vc-select.docs.md`
- `**/vc-switch.docs.md`

**Extended form components (read based on field types — see Field Type → Component Mapping in details-blade-pattern.md):**
- `**/vc-textarea.docs.md` — for `text` / `rich-text` fields
- `**/vc-editor.docs.md` — for `rich-text` fields (WYSIWYG HTML editor)
- `**/vc-date-picker.docs.md` — for `date-time` fields (calendar widget, preferred over VcInput type="datetime-local")
- `**/vc-checkbox.docs.md` — for `boolean` fields (alternative to VcSwitch for "agree/accept" semantics)
- `**/vc-checkbox-group.docs.md` — for `multi-select` fields with few static options
- `**/vc-radio-group.docs.md` — for `enum` fields with 2-5 options
- `**/vc-input-currency.docs.md` — for `currency` fields (formatted monetary input)
- `**/vc-multivalue.docs.md` — for `multi-select` / `tags` fields (tag-style multi-picker)
- `**/vc-rating.docs.md` — for `rating` fields (star rating)
- `**/vc-slider.docs.md` — for `range` fields (numeric slider)
- `**/vc-color-input.docs.md` — for `color` fields
- `**/vc-file-upload.docs.md` — for `file` fields (file attachment upload)
- `**/vc-input-group.docs.md` — for grouped inputs (prefix/suffix patterns like URL, phone)

**Read-only display components (read when blade has view-only fields):**
- `**/vc-field.docs.md` — for read-only key-value display (horizontal label:value, copyable, tooltip). Use instead of VcInput for non-editable data.

**Layout & display components (read when the form has sections or read-only data):**
- `**/vc-card.docs.md` — for grouping form sections visually (ALWAYS use for 3+ field groups)
- `**/vc-accordion.docs.md` — for collapsible form sections
- `**/vc-badge.docs.md` — for status indicators in form headers
- `**/vc-banner.docs.md` — for contextual alerts at top of form (error, info, warning states)
- `**/vc-hint.docs.md` — for field-level help text or secondary descriptions
- `**/vc-status.docs.md` — for status display in read-only areas
- `**/vc-button.docs.md` — for inline action buttons (e.g., inside banners)

**Media components (read when entity has images/gallery/video):**
- `**/vc-image-upload.docs.md` — for `image` fields (single image upload with preview)
- `**/vc-gallery.docs.md` — for `gallery` / `images` fields (multi-image management)
- `**/vc-image.docs.md` — for read-only image display

**Composable docs (always read):**
- `**/useBlade.docs.md`
- `**/useAsync.docs.md`
- `**/useModificationTracker.docs.md`
- `**/useLoading.docs.md`
- `**/validation.docs.md`

**Composable docs (read when entity has related sub-entities):**
- `**/useBladeWidgets.docs.md` — for blade sidebar widgets (icon buttons with badge counts that open child blades)

### Advanced patterns to read (based on design intent):

Read `knowledge/patterns/` files when the design requires these patterns:
- `knowledge/patterns/blade-widget.md` — when entity has related sub-entities that need sidebar widget navigation
- `knowledge/patterns/dashboard-widget.md` — when module should contribute a dashboard card
- `knowledge/patterns/notification-template.md` — when module needs push notification rendering

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
