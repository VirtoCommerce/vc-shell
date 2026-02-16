# Migration Guide: `useBladeNavigation()` → `useBladeContext()`

## Why Migrate?

The legacy `useBladeNavigation()` API is maintained via an adapter layer for backward compatibility. The new `useBladeContext()` API is cleaner, type-safe, and avoids common pitfalls:

| Legacy (`useBladeNavigation`) | New (`useBladeContext`) |
|-------------------------------|------------------------|
| Index-based blade operations (fragile) | ID-based operations (stable) |
| String method names for parent calls (no autocomplete) | Same, but with typed return values |
| Manual `emit("parent:call", ...)` pattern | Direct `callParent(method, args)` |
| Must manually track blade index | Auto-sets `parentId` |
| Guard: `false` = prevent close | Guard: `true` = prevent close |

## Prerequisites

Your blade component must be rendered inside `VcBladeSlot` (the v2 render layer). If you're using VcBladeNavigation (new), this is already the case.

## Step-by-Step Migration

### 1. Replace the Import

```diff
- import { useBladeNavigation } from "@vc-shell/framework";
- import { useBlade } from "@vc-shell/framework";
+ import { useBladeContext } from "@vc-shell/framework";
```

### 2. Replace Setup Calls

```diff
- const { openBlade, closeBlade, onBeforeClose, onParentCall } = useBladeNavigation();
- const blade = useBlade();
+ const { param, options, expanded, closable, openBlade, closeSelf, callParent, onBeforeClose } = useBladeContext();
```

### 3. Access Blade Properties

```diff
  // Before: blade instance properties via useBlade()
- const blade = useBlade();
- const id = blade.value.param;
- const opts = blade.value.options;

  // After: direct computed refs
+ const { param, options } = useBladeContext();
+ // param.value, options.value — already reactive
```

### 4. Open a Blade

```diff
  // Before: pass component reference or { name } object
- import { markRaw } from "vue";
- import OrderDetails from "./order-details.vue";
- openBlade({
-   blade: markRaw(OrderDetails),
-   param: orderId,
-   options: { product },
-   onOpen() { selectedId.value = orderId; },
-   onClose() { selectedId.value = undefined; },
- });

  // After: pass name string (component resolved from registry)
+ openBlade({
+   name: "OrderDetails",
+   param: orderId,
+   options: { product },
+   onOpen() { selectedId.value = orderId; },
+   onClose() { selectedId.value = undefined; },
+ });
```

**Note**: `openBlade` from `useBladeContext()` auto-sets `parentId` to the current blade — no need to track indices.

### 5. Close a Blade

```diff
  // Before: close by index (fragile)
- closeBlade((blade.value.navigation?.idx ?? 0) + 1);

  // After: close self (the most common case)
+ closeSelf();
```

### 6. Call Parent Methods

```diff
  // Before: emit-based, no return value
- emit("parent:call", {
-   method: "reload",
-   args: { id: item.id },
-   callback: (result) => { /* handle result */ },
- });

  // After: async/await, typed return value
+ const result = await callParent<void>("reload", { id: item.id });
```

### 7. Expose Methods to Children

```diff
  // Before: implicit via defineExpose (VcBladeSlot extracts functions)
- defineExpose({ reload, save, title });

  // After: explicit registration (defineExpose still works for title)
+ const { exposeToChildren } = useBladeContext();
+ exposeToChildren({ reload, save });
+ defineExpose({ title }); // title still propagated via defineExpose
```

### 8. Before-Close Guards

```diff
  // Before: return false to PREVENT close
- onBeforeClose(async () => {
-   if (hasUnsavedChanges.value) {
-     return confirm("Discard changes?") ? undefined : false;
-     //                                    allow ↑    prevent ↑
-   }
- });

  // After: return true to PREVENT close
+ onBeforeClose(async () => {
+   if (hasUnsavedChanges.value) {
+     return !confirm("Discard changes?");
+     //      true = prevent, false = allow
+   }
+   return false; // allow close
+ });
```

### 9. Replace Current Blade

```diff
  // Before: flag on openBlade
- openBlade({
-   blade: markRaw(EditBlade),
-   replaceCurrentBlade: true,
-   param: item.id,
- });

  // After: dedicated method
+ const { replaceWith } = useBladeContext();
+ replaceWith({
+   name: "EditBlade",
+   param: item.id,
+ });
```

### 10. Error Management

```diff
  // Before: by index
- const { setBladeError, clearBladeError } = useBladeNavigation();
- setBladeError(blade.value.navigation?.idx ?? 0, error);

  // After: on current blade (no index needed)
+ const { setError, clearError } = useBladeContext();
+ setError(error);
```

## Full Example: Before & After

### Before (Legacy)

```vue
<script lang="ts" setup>
import { useBladeNavigation, useBlade } from "@vc-shell/framework";
import { markRaw } from "vue";
import OrderDetails from "./order-details.vue";

const { openBlade, closeBlade, onBeforeClose, onParentCall } = useBladeNavigation();
const blade = useBlade();

onBeforeClose(async () => {
  if (modified.value) return false; // prevent
});

function onItemClick(item: Order) {
  openBlade({
    blade: markRaw(OrderDetails),
    param: item.id,
    options: { source: "list" },
    onOpen() { selectedId.value = item.id; },
    onClose() { selectedId.value = undefined; },
  });
}

function removeChild() {
  closeBlade((blade.value.navigation?.idx ?? 0) + 1);
}

defineExpose({ reload, title });
</script>
```

### After (New API)

```vue
<script lang="ts" setup>
import { useBladeContext } from "@vc-shell/framework";

const { param, options, openBlade, closeSelf, callParent, onBeforeClose, exposeToChildren } = useBladeContext();

onBeforeClose(async () => {
  if (modified.value) return true; // prevent
  return false;
});

function onItemClick(item: Order) {
  openBlade({
    name: "OrderDetails",
    param: item.id,
    options: { source: "list" },
    onOpen() { selectedId.value = item.id; },
    onClose() { selectedId.value = undefined; },
  });
}

exposeToChildren({ reload });
defineExpose({ title }); // title still needs defineExpose for VcBladeSlot propagation
</script>
```
