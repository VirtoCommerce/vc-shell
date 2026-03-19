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
