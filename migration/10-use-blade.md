# 10. useBladeNavigation → useBlade

## What Changed

`useBlade()` replaces all previous blade composables:

| Old (deprecated) | New |
|-------------------|-----|
| `useBladeNavigation()` | `useBlade()` |
| `useBladeContext()` | `useBlade()` |
| `useBlade()` (legacy, returned `ComputedRef`) | `useBlade()` (new, returns destructured API) |

## Backward Compatibility

`useBladeNavigation()` and `useBladeContext()` continue to work as deprecated adapters.

## Quick Reference

| Old | New |
|-----|-----|
| `openBlade({ blade: resolveBladeByName("X")!, param })` | `openBlade({ name: "X", param })` |
| `openBlade({ blade: { name: "X" }, options })` | `openBlade({ name: "X", options })` |
| `openBlade({ blade: markRaw(Component), param })` | `openBlade({ name: "ComponentName", param })` |
| `onParentCall({ method: "reload" })` | `callParent("reload")` |
| `onParentCall({ method: "fn", args: val })` | `callParent("fn", val)` |
| `resolveBladeByName("X")` | Not needed — pass `name` directly |

## Migration Examples

**Inside a blade:**
```diff
-const blade = useBlade();
-const { openBlade, onBeforeClose } = useBladeNavigation();
-registerWidget(myWidget, blade?.value.id ?? "");
+const { id: bladeId, openBlade, onBeforeClose } = useBlade();
+registerWidget(myWidget, bladeId.value);
```

**Outside a blade (dashboard card):**
```diff
-import { useBladeNavigation } from "@vc-shell/framework";
-const { openBlade, resolveBladeByName } = useBladeNavigation();
-openBlade({ blade: resolveBladeByName("OrderDetails")!, param: orderId });
+import { useBlade } from "@vc-shell/framework";
+const { openBlade } = useBlade();
+openBlade({ name: "OrderDetails", param: orderId });
```

**Parent-child communication:**
```diff
-const { onParentCall } = useBladeNavigation();
-onParentCall({ method: "reload" });
+const { callParent } = useBlade();
+await callParent("reload");
```

## onBeforeClose Boolean Inversion

The guard semantics are **inverted**:

| Legacy | New |
|--------|-----|
| `return false` → **prevent** close | `return true` → **prevent** close |
| `return true` → allow close | `return false` → allow close |

```diff
 onBeforeClose(async () => {
   if (isModified.value) {
-    return await showConfirmation(msg); // true=allow, false=prevent
+    return !(await showConfirmation(msg)); // true=prevent, false=allow
   }
 });
```

## Context Behavior

| Method | Inside blade | Outside blade |
|--------|-------------|---------------|
| `openBlade()` | Opens child + URL sync | Opens blade (no parentId) + URL sync |
| `closeSelf()` | Closes current blade | Throws |
| `closeChildren()` | Closes all children | Throws |
| `id`, `param`, etc. | ComputedRef with value | Throws on `.value` access |
| `callParent()` | Calls parent method | Throws |

## How to Find

```bash
grep -rn "useBladeNavigation\|useBladeContext\|resolveBladeByName\|onParentCall" src/
```
