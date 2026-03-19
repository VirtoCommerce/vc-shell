# Migration Guide: `useBladeNavigation()` → `useBladeContext()`

## Why Migrate?

The legacy `useBladeNavigation()` API is maintained via an adapter layer for backward compatibility. The new `useBlade()` API (also exported as `useBladeContext()`) is cleaner, type-safe, and avoids common pitfalls.

Additionally, the **Smart VcBlade** update means blade pages no longer need to declare boilerplate props (`expanded`, `closable`, `param`, `options`) or emits (`close:blade`, `expand:blade`, `collapse:blade`, `parent:call`). VcBlade reads `expanded`/`closable` from `BladeDescriptor` automatically. Use `useBlade()` to access `param`, `options`, and all blade actions directly.

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
+ import { useBlade } from "@vc-shell/framework";
```

> `useBlade()` is the canonical export. `useBladeContext()` is an alias for the same function — both work identically.

### 2. Replace Setup Calls

```diff
- const { openBlade, closeBlade, onBeforeClose, onParentCall } = useBladeNavigation();
- const blade = useBlade();
+ const { param, options, expanded, closable, openBlade, closeSelf, callParent, onBeforeClose } = useBlade();
```

### 2b. Remove Boilerplate Props and Emits (Smart VcBlade)

Blade pages no longer need to declare `expanded`/`closable`/`param`/`options` props or `close:blade`/`expand:blade`/`collapse:blade`/`parent:call` emits. VcBlade reads `expanded`/`closable` from the `BladeDescriptor` automatically, and `param`/`options` are available via `useBlade()`.

```diff
- const props = defineProps<{
-   expanded: boolean;
-   closable: boolean;
-   param?: string;
-   options?: MyOptions;
- }>();
- const emit = defineEmits<{
-   (e: "close:blade"): void;
-   (e: "expand:blade"): void;
-   (e: "collapse:blade"): void;
-   (e: "parent:call", args: IParentCallArgs): void;
- }>();

+ const { param, options, closeSelf, callParent } = useBlade();
```

And in the template, remove the forwarding bindings from `<VcBlade>`:

```diff
- <VcBlade
-   :expanded="expanded"
-   :closable="closable"
-   @close="$emit('close:blade')"
-   @expand="$emit('expand:blade')"
-   @collapse="$emit('collapse:blade')"
- >
+ <VcBlade>
```

> **Note:** The old props/emits are still forwarded by VcBladeSlot for backward compatibility. Existing blades that still declare them continue to work — this step is optional but strongly recommended for new blades.

### 3. Access Blade Properties

```diff
  // Before: blade instance properties via useBlade()
- const blade = useBlade();
- const id = blade.value.param;
- const opts = blade.value.options;

  // After: direct computed refs
+ const { param, options } = useBlade();
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
+ const { exposeToChildren } = useBlade();
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
  // Before: flag on openBlade (legacy — hides old blade, stacks new one on top)
- openBlade({
-   blade: markRaw(EditBlade),
-   replaceCurrentBlade: true,
-   param: item.id,
- });

  // After (true replacement — destroys old blade, creates new at same position):
+ // replaceWith is part of useBlade() — destructure it alongside other methods
+ const { replaceWith } = useBlade();
+ replaceWith({
+   name: "EditBlade",
+   param: item.id,
+ });

  // Or, to preserve old blade underneath (closing new reveals old):
+ const { coverWith } = useBlade();
+ coverWith({
+   name: "EditBlade",
+   param: item.id,
+ });
```

> **Note:** The legacy `replaceCurrentBlade: true` flag maps to `coverWith` (hide + stack)
> for backward compatibility. New code should choose explicitly between `replaceWith` and `coverWith`.

### 10. Error Management

```diff
  // Before: by index
- const { setBladeError, clearBladeError } = useBladeNavigation();
- setBladeError(blade.value.navigation?.idx ?? 0, error);

  // After: on current blade (no index needed)
+ const { setError, clearError } = useBlade();
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
import { useBlade } from "@vc-shell/framework";

const { param, options, openBlade, closeSelf, callParent, onBeforeClose, exposeToChildren } = useBlade();

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
