---
name: icon-migration
description: AI transformation rules for migrating non-lucide icons to lucide equivalents.
---

# Icon Migration: material-/bi-/fa- → lucide-

All icons in the v2 framework must use the `lucide-` prefix. Replace all `material-*`, `bi-*`, and `fa-*` icons with their lucide equivalents.

## RULE 1: Replace Icon Strings

Scan ALL `.vue` and `.ts` files in the affected module for icon strings. For each non-lucide icon, choose the closest semantic match from the lucide icon set (https://lucide.dev/icons).

When choosing a replacement:
- Match by **meaning**, not by visual similarity — e.g., `material-delete` → `lucide-trash-2` (both mean "delete")
- Use the most specific icon available — e.g., `material-person_add` → `lucide-user-plus` (not just `lucide-user`)
- When no perfect match exists, pick the closest conceptual equivalent and note it in the report

**BEFORE:**

```typescript
const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "refresh",
    icon: "material-refresh",
    title: t("...REFRESH"),
    clickHandler: reload,
  },
  {
    id: "add",
    icon: "material-add",
    title: t("...ADD"),
    clickHandler: addItem,
  },
  {
    id: "delete",
    icon: "material-delete",
    title: t("...DELETE"),
    clickHandler: deleteItems,
  },
]);
```

**AFTER:**

```typescript
const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "refresh",
    icon: "lucide-refresh-cw",
    title: t("...REFRESH"),
    clickHandler: reload,
  },
  {
    id: "add",
    icon: "lucide-plus",
    title: t("...ADD"),
    clickHandler: addItem,
  },
  {
    id: "delete",
    icon: "lucide-trash-2",
    title: t("...DELETE"),
    clickHandler: deleteItems,
  },
]);
```

## RULE 2: Where Icons Appear

Icons appear in these contexts — check ALL of them:

1. **Toolbar items:** `icon: "material-*"` in `IBladeToolbar[]`
2. **Menu items in defineBlade:** `icon: "material-*"` in `menuItem` config
3. **VcIcon components:** `<VcIcon icon="material-*" />`
4. **Widget declarations:** `icon: "material-*"` in `useBladeWidgets()` config
5. **Action builders / row actions:** `icon: "material-*"` in action definitions
6. **Empty state configs:** `icon: "material-*"` in `:empty-state` or `:not-found-state`
7. **Any other string literal** containing `material-`, `bi-`, or `fa-` prefixes

## RULE 3: Perform Replacements In-Place

This is a **mechanical replacement** — do not restructure code. For each icon string found:
1. Identify the icon name (e.g., `material-edit_square`)
2. Determine the semantic meaning (e.g., "edit with square indicator")
3. Find the best lucide match (e.g., `lucide-square-pen`)
4. Replace the string in-place

## Verification

After migration:

1. Search for remaining non-lucide icons: `grep -rn '"material-\|"bi-\|fa-' src/modules/`
2. Verify no results (all icons should be `lucide-*`)
3. Run the app and visually confirm icons render correctly
