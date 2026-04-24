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

## Removed Types

The following public type exports are gone in v2.0:

| Removed | Replacement |
|---------|-------------|
| `ToolbarMenu<T>` | `IBladeToolbar` (from `@vc-shell/framework`) |
| `ComponentPublicInstanceConstructor` | Use `Component` from `vue`, or the helpers from `vue-component-type-helpers` |

`ToolbarMenu<T>` was a generic wrapper that merged a component-typed `options` field onto `IBladeToolbar`. The blade toolbar API now takes `IBladeToolbar` directly — pass component props inline instead of threading them through a generic:

```diff
-import type { ToolbarMenu } from "@vc-shell/framework";
-const toolbar: ToolbarMenu<{ component: typeof MyIcon }>[] = [...];
+import type { IBladeToolbar } from "@vc-shell/framework";
+const toolbar: IBladeToolbar[] = [...];
```

`ComponentPublicInstanceConstructor` was an internal helper used to type `usePopup()` generics. Migrate to the standard `Component` type or to `vue-component-type-helpers` (which `usePopup` itself now uses internally):

```diff
-import type { ComponentPublicInstanceConstructor } from "@vc-shell/framework";
-function openPopup<T extends ComponentPublicInstanceConstructor<any>>(comp: T) { ... }
+import type { Component } from "vue";
+function openPopup<T extends Component>(comp: T) { ... }
```

The related `NotificationTemplateConstructor` type and `NotificationTemplatesKey` injection key were also removed.

## How to Find

```bash
grep -rn "useBladeNavigation\|useBladeContext\|resolveBladeByName\|onParentCall" src/
```
