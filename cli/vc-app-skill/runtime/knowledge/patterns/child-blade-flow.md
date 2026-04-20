# Child Blade Flow Pattern

Parent-child blade communication and nested blade workflows. Covers opening child blades, cross-blade method calls, close guards, and the picker blade pattern.

---

## Opening a Child Blade with `param` and `options`

```ts
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();

openBlade({
  name: "ProductDetails",
  param: product.id, // string — entity ID, appears in URL
  options: { mode: "edit", origin: "catalog" }, // object — runtime-only, not in URL
  onOpen() {
    selectedItemId.value = product.id;
  },
  onClose() {
    selectedItemId.value = undefined;
  },
});
```

- `param` is always a **string** (entity ID). When `undefined`, the child blade is in "create new" mode.
- `options` carries structured data that does not belong in the URL. Type it via the generic: `useBlade<{ mode: string }>()`.
- `onOpen` / `onClose` callbacks run when the child blade opens or closes — use them to sync selection state in the parent.

---

## `exposeToChildren()` — Parent Exposes Methods

The parent blade declares which methods child blades may invoke. Call once at the bottom of `<script setup>`.

```ts
const { exposeToChildren } = useBlade();

async function reload() {
  await searchProducts(searchQuery.value);
}

function markProductDirty() {
  isModified.value = true;
}

// Expose at end of setup — method names must match callParent("methodName")
exposeToChildren({ reload, markProductDirty, closeChildren });
```

- Pass a plain object of functions.
- Calling `exposeToChildren` multiple times **overwrites** the previous context — call it once.
- Method names must match exactly what children pass to `callParent()`.

---

## `callParent()` — Child Calls Parent Methods

```ts
const { callParent, closeSelf } = useBlade();

async function onSave() {
  await updateProduct(product.value);

  // Tell parent list to refresh its data
  await callParent("reload");

  // Close the child blade
  await closeSelf();
}
```

- `callParent("methodName", args?)` invokes the function the parent exposed via `exposeToChildren`.
- If the parent did not expose that method, the call is a **silent no-op** — no error thrown.
- `callParent` is generic for typed return values: `const count = await callParent<number>("getCount");`

---

## `onBeforeClose` Guard — Confirmation Before Closing

Prevents accidental data loss when the user closes a blade with unsaved changes.

```ts
import { useBlade, usePopup } from "@vc-shell/framework";

const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (!disabled.value && isModified.value) {
    // showConfirmation returns true if user confirms, false if cancelled
    return !(await showConfirmation(t("MODULE.PAGES.ALERTS.CLOSE_CONFIRMATION")));
  }
  return false; // no unsaved changes — allow close
});
```

Return value semantics:

- `false` — close is **allowed**
- `true` — close is **blocked** (user stays on the blade)

The `!(await showConfirmation(...))` idiom:

- User clicks "Confirm" (discard) -> `true` -> `!true` = `false` -> close allowed
- User clicks "Cancel" (stay) -> `false` -> `!false` = `true` -> close blocked

---

## Picker Blade Pattern

A child blade opened to select an item and return the result to the parent via `callParent`.

**Parent — opens picker and exposes a handler:**

```ts
const { openBlade, exposeToChildren } = useBlade();

function onPickerResult(selectedItem: Category) {
  product.value.categoryId = selectedItem.id;
  product.value.categoryName = selectedItem.name;
  isModified.value = true;
}

exposeToChildren({ onPickerResult });

function openCategoryPicker() {
  openBlade({
    name: "CategoryPicker",
    options: { currentCategoryId: product.value.categoryId },
  });
}
```

**Child (picker) — selects item and returns to parent:**

```ts
const { callParent, closeSelf, options } = useBlade<{ currentCategoryId?: string }>();

async function onSelect(category: Category) {
  await callParent("onPickerResult", category);
  await closeSelf();
}
```

The picker blade calls the parent's exposed method with the selection, then closes itself.

---

## Data Refresh Flow: Child Saves -> Parent Reloads

The standard lifecycle when a child blade modifies data and the parent list needs to update:

```
Parent (List blade)
  exposeToChildren({ reload })
  openBlade({ name: "Details", param: item.id, onClose: clearSelection })
      |
      v
Child (Details blade)
  1. User edits data
  2. onBeforeClose guard checks isModified.value
  3. Save button handler:
      await saveEntity(entity.value)
      await callParent("reload")    <-- parent refetches list data
      await closeSelf()             <-- triggers onClose callback
          |
          v
Parent receives:
  - reload() executes -> list data refreshed
  - onClose() fires -> selectedItemId cleared
```

### Complete Example

**Parent list blade:**

```vue
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

defineOptions({ name: "ProductsList", url: "/products", isWorkspace: true });

const { openBlade, exposeToChildren } = useBlade();
const selectedItemId = ref<string>();

async function reload() {
  await searchProducts(searchQuery.value);
}

function onItemClick(event: { data: { id?: string } }) {
  openBlade({
    name: "ProductDetails",
    param: event.data.id,
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

exposeToChildren({ reload });
</script>
```

**Child details blade:**

```vue
<script setup lang="ts">
import { useBlade, usePopup, defineBladeContext } from "@vc-shell/framework";

defineOptions({ name: "ProductDetails", url: "/product-details" });

const { param, callParent, closeSelf, exposeToChildren, onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

const item = ref<Product>();
const isModified = ref(false);

defineBladeContext({ item });

onMounted(async () => {
  if (param.value) {
    await loadProduct({ id: param.value });
  }
});

async function onSave() {
  await saveProduct(item.value);
  await callParent("reload");
  await closeSelf();
}

function reload() {
  if (param.value) loadProduct({ id: param.value });
}

onBeforeClose(async () => {
  if (isModified.value) {
    return !(await showConfirmation("Discard unsaved changes?"));
  }
  return false;
});

// This blade is also a parent — expose reload to its own children
exposeToChildren({ reload });
</script>
```

---

## Multi-Level Chain: List -> Details -> Sub-Details

A "middle" blade acts as both child (calls its parent) and parent (exposes methods to its own children):

```ts
const { openBlade, callParent, exposeToChildren, closeSelf } = useBlade();

// As a parent — expose reload for child blades
async function reload() {
  await loadOrder(param.value!);
}
exposeToChildren({ reload });

// As a child — open sub-details blade
function openShipment(id: string) {
  openBlade({ name: "ShipmentDetails", param: id });
}

// As a child — propagate delete up to grandparent
async function onDelete() {
  await deleteOrder(param.value!);
  await callParent("reload"); // grandparent list refreshes
  await closeSelf();
}
```

---

## Key Rules

1. **`exposeToChildren` must be called once** at the end of setup — calling it again overwrites the exposed context.
2. **`callParent` is always safe** — no-ops silently if the parent did not expose the method.
3. **`onBeforeClose` return value is inverted** — `true` blocks close, `false` allows it.
4. **Always `await callParent("reload")` before `closeSelf()`** — ensures parent data is refreshed before the child blade is destroyed.
5. **Use `defineBladeContext` for widget data sharing**, `exposeToChildren` / `callParent` for cross-blade communication — they serve different purposes.
