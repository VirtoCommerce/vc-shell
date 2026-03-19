# Blade Navigation — Cookbook

Practical recipes for module developers. Each recipe demonstrates the **new API** (`useBlade()`) and, where relevant, shows the legacy equivalent via `emit("parent:call", ...)`.

> **Related docs:**
> - [ARCHITECTURE.md](./ARCHITECTURE.md) — internal architecture
> - [MIGRATION.md](./MIGRATION.md) — legacy → new API migration guide
> - [useBlade.docs.md](../../../core/composables/useBlade/useBlade.docs.md) — API reference

---

## Table of Contents

1. [Workspace — module entry point](#1-workspace--module-entry-point)
2. [Master-Detail — list opens details](#2-master-detail--list-opens-details)
3. [Create → Save → Reopen with ID](#3-create--save--reopen-with-id)
4. [Delete from child → close & refresh parent](#4-delete-from-child--close--refresh-parent)
5. [Unsaved changes guard](#5-unsaved-changes-guard)
6. [Opening a blade from dashboard / notification](#6-opening-a-blade-from-dashboard--notification)
7. [3+ levels of nesting](#7-3-levels-of-nesting)
8. [Picker blade — select and return data](#8-picker-blade--select-and-return-data)
9. [Expose methods to children](#9-expose-methods-to-children)

---

## 1. Workspace — module entry point

A workspace is the leftmost blade (index 0). Typically an entity list. Declared via `defineOptions`:

```vue
<script lang="ts" setup>
defineOptions({
  name: "Orders",           // unique name for BladeRegistry
  url: "/orders",           // URL segment (/#/orders)
  isWorkspace: true,        // makes this the root blade
  menuItem: {               // sidebar menu entry
    id: "orders",
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-package",
    priority: 3,
  },
});
</script>
```

**Key properties:**
- `isWorkspace: true` — clears the stack on open and places the blade at position [0]
- `url` — must start with `/`, used for URL synchronization and deep linking
- `menuItem` — automatically registered in the sidebar when the module is installed

---

## 2. Master-Detail — list opens details

The most common pattern. A list (workspace) opens a detail blade on row click.

### List (parent)

```vue
<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();
const selectedItemId = ref<string>();

// Open detail blade on table row click
const onItemClick = (event: { data: Order }) => {
  const item = event.data;
  openBlade({
    name: "OrderDetails",       // name from detail blade's defineOptions
    param: item.id,             // entity ID — appears in URL
    options: {                  // extra data (not in URL)
      source: "list",
    },
    onOpen() {
      selectedItemId.value = item.id;   // highlight row in table
    },
    onClose() {
      selectedItemId.value = undefined; // clear highlight
    },
  });
};

// Reload method — called by child blade
async function reload() {
  await loadOrders({ ...searchQuery.value });
}

// Expose for child blades
defineExpose({ title, reload, onItemClick });
</script>
```

### Detail (child)

> **Smart VcBlade pattern (recommended):** Blade pages no longer need to declare `expanded`/`closable` props or `close:blade`/`expand:blade`/`parent:call` emits. VcBlade reads these from `BladeDescriptor` automatically. Use `useBlade()` to access `param`, `options`, and actions.

```vue
<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

defineOptions({
  name: "OrderDetails",
  url: "/order",        // URL: /#/orders/order/<id>
  routable: true,       // enables restoration from URL (deep link)
});

const { param, options, callParent, closeSelf } = useBlade();

onMounted(async () => {
  if (param.value) {
    await loadOrder({ id: param.value });
  }
});

async function onSave() {
  await saveOrder(order.value);
  await callParent("reload");    // refresh the parent list
}
</script>
```

<details>
<summary>Legacy pattern (deprecated — still works)</summary>

```vue
<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

defineOptions({ name: "OrderDetails", url: "/order", routable: true });

// Old pattern: manually declare expanded/closable/param/options as props
const props = defineProps<{
  expanded: boolean;
  closable: boolean;
  param?: string;
  options?: { source: string };
}>();

// And pass them through on the <VcBlade> template:
// <VcBlade :expanded="expanded" :closable="closable" @close="$emit('close:blade')" ...>

const { callParent, closeSelf } = useBlade();

onMounted(async () => {
  if (props.param) await loadOrder({ id: props.param });
});
</script>
```

These props/emits are still forwarded by VcBladeSlot for backward compatibility, but new blade pages should use `useBlade()` instead.

</details>

**How it works:**
1. `openBlade` automatically sets `parentId` = current blade's ID
2. `param` appears in the URL: `/#/orders/order/uuid-123`
3. `options` is passed as props but is **not** serialized to the URL
4. `onOpen`/`onClose` callbacks fire when the blade opens/closes

<details>
<summary>Legacy equivalent (emit)</summary>

```vue
<!-- In detail blade (legacy) -->
<script lang="ts" setup>
// Instead of callParent("reload"):
emit("parent:call", { method: "reload" });
</script>
```

</details>

---

## 3. Create → Save → Reopen with ID

When creating a new entity the blade opens without `param`. After saving, it needs to reopen with the real ID to switch into edit mode.

### Solution: `replaceWith()`

```vue
<script lang="ts" setup>
const { param, options, callParent, replaceWith } = useBlade();

async function onSave() {
  if (order.value.id) {
    // Update existing
    await updateOrder(order.value);
  } else {
    // Create new
    await createOrder(order.value);
  }

  // Refresh the parent list
  await callParent("reload");

  // If this was a creation — replace current blade with "edit" using the real ID
  if (!param.value && order.value.id) {
    await replaceWith({
      name: "OrderDetails",
      param: order.value.id,
      options: options.value,     // forward the same options
    });
    return;  // blade is already replaced
  }
}
</script>
```

**How `replaceWith` works:**
1. The current blade (create) is **destroyed**
2. A new blade (edit) is created at the **same index** with the same `parentId`
3. The URL automatically updates to `/#/orders/order/<new-id>`
4. The parent-child link is preserved — `callParent` continues to work
5. Breadcrumbs stay the same — no extra entries

> **`replaceWith` vs `coverWith`:** Use `replaceWith` when you want a true replacement (e.g., create→edit transition). Use `coverWith` when you want to keep the old blade alive underneath — closing the covering blade will restore the hidden one. See [Recipe below](#cover-with-return).

**Why NOT `callParent("onItemClick")`:**
- Tight coupling — the child knows about the parent's internal methods
- The parent must expose `onItemClick` just for this one case
- `replaceWith` is encapsulated — the child decides how to reopen itself

<details>
<summary>Legacy approach (before replaceWith) — NOT recommended for new code</summary>

```vue
<script lang="ts" setup>
// In the detail blade: ask parent to reopen us
emit("parent:call", { method: "reload" });
emit("parent:call", { method: "onItemClick", args: item.value });

// Requires: parent exposes onItemClick, parent closes old blade and opens a new one
</script>
```

</details>

---

## 4. Delete from child → close & refresh parent

Deleting an entity from a detail blade: delete → refresh the list → close self.

```vue
<script lang="ts" setup>
const { param, callParent, closeSelf } = useBlade();
const { showConfirmation } = usePopup();

async function onDelete() {
  const confirmed = await showConfirmation(
    t("ORDERS.ALERTS.DELETE_CONFIRMATION")
  );
  if (!confirmed) return;

  await deleteOrder({ id: param.value });
  await callParent("reload");   // refresh the list
  await closeSelf();            // close the detail blade
}
</script>
```

**Order matters:**
1. First `callParent("reload")` — refresh the list while the blade still exists
2. Then `closeSelf()` — close the blade (after closing, `callParent` is no longer available)

<details>
<summary>Legacy equivalent</summary>

```vue
<script lang="ts" setup>
emit("parent:call", { method: "reload" });
emit("close:blade");
</script>
```

</details>

---

## 5. Unsaved changes guard

Prevent data loss when closing a blade with unsaved changes.

```vue
<script lang="ts" setup>
import { useBlade, usePopup, useBeforeUnload } from "@vc-shell/framework";

const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

const isModified = computed(() => /* ... change tracking logic */);

// Guard: return true = PREVENT close, false = ALLOW
onBeforeClose(async () => {
  if (isModified.value) {
    // showConfirmation returns true if the user confirmed
    const discardChanges = await showConfirmation(
      t("COMMON.ALERTS.CLOSE_CONFIRMATION")
    );
    return !discardChanges;  // true (prevent) if NOT confirmed
  }
  return false;  // allow close
});

// Bonus: warn on browser tab close
useBeforeUnload(isModified);
</script>
```

**Important:** Guards are evaluated in cascade. When closing a parent blade, guards of all child blades are checked first (deepest first). If any guard returns `true`, the entire chain's closure is cancelled.

<details>
<summary>Legacy: inverted semantics!</summary>

```vue
<!-- LEGACY: false = prevent, undefined/true = allow -->
onBeforeClose(async () => {
  if (isModified.value) {
    return confirm("Discard?") ? undefined : false;
  }
});
```

The adapter automatically inverts the result. When migrating to the new API, don't forget to flip the logic!

</details>

---

## 6. Opening a blade from dashboard / notification

`useBlade()` works **everywhere** — even outside blade context (dashboard cards, notification templates, composables). The only limitation: blade-specific methods (`closeSelf`, `callParent`, `param`, etc.) are not available.

### Dashboard card

```vue
<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

async function onItemClick(item?: Order) {
  // Step 1: open workspace (clears the stack)
  await openBlade({
    name: "Orders",
    isWorkspace: true,
  });

  // Step 2: open detail as child (stack: [Orders] → [OrderDetails])
  if (item?.id) {
    await openBlade({
      name: "OrderDetails",
      param: item.id,
    });
  }
}
</script>
```

### Notification template

```vue
<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

async function onClick() {
  // Open workspace + detail in two calls
  await openBlade({
    name: "Products",
    param: props.notification.productId,
    isWorkspace: true,
  });
  await openBlade({
    name: "ProductDetails",
    param: props.notification.productId,
  });
}
</script>
```

**The `isWorkspace: true` → `openBlade` pattern:**
- The first call with `isWorkspace: true` clears the stack and sets up the workspace
- The second call without the flag opens a child. `parentId` is automatically set to the workspace

---

## 7. 3+ levels of nesting

Blades can nest arbitrarily deep: list → detail → sub-detail → sub-sub-detail.

```
+----------+  +----------------+  +-----------------+  +-------------------+
|  Orders  |→ | OrderDetails   |→ | ShippingList    |→ | ShippingDetails   |
|  [0]     |  | [1]            |  | [2]             |  | [3]               |
+----------+  +----------------+  +-----------------+  +-------------------+
```

### OrderDetails → opens ShippingList

```vue
<script lang="ts" setup>
const { openBlade } = useBlade();

function openShipments() {
  openBlade({
    name: "ShippingList",
    options: { orderId: order.value.id },
  });
}
</script>
```

### ShippingList → opens ShippingDetails

```vue
<script lang="ts" setup>
const { openBlade, callParent } = useBlade();

function onShipmentClick(item: Shipment) {
  openBlade({
    name: "ShippingDetails",
    param: item.id,
    options: { shipment: item },
  });
}

// On shipment save — refresh both own list and the parent order
async function saveShipment(data: Shipment) {
  await api.saveShipment(data);
  await reload();              // own list
  await callParent("reload");  // OrderDetails
}

defineExpose({ title, reload, saveShipment });
</script>
```

**URL limitation:** Only 1 child blade level is reflected in the URL:
- `/#/orders/order/uuid-123` — workspace + 1 child
- Blades [2], [3] are **not reflected** in the URL — they are only restored via manual navigation

**`callParent` goes up 1 level.** If ShippingDetails needs to refresh Orders (2 levels up), it must chain through: ShippingDetails → `callParent("reload")` → ShippingList.reload() → `callParent("reload")` → OrderDetails.reload().

---

## 8. Picker blade — select and return data

A "picker" blade opens for entity selection and returns the result to the parent via `callParent`.

### Parent — opens the picker

```vue
<script lang="ts" setup>
const { openBlade } = useBlade();

function openProductPicker() {
  openBlade({
    name: "ProductPicker",
    options: { excludeIds: existingProducts.value.map(p => p.id) },
  });
}

// Method that the picker will call with selected items
function addProducts(args: { items: Product[] }) {
  products.value.push(...args.items);
}

defineExpose({ title, reload, addProducts });
</script>
```

### Picker — selects and returns

```vue
<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

defineOptions({ name: "ProductPicker" });

const { callParent, closeSelf } = useBlade();
const selectedItems = ref<Product[]>([]);

async function onConfirm() {
  // Send selected items to parent
  await callParent("addProducts", {
    items: selectedItems.value,
  });
  // Close the picker
  await closeSelf();
}
</script>
```

**Pattern:**
1. Parent exposes a receiver method (`addProducts`)
2. Picker calls `callParent("addProducts", data)`
3. Picker closes itself via `closeSelf()`

<details>
<summary>Legacy equivalent</summary>

```vue
<!-- Picker (legacy) -->
<script lang="ts" setup>
function onConfirm() {
  emit("parent:call", {
    method: "addProducts",
    args: { items: selectedItems.value },
  });
  emit("close:blade");
}
</script>
```

</details>

---

## 9. Expose methods to children

Two ways to make parent blade methods available to child blades.

### Approach 1: `exposeToChildren()` (recommended)

Explicit registration via the messaging system:

```vue
<script lang="ts" setup>
const { exposeToChildren } = useBlade();

async function reload() { /* ... */ }
async function getItemCount() { return items.value.length; }

// Explicitly register methods for child blades
exposeToChildren({ reload, getItemCount });

// title still via defineExpose (consumed by VcBladeSlot)
defineExpose({ title });
</script>
```

### Approach 2: `defineExpose()` (current approach, legacy-compatible)

VcBladeSlot automatically picks up functions from `defineExpose` and registers them in messaging:

```vue
<script lang="ts" setup>
// All functions from expose are automatically available via callParent
defineExpose({
  title,          // string — not a function, used for the header
  reload,         // function — available as callParent("reload")
  onItemClick,    // function — available as callParent("onItemClick", args)
});
</script>
```

**When to use which:**

| Criterion | `exposeToChildren()` | `defineExpose()` |
|-----------|---------------------|------------------|
| Explicitness | Clearly meant for children | Mixed with title, refs |
| Typing | Same string keys | Same string keys |
| Compatibility | New API only | Works with both legacy and new |
| When to choose | New code | Existing code, gradual migration |

> **Note:** Both approaches can be used simultaneously. `exposeToChildren` registers directly in messaging, `defineExpose` — via VcBladeSlot. On name conflicts, `exposeToChildren` takes priority.

---

## Cheat Sheet: BladeOpenEvent

All `openBlade()` options:

```typescript
openBlade({
  name: "BladeName",       // required — name from defineOptions
  param: "entity-id",      // entity ID → URL path
  query: { tab: "info" },  // → URL query params (?tab=info)
  options: { data: obj },  // large data → NOT in URL
  isWorkspace: true,       // clear stack, set as root
  onOpen() { },            // callback after opening
  onClose() { },           // callback after closing
});
```

## Cheat Sheet: defineOptions for a blade

```typescript
defineOptions({
  name: "OrderDetails",    // unique name (required)
  url: "/order",           // URL segment (optional, for routable blades)
  isWorkspace: false,      // true for root list blades
  routable: true,          // true = can be restored from URL (deep link)
  menuItem: {              // workspace only — adds a sidebar menu entry
    id: "orders",
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-package",
    priority: 3,
  },
});
```

## Cheat Sheet: useBlade() API

```typescript
const {
  // Identity (blade context only)
  id,           // ComputedRef<string>       — unique runtime ID
  param,        // ComputedRef<string?>      — entity ID from openBlade
  options,      // ComputedRef<Record?>      — data from openBlade
  query,        // ComputedRef<Record?>      — query params from URL
  name,         // ComputedRef<string>       — name from defineOptions
  closable,     // ComputedRef<boolean>      — has parent (can be closed)
  expanded,     // ComputedRef<boolean>      — active (rightmost) blade

  // Navigation (works EVERYWHERE)
  openBlade,    // (event: BladeOpenEvent) => Promise<void>

  // Actions (blade context only)
  closeSelf,    // () => Promise<boolean>     — close current blade
  closeChildren,// () => Promise<void>        — close child blades
  replaceWith,  // (event: BladeOpenEvent) => Promise<void>  — replace self (destroy old)
  coverWith,    // (event: BladeOpenEvent) => Promise<void>  — cover self (hide, close reveals old)

  // Communication (blade context only)
  callParent,       // <T>(method, args?) => Promise<T>
  exposeToChildren, // (methods: Record<string, Function>) => void

  // Guards & Errors (blade context only)
  onBeforeClose,    // (guard: () => Promise<boolean>) => void
  setError,         // (error: unknown) => void
  clearError,       // () => void
} = useBlade();
```
