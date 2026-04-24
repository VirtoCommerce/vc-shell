# 45. CSS BEM Class Migration: `_` → `--`

## What Changed

All framework components migrated their CSS class modifiers from single-underscore (`_`) to double-dash (`--`) per strict BEM convention.

Block-Element remains unchanged (`.vc-button__icon` stays the same). Only **modifiers** were renamed.

**Before** (v1.x):

```html
<button class="vc-button vc-button_primary vc-button_sm">
  <span class="vc-button__icon">...</span>
  <span class="vc-button__title">Save</span>
</button>
```

**After** (v2.0):

```html
<button class="vc-button vc-button--primary vc-button--sm">
  <span class="vc-button__icon">...</span>
  <span class="vc-button__title">Save</span>
</button>
```

Note that the element classes (`__icon`, `__title`) are unchanged — only the modifiers (`_primary` → `--primary`, `_sm` → `--sm`) moved to double-dash.

## Why

- **Strict BEM compliance**: the BEM specification uses `block__element` for elements and `block--modifier` for modifiers. Single underscore conflated the two syntaxes.
- **Consistency with responsive class suffixes**: mobile/desktop variants already used `--mobile`/`--desktop` (e.g. `.vc-component--mobile`). Modifiers now follow the same convention.
- **Tooling**: linters and BEM-aware IDE plugins recognize `--` as the modifier separator out of the box.

## Who Is Affected

You need to migrate if your application:

- Has **custom CSS** targeting framework component classes (including `:deep()` selectors inside Vue scoped styles)
- Uses **Playwright/Cypress/Selenium selectors** like `.vc-button_primary`
- Has **snapshot tests** (vitest, Jest) that contain rendered framework class names
- **Overrides framework styles** via theme files or global stylesheets

If you only consume framework components through their public Vue API (props, slots, events, emitted values), you are **not affected** — no code changes required.

## Migration Steps

### 1. Find usages of old class names in your project

```bash
# Single-underscore BEM modifiers on Vc* classes
grep -rE '\.?vc-[a-z-]+_[a-z]' src/ \
  --include='*.vue' \
  --include='*.scss' \
  --include='*.css' \
  --include='*.ts' \
  --include='*.tsx'
```

Pay attention to the difference:

- `vc-button__icon` — BEM **element**, keep as-is
- `vc-button_primary` — BEM **modifier**, rename to `vc-button--primary`

### 2. Replace modifier syntax

For each match, replace `_<modifier>` with `--<modifier>` on the block:

```
.vc-<block>_<modifier>   →   .vc-<block>--<modifier>
```

Do **NOT** touch `.vc-<block>__<element>` — double-underscore is the BEM element separator and remains unchanged.

Example scoped Vue style:

```scss
/* Before */
:deep(.vc-button_primary) {
  background: var(--brand);
}
:deep(.vc-button__icon) {
  color: var(--white);
}

/* After */
:deep(.vc-button--primary) {
  background: var(--brand);
}
:deep(.vc-button__icon) {
  color: var(--white);
} /* unchanged */
```

### 3. Update E2E and integration test selectors

```ts
// Playwright — before
await page.locator(".vc-select_opened").click();
await expect(page.locator(".vc-input_error")).toBeVisible();

// Playwright — after
await page.locator(".vc-select--opened").click();
await expect(page.locator(".vc-input--error")).toBeVisible();
```

```ts
// Cypress — before
cy.get(".vc-button_sm").click();

// Cypress — after
cy.get(".vc-button--sm").click();
```

### 4. Regenerate snapshots

Any DOM snapshot tests that captured the previous class names will need to be updated:

```bash
# vitest
yarn vitest -u

# Jest
yarn jest -u
```

Review the diffs to confirm only `_modifier` → `--modifier` substitutions changed (no unexpected DOM differences).

## Common Patterns (Before / After)

These are real class names from framework components — verified against `v1.2.3` vs the current release.

| v1.x (`_`)                        | v2.0 (`--`)                        |
| --------------------------------- | ---------------------------------- |
| `.vc-button_sm`                   | `.vc-button--sm`                   |
| `.vc-button_text`                 | `.vc-button--text`                 |
| `.vc-button_selected`             | `.vc-button--selected`             |
| `.vc-button_xs`                   | `.vc-button--xs`                   |
| `.vc-app_mobile`                  | `.vc-app--mobile`                  |
| `.vc-container_nopadding`         | `.vc-container--nopadding`         |
| `.vc-container_shadow`            | `.vc-container--shadow`            |
| `.vc-status_dot`                  | `.vc-status--dot`                  |
| `.vc-status_extended`             | `.vc-status--extended`             |
| `.vc-icon_success`                | `.vc-icon--success`                |
| `.vc-icon_warning`                | `.vc-icon--warning`                |
| `.vc-icon_danger`                 | `.vc-icon--danger`                 |
| `.vc-icon_xs` / `_s` / `_m` / …   | `.vc-icon--xs` / `--s` / `--m` / … |
| `.vc-icon-container_xxxl`         | `.vc-icon-container--xxxl`         |
| `.vc-select_opened`               | `.vc-select--opened`               |
| `.vc-select_disabled`             | `.vc-select--disabled`             |
| `.vc-select_error`                | `.vc-select--error`                |
| `.vc-select_has-hint-or-error`    | `.vc-select--has-hint-or-error`    |
| `.vc-radio-button_error`          | `.vc-radio-button--error`          |

The same transformation applies to every other `Vc*` component not listed here.

## Elements Are NOT Changed

Double-underscore element selectors stayed the same in v2.0. Do not rewrite these:

```
.vc-button__icon          (unchanged)
.vc-button__title         (unchanged)
.vc-container__inner      (unchanged)
.vc-container__overscroll (unchanged)
.vc-container__status     (unchanged)
```

If your search/replace touches these, your regex is too greedy — tighten it to match `_[a-z]` only when it isn't preceded by another `_`.

## Verification

Before shipping the upgrade:

1. **No remaining matches** — `grep -rE '\.?vc-[a-z-]+_[a-z]' src/` returns nothing (excluding `__element` hits).
2. **E2E suite** runs green against a build of v2.0.
3. **Visual regression** — spot-check pages that use heavily-themed framework components (buttons, inputs, selects, app shell).
4. **Snapshot diffs** show only `_` → `--` substitutions, no unexpected structural changes.
