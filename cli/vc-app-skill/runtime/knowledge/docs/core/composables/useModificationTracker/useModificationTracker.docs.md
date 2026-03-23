# useModificationTracker

Tracks deep changes to a value and reports whether it has been modified compared to its original (pristine) state. This is the core composable behind the "unsaved changes" detection pattern in vc-shell blades. It handles complex nested objects, arrays, and the common API quirk where `null`, `undefined`, and `""` should be treated as equivalent empty values.

The composable maintains two copies of the data: the `pristineValue` (the clean baseline) and the `currentValue` (the working copy bound to form fields). Any deep difference between the two sets `isModified` to `true`.

## When to Use

- Detect unsaved changes in blade forms to enable/disable save buttons or show confirmation dialogs
- Track modifications to complex nested objects (arrays, nested properties)
- Pair with `useBeforeUnload` to prevent the browser tab from closing with unsaved changes
- When NOT to use: for simple boolean flags (a plain `ref` is sufficient)

## Basic Usage

```typescript
import { useModificationTracker } from '@vc-shell/framework';

// With a static initial value
const { currentValue, isModified, resetModificationState } = useModificationTracker({ name: '', price: 0 });

// With a reactive source (e.g., data loaded from API)
const { currentValue, isModified, resetModificationState } = useModificationTracker(apiData);
// currentValue updates automatically when apiData changes (if user hasn't modified it yet)

// Bind to form
// <input v-model="currentValue.name" />

// After save
resetModificationState(); // currentValue becomes the new pristine baseline
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `initialValueProp` | `T \| Ref<T>` | Yes | Initial value or reactive ref to track |

### Returns

| Property | Type | Description |
|---|---|---|
| `currentValue` | `Ref<T>` | The working value (bind to v-model) |
| `pristineValue` | `Ref<T>` | The "clean" baseline value |
| `isModified` | `DeepReadonly<Ref<boolean>>` | `true` when `currentValue` differs from `pristineValue` |
| `resetModificationState` | `(newBaseline?: T \| Ref<T>) => void` | Reset modification tracking; optionally set a new baseline |

## Recipe: Blade with Save/Discard and Unsaved Changes Guard

```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { useModificationTracker } from "@vc-shell/framework";
import { useBeforeUnload } from "@vueuse/core";

// Simulate API data loaded into a ref
const apiData = ref({ name: "Widget A", price: 19.99, tags: ["sale"] });

const { currentValue, isModified, resetModificationState } = useModificationTracker(apiData);

// Prevent browser tab close when there are unsaved changes
useBeforeUnload(isModified);

async function save() {
  await api.update(currentValue.value);
  // After a successful save, the current state becomes the new baseline
  resetModificationState();
}

function discard() {
  // Reset currentValue back to the pristine baseline
  resetModificationState(apiData.value);
}
</script>

<template>
  <VcBlade title="Edit Widget">
    <input v-model="currentValue.name" />
    <input v-model.number="currentValue.price" />

    <div class="tw-flex tw-gap-2">
      <button :disabled="!isModified" @click="save">Save</button>
      <button :disabled="!isModified" @click="discard">Discard</button>
    </div>
  </VcBlade>
</template>
```

## Recipe: Reset to a New Baseline After Server Response

When the server returns a transformed version of the saved entity (e.g., with computed fields populated), pass it to `resetModificationState` so the tracker uses the server response as the new clean state:

```typescript
async function save() {
  const saved = await api.update(currentValue.value);
  // Use the server response as the new baseline, not the local currentValue
  resetModificationState(saved);
}
```

## Details

- **Semantic empty-value normalization**: `null`, `undefined`, and `""` are treated as equal during comparison. This prevents false positives when an API returns `null` for a field that the form initializes as `""` or `undefined`.
- **Reactive source tracking**: When `initialValueProp` is a `Ref` and changes externally, `pristineValue` updates automatically. If the user has not yet modified `currentValue`, it also updates to match. If the user has already made changes, only `pristineValue` updates (preserving the user's edits), and `isModified` remains `true`.
- **Deep cloning**: All values are deep-cloned via `lodash-es/cloneDeep` to prevent shared references between pristine and current copies.
- **Synchronous reset**: `resetModificationState` sets `isModified` to `false` synchronously in the same tick. This is important for `onBeforeClose` guards that check `isModified` immediately after calling reset.

## Tips

- Always bind form fields to `currentValue`, never to `pristineValue`. The pristine copy is read-only and represents the "last saved" state.
- When using with `useBeforeUnload`, pass `isModified` directly -- it is already a ref-compatible value.
- For arrays of items (e.g., order lines), edits to individual elements are detected because the watcher uses `{ deep: true }`.
- If your form has multiple independent sections, consider using separate `useModificationTracker` instances for each section, and combine their `isModified` flags with a computed.

## Related

- `useBeforeUnload` -- pair with `isModified` to prevent tab close on unsaved changes
