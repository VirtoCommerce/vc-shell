# 47. Menu & Toolbar: Icon Type Narrowed to String-Only

## What Changed

Consumer-configured icons on `MenuItemConfig` (and the derived `MenuItem`) can no
longer be arbitrary Vue components — only icon **name strings** are accepted
(e.g. `"lucide-settings"`, `"material-home"`, `"bi-gear"`).

The generic helper `ToolbarMenu<T>` that was used to infer toolbar component
props has also been removed from the public API surface.

### Affected Types

- **`MenuItemConfig.icon`**: `string | Component` → `string`
- **`MenuItemConfig.groupIcon`** *(deprecated)*: `string | Component` → `string`
- **`MenuItemConfig.groupConfig.icon`**: `string | Component | undefined` → `string | undefined`
- **`MenuItem.groupIcon`**: `string | Component` → `string`
- **`ToolbarMenu<T>`**: **removed** from `@vc-shell/framework` exports.
- **`ComponentPublicInstanceConstructor`**: no longer re-exported from the
  framework public API (it was the building block of `ToolbarMenu<T>`).

### Unchanged

These look related but were **not** changed — they still accept components /
functions:

- `IBladeToolbar.icon` — still `string | (() => string)` (lazy-string getter,
  not a component).
- `IMenuItem.icon` — still `string | Component` (this is a different type used
  by legacy widget/app-bar menu lists, not the registered menu).

## Why

The icon rendering pipeline was unified around the framework icon prefixes
(`lucide-*`, `material-*`, `bi-*`) used by `VcIcon`. Passing arbitrary Vue
components into `MenuItemConfig.icon` bypassed that pipeline, breaking theming,
sizing tokens, and icon-set consistency in the sidebar and menu groups.

`ToolbarMenu<T>` depended on `ComponentPublicInstanceConstructor`, a
type-utility from the deleted `shared/utilities` barrel; with that barrel
removed (see guide #28), `ToolbarMenu<T>` had no remaining call sites and was
dropped.

## Who Is Affected

Code that passes a Vue component reference to any of the narrowed `.icon`
fields:

```typescript
// Before (v1.x)
import MyCustomIcon from "./MyCustomIcon.vue";

const menuItem: MenuItemConfig = {
  title: "Settings",
  icon: MyCustomIcon, // ❌ Vue component reference — no longer assignable
  priority: 10,
  groupConfig: {
    id: "admin",
    icon: MyCustomIcon, // ❌ same here
  },
};
```

…and code that imported `ToolbarMenu` or `ComponentPublicInstanceConstructor`
from `@vc-shell/framework`.

## Migration Steps

### 1. Replace component icons with icon-name strings

```typescript
// After (v2.x)
const menuItem: MenuItemConfig = {
  title: "Settings",
  icon: "lucide-settings", // or "material-settings", "bi-gear", etc.
  priority: 10,
  groupConfig: {
    id: "admin",
    icon: "lucide-shield",
  },
};
```

Supported icon prefixes are resolved by `VcIcon`; see guide
[#05 — Icon Migration](./05-icons.md) for the full list and the name-mapping
table.

### 2. If you need a custom glyph

If Lucide / Material / Bootstrap Icons don't contain what you need, add a
custom SVG and register it with the icon system rather than passing a Vue
component directly to `.icon`. The menu renderer always goes through `VcIcon`
and only accepts a string key.

### 3. `ToolbarMenu<T>` import removal

Delete any import of `ToolbarMenu` and type your toolbar items with
`IBladeToolbar` directly. Component-backed toolbar items are still supported
through the toolbar service's `IToolbarItem` (which extends `IBladeToolbar`);
no generic component-props inference is exposed publicly anymore.

```typescript
// Before
import type { ToolbarMenu } from "@vc-shell/framework";
const item: ToolbarMenu<typeof MyBladeComponent> = { /* ... */ };

// After
import type { IBladeToolbar } from "@vc-shell/framework";
const item: IBladeToolbar = { /* ... */ };
```

## How to Find

```bash
# Component-valued icons in menu configs
grep -rn 'icon:\s*[A-Z][A-Za-z]' src/ --include='*.ts' --include='*.vue'

# ToolbarMenu usages
grep -rn 'ToolbarMenu' src/ --include='*.ts'

# ComponentPublicInstanceConstructor re-imports
grep -rn 'ComponentPublicInstanceConstructor' src/ --include='*.ts'
```

TypeScript will also surface the narrowed fields as errors of the form
`Type 'DefineComponent<...>' is not assignable to type 'string'.` after
upgrading.

## Related

- [Guide #05 — Icon Migration](./05-icons.md) — the icon-name catalogue used by
  `VcIcon`.
- [Guide #27 — Menu Group Config](./27-menu-group-config.md) — migrating from
  `group` / `groupIcon` / `inGroupPriority` to the `groupConfig` object.
- [Guide #28 — Shared Components](./28-shared-components.md) — removal of the
  `shared/utilities` barrel that previously exported
  `ComponentPublicInstanceConstructor`.
