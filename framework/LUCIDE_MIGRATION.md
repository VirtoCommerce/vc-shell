# Icon System Migration Guide

Official icon migration reference for `@vc-shell/framework`. This document describes the primary icon system, lists legacy systems, and provides migration steps.

---

## Primary Icon System: lucide-vue-next

`lucide-vue-next` is the **primary icon system** for the framework. It is tree-shakeable — only the icons you import are bundled.

### Usage

```vue
<script setup>
import { Search, Plus, Trash2 } from "lucide-vue-next";
</script>
<template>
  <Search :size="16" />
  <Plus
    :size="20"
    class="tw-text-[var(--primary-500)]"
  />
  <Trash2
    :size="16"
    color="currentColor"
  />
</template>
```

### Props

| Prop                  | Type             | Default        | Description            |
| --------------------- | ---------------- | -------------- | ---------------------- |
| `size`                | `number\|string` | `24`           | Width and height in px |
| `color`               | `string`         | `currentColor` | SVG stroke color       |
| `strokeWidth`         | `number`         | `2`            | SVG stroke width       |
| `absoluteStrokeWidth` | `boolean`        | `false`        | Scale stroke with size |

---

## Legacy Icon Systems (Deprecated)

These systems remain in `dependencies` until migration is complete but are **deprecated** and will be removed in a future major version.

### @fortawesome/fontawesome-free (^6.7.2)

- CSS font-based, NOT tree-shakeable
- Loaded globally via CSS import in framework `index.ts`
- Status: **Deprecated — will be removed in a future major version**

### bootstrap-icons (^1.11.3)

- CSS font-based, NOT tree-shakeable
- Loaded globally via CSS import
- Status: **Deprecated — will be removed in a future major version**

### @material-symbols/font-300 (^0.32.0)

- CSS font-based, secondary system for Material Design icons
- Status: **Under evaluation for removal**

---

## Migration Steps

### FontAwesome to Lucide

Replace `<i class="fas fa-*">` or `<i class="far fa-*">` with the imported Lucide component.

```html
<!-- Before (FontAwesome) -->
<i class="fas fa-search"></i>
<i class="fas fa-plus"></i>

<!-- After (Lucide) -->
<search :size="16" />
<Plus :size="16" />
```

**Common FA → Lucide mappings:**

| FontAwesome class           | Lucide component |
| --------------------------- | ---------------- |
| `fa-search`                 | `Search`         |
| `fa-plus`                   | `Plus`           |
| `fa-trash` / `fa-trash-alt` | `Trash2`         |
| `fa-edit` / `fa-pencil`     | `Pencil`         |
| `fa-check`                  | `Check`          |
| `fa-times` / `fa-xmark`     | `X`              |
| `fa-chevron-down`           | `ChevronDown`    |
| `fa-eye`                    | `Eye`            |
| `fa-download`               | `Download`       |
| `fa-upload`                 | `Upload`         |

### Bootstrap Icons to Lucide

Replace `<i class="bi bi-*">` with the imported Lucide component.

```html
<!-- Before (Bootstrap Icons) -->
<i class="bi bi-search"></i>
<i class="bi bi-plus-lg"></i>

<!-- After (Lucide) -->
<search :size="16" />
<Plus :size="16" />
```

**Common BI → Lucide mappings:**

| Bootstrap Icons class | Lucide component |
| --------------------- | ---------------- |
| `bi-search`           | `Search`         |
| `bi-plus-lg`          | `Plus`           |
| `bi-trash`            | `Trash2`         |
| `bi-pencil`           | `Pencil`         |
| `bi-check-lg`         | `Check`          |
| `bi-x-lg`             | `X`              |

---

## Bundle Impact

Migrating from CSS font icons to Lucide significantly reduces bundle size:

| System                   | Bundle cost      | Tree-shakeable |
| ------------------------ | ---------------- | -------------- |
| FontAwesome CSS font     | ~400 KB (always) | No             |
| Bootstrap Icons CSS font | ~200 KB (always) | No             |
| Lucide (lucide-vue-next) | ~1-2 KB per icon | Yes            |

CSS font-based icons load their entire glyph font regardless of how many icons are actually used in the application. Lucide components are individual SVG files — bundlers (Vite/Rollup) tree-shake unused imports, so only icons actually referenced in your code are included in the final bundle.

---

## Timeline

Actual migration (replacing existing FA/BI usage throughout the framework) is planned for a future phase. This document serves as the canonical reference for that work.

**Icon packages will remain in `dependencies` until migration is complete** to avoid breaking changes for consumers who reference icon classes directly in their templates or CSS.
