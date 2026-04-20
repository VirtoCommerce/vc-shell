# Blade Navigation Pattern

Blades are stacked panels rendered by `VcBladeNavigation`. Navigation between blades is handled exclusively through the `useBlade()` composable — never via Vue Router `push/replace`.

---

## `useBlade()` — Unified API

```ts
import { useBlade } from "@vc-shell/framework";

const { openBlade, closeSelf, callParent, exposeToChildren, onBeforeClose, param, options } = useBlade<OptionsType>();
```

`useBlade()` must be called inside `<script setup>` of a blade component. It uses provide/inject to wire the blade hierarchy.

---

## `param` — Reactive ref to the route parameter

```ts
const { param } = useBlade();

// Read the id passed when this blade was opened:
if (param.value) {
  await getXxx({ id: param.value });
}
```

- `param` is `Ref<string | undefined>`
- When `undefined`, the blade is in "create new" mode (opened with no param)
- When set, the blade is in "edit existing" mode

---

## `options` — Reactive ref to arbitrary options

```ts
const { options } = useBlade<{ prefilledName?: string }>();

// Read options passed from parent:
entity.value.name = options.value?.prefilledName ?? "";
```

- `options` is `Ref<OptionsType | undefined>` where `OptionsType` is the generic on `useBlade<T>()`
- Options are not part of the URL — they are passed only at runtime

---

## `openBlade()` — Open a child blade

Full signature:

```ts
openBlade({
  name: string,           // defineBlade name of the target blade
  param?: string,         // optional route param (entity id)
  options?: object,       // optional extra data passed to child
  onOpen?: () => void,    // called when child opens
  onClose?: () => void,   // called when child closes
})
```

### Pattern A — Row click in list blade

```ts
const onItemClick = (event: { data: { id?: string } }) => {
  openBlade({
    name: "XxxDetails",
    param: event.data.id,
    onOpen() {
      selectedItemId.value = event.data.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};
```

`onClose` is used to clear the highlighted row when the child blade closes.

### Pattern B — Open child from details blade with reload trigger

```ts
openBlade({
  name: "RelatedItemsList",
  options: { parentId: entity.value.id },
  onClose() {
    // reload the current blade's data after child closes
    loadEntity();
  },
});
```

### Pattern C — Add new (no param)

```ts
function onAddItem() {
  openBlade({ name: "XxxDetails" });
}
```

Opening without `param` signals the child that it should create a new entity.

---

## `closeSelf()` — Close the current blade

```ts
const { closeSelf } = useBlade();

// After successful save:
callParent("reload");
closeSelf();
```

`closeSelf()` triggers the `onBeforeClose` guard if one is registered. If the guard returns `true`, the close is blocked.

---

## `callParent()` — Call an exposed method on the parent blade

```ts
const { callParent } = useBlade();

// In details blade after save:
await updateXxx(entity.value);
callParent("reload"); // calls parent's reload() function
closeSelf();
```

`callParent("methodName")` invokes the function that the parent blade exposed via `exposeToChildren`. If no parent has exposed that method, the call is a no-op.

---

## `exposeToChildren()` — Expose methods to child blades

```ts
const { exposeToChildren } = useBlade();

async function reload() {
  await getXxxs({ ...searchQuery.value, sort: sortExpression.value });
}

// At the end of setup — exposes reload so children can call it via callParent("reload")
exposeToChildren({ reload });
```

- Call once, at the bottom of `<script setup>`
- Pass a plain object of functions
- Method names must match exactly what children pass to `callParent()`

---

## `onBeforeClose()` — Unsaved changes guard

```ts
import { unref, computed } from "vue";
const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

onBeforeClose(async () => {
  if (modified.value) {
    // returns true to BLOCK close, false to ALLOW close
    return !(await showConfirmation(unref(computed(() => t("MODULE.PAGES.ALERTS.CLOSE_CONFIRMATION")))));
  }
  return false; // no unsaved changes — allow close
});
```

Return value semantics:

- `false` → close is allowed
- `true` → close is blocked (user stays on the blade)

The pattern `!(await showConfirmation(...))` works as:

- User clicks "Confirm" → `showConfirmation` returns `true` → `!true` = `false` → close allowed
- User clicks "Cancel" → `showConfirmation` returns `false` → `!false` = `true` → close blocked

---

## Complete Navigation Flow: List → Details → Save → Return

```
List blade (XxxList)
  exposeToChildren({ reload })
  onItemClick → openBlade({ name: "XxxDetails", param: item.id, onClose: clearSelection })

Details blade (XxxDetails)
  param.value = item.id  (loaded via getXxx on mount)
  onBeforeClose guard: checks modified.value
  Save button → updateXxx() → callParent("reload") → closeSelf()
    ↳ triggers parent's reload()
    ↳ triggers onClose() → clears selectedItemId
```

---

## Key Rules

1. **Never use `$router.push()`** to navigate between blades — always use `openBlade()`.
2. **`param` is always a string** — pass `item.id` (string), not the whole item object.
3. **`options` for extra data** — if the child blade needs more than just the id (e.g., a pre-filled field), pass it via `options`.
4. **`exposeToChildren` must be called once** — calling it multiple times overwrites the exposed context.
5. **`callParent` is safe to call** even if no parent exposed the method — it silently no-ops.
6. **`onBeforeClose` is async** — the guard callback can be async (await confirmation dialog).
