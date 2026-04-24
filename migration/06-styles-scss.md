# 06. Styles & SCSS

## What Changed

1. `@import` → `@use` (modern Sass standard)
2. `base.scss` and `colors.scss` removed — integrated into the framework
3. Font CSS imports no longer needed in `main.ts`

## Migration

### Step 1: Remove font imports from main.ts

```diff
-import "@fortawesome/fontawesome-free/css/all.min.css";
-import "roboto-fontface/css/roboto/roboto-fontface.css";
```

The framework now auto-loads all required base styles.

### Step 2: Switch @import to @use in SCSS

```diff
 // src/styles/index.scss
-@import 'custom';
+@use 'custom';
```

### Step 3: Restructure style files

**Old structure:**
```
src/styles/
  base.scss      ← delete
  colors.scss    ← delete
  custom.scss
  index.scss
```

**New structure:**
```
src/styles/
  custom.scss
  index.scss
```

**Updated `src/styles/index.scss`:**
```scss
@use 'custom';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Move any custom styles from `colors.scss` or `base.scss` into `custom.scss`.

## New in v2.0 — Style System Additions

### Dark theme (additive)

v2.0 ships a full dark color palette in `framework/assets/styles/theme/colors.scss`. The light theme is scoped to `:root[data-theme="light"]` and the new dark theme is scoped to `:root[data-theme="dark"]`.

**Toggle the theme** by setting the `data-theme` attribute on `<html>`:

```ts
// Dark
document.documentElement.setAttribute("data-theme", "dark");

// Light (default)
document.documentElement.setAttribute("data-theme", "light");
```

Every palette token (`--primary-*`, `--secondary-*`, `--accent-*`, `--neutrals-*`, `--additional-*`, `--warning-*`, `--danger-*`, `--success-*`, `--info-*`) plus overlay/shadow/surface/glass tokens (`--overlay-color`, `--overlay-bg`, `--overlay-blur`, `--shadow-color`, `--shadow-sm/md/lg`, `--surface-color`, `--surface-elevated`, `--surface-border`, `--glass-blur`, `--glass-saturate`) is redefined for dark mode — no custom CSS required to opt in. Any component that consumes tokens (rather than hard-coded colors) will flip automatically.

**Severity**: additive. Existing light-theme apps continue to work without changes.

### Scrollbar tokens renamed (breaking for custom overrides)

The global scrollbar tokens in `framework/assets/styles/index.scss` were renamed, and scrollbar behavior changed to hidden-by-default with hover-reveal.

| v1.x              | v2.0                  |
| ----------------- | --------------------- |
| `--scroll-color`  | `--scroll-thumb`      |
| `--scroll-width`  | `--scroll-size`       |
| (new)             | `--scroll-thumb-hover`|

**Behavioral change**: scrollbar thumb is transparent by default; it fades in only when the scroll container (or any ancestor) is hovered. The old `--scroll-color-hover`, `--scroll-padding`, `--scroll-shadow-color`, and `--scroll-shadow` tokens are gone.

**If you override scroll appearance**, update your custom rules:

```diff
 :root {
-  --scroll-color: #c0c0c0;
-  --scroll-width: 8px;
+  --scroll-thumb: #c0c0c0;
+  --scroll-thumb-hover: #909090;
+  --scroll-size: 6px;
 }
```

**Severity**: breaking only for apps that overrode the old token names. Apps using the defaults pick up the new look automatically.

### Tailwind color classes now map to CSS variables (additive)

In v1.x, palette colors had to be used via arbitrary-value syntax:

```html
<!-- v1.x -->
<div class="tw-bg-[var(--primary-500)] tw-text-[var(--neutrals-900)]">…</div>
```

In v2.0, `framework/tailwind.config.ts` wires every palette token (primary, secondary, accent, neutrals, danger, warning, success, info, additional) into `theme.extend.colors`, so standard Tailwind color utilities work directly:

```html
<!-- v2.0 -->
<div class="tw-bg-primary-500 tw-text-neutrals-900">…</div>
<div class="tw-border-danger-500 tw-ring-info-300">…</div>
```

Each palette also has a `DEFAULT` mapped to the `-500` shade, so shorthand classes like `tw-bg-primary`, `tw-text-danger`, `tw-border-neutrals` resolve to the default tone.

**Severity**: additive. The old `tw-bg-[var(--primary-500)]` syntax still works — migrate opportunistically.

## G21: Z-index token scale

v2.0 introduces a single-source-of-truth z-index scale at `framework/assets/styles/theme/_z-index.scss`. Never use bare `z-index` numbers — pick the tier that matches the element's role.

The tokens are declared on `:root`, so they are available as CSS custom properties everywhere automatically (no import needed in consumer apps — the framework's global stylesheet already emits them).

**Four tiers:**

| Tier       | Range       | Tokens                                                                                                                                                            | Use when                                             |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Local      | -1 … 15     | `--z-local-below` (-1), `--z-local-above` (2), `--z-local-sticky` (10), `--z-local-header` (11)                                                                    | Inside a component, stacking next to a sibling       |
| Layout     | 40 … 70     | `--z-layout-header` (40), `--z-layout-sidebar` (50), `--z-layout-widget` (54), `--z-layout-toolbar` (60)                                                           | Page chrome visible on scroll                        |
| Overlay    | 100 … 500   | `--z-overlay-dropdown` (100), `--z-overlay-editor-bubble` (200), `--z-overlay-row-actions` (300), `--z-overlay-drag` (400), `--z-overlay-back-button` (500)        | Pops up on action, inside a blade                    |
| Critical   | 9000 … 9500 | `--z-critical-loading` (9000), `--z-critical-popup` (9100), `--z-critical-modal` (9200), `--z-critical-dropdown-panel` (9300), `--z-critical-tooltip` (9400), `--z-critical-notification` (9500) | Covers the entire app (teleported)                  |

**Consume from CSS / SCSS:**

```scss
.vc-my-dropdown {
  z-index: var(--z-overlay-dropdown);
}

.vc-my-sticky-header {
  position: sticky;
  z-index: var(--z-local-header);
}
```

**Consume from Tailwind** via arbitrary values:

```html
<div class="tw-z-[var(--z-overlay-dropdown)]">…</div>
```

If no matching token exists, add one to `_z-index.scss` in the correct tier with a value between its neighbors — do not invent bare numbers in component styles.
