# 28. Shared Components → UI Components

## What Changed

Two components previously available from `shared/` internals are deprecated. Use the UI component versions instead:

| Old (deprecated) | New | Import |
|---|---|---|
| `VcSidebar` from shared | `VcSidebar` from UI | `import { VcSidebar } from "@vc-shell/framework"` |
| `VcDropdown` from shared (generic-dropdown) | `VcDropdown` from UI | `import { VcDropdown } from "@vc-shell/framework"` |

## Backward Compatibility

The `shared/` directory has been removed in the framework API restructuring. Internal path imports (e.g., `@vc-shell/framework/shared/components/sidebar`) no longer resolve. Use the barrel import `@vc-shell/framework` instead — it exports `VcSidebar` and `VcDropdown` from their new UI locations.

## Migration

If you import from `@vc-shell/framework` (barrel export) — **no changes needed**. The barrel already points to the UI versions.

If you import from internal paths:

```diff
-import { VcSidebar } from "@vc-shell/framework/shared/components/sidebar";
+import { VcSidebar } from "@vc-shell/framework";

-import { VcDropdown } from "@vc-shell/framework/shared/components/generic-dropdown";
+import { VcDropdown } from "@vc-shell/framework";
```

## How to Find

```bash
grep -rn "shared/components/sidebar\|shared/components/generic-dropdown" src/
```

## Related: `usePopup` Promoted to Public Composable

**Severity:** New (non-breaking, additive)
**Automated:** No (import path update only)

`usePopup()` was previously an internal composable reachable only through deep `shared/components/popup-handler` paths. It is now a first-class public composable under `@core/composables/usePopup`, re-exported from the main package barrel.

### Migration

```diff
-import { usePopup } from "@vc-shell/framework/shared/components/popup-handler/composables";
+import { usePopup } from "@vc-shell/framework";
```

If you already import from the `@vc-shell/framework` barrel — **no changes needed**; the barrel now points to the public location.

### What `usePopup` Exposes

```typescript
import { usePopup } from "@vc-shell/framework";

const popup = usePopup();

// Simple confirmation / info / error flows driven by registered popup presets:
const confirmed = await popup.showConfirmation("Are you sure?");
popup.showError("Something went wrong.");
popup.showInfo("Saved.");

// Custom popup component:
const custom = usePopup({
  component: MyPopupComponent,
  props: { title: "Custom" },
});
custom.open();
custom.close();
```

The shell's popup plugin (installed by `VcApp`) registers the `warning`, `error`, and `info` presets — `showConfirmation`/`showError`/`showInfo` will log and no-op if those presets are not registered.

### How to Find (Old Deep Imports)

```bash
grep -rn "shared/components/popup-handler\|popup-handler/composables" src/
```
