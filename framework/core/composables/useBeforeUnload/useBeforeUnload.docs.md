# useBeforeUnload

Prevents the browser tab from closing when unsaved changes exist by hooking into the native `beforeunload` event. This composable is the last line of defense against accidental data loss -- it triggers the browser's built-in "Leave site?" confirmation dialog whenever the user tries to close or refresh the tab while the `modified` flag is `true`. It complements in-app guards (like blade `onBeforeClose`) by covering the case where the user bypasses the application entirely via the browser chrome.

## When to Use

- Protect forms or blades with unsaved edits from accidental tab/window close or page refresh
- Pair with `useModificationTracker` to get a reactive `modified` flag automatically
- When NOT to use: for in-app navigation guards (use Vue Router `beforeRouteLeave` or blade `onBeforeClose` instead). This composable only handles the browser-level close/refresh event, not SPA route changes.

## Quick Start

```vue
<script setup lang="ts">
import { useBeforeUnload } from "@vc-shell/framework";
import { ref, computed } from "vue";

// Suppose your blade has a form with a "dirty" flag
const originalName = ref("Widget A");
const currentName = ref("Widget A");

const isModified = computed(() => originalName.value !== currentName.value);

// That is all you need -- the browser will now prompt on tab close when modified
useBeforeUnload(isModified);
</script>

<template>
  <VcBlade title="Edit Widget">
    <VcInput
      v-model="currentName"
      label="Name"
    />
    <VcButton @click="save">Save</VcButton>
  </VcBlade>
</template>
```

## API

### Parameters

| Parameter  | Type                   | Required | Description                                                                        |
| ---------- | ---------------------- | -------- | ---------------------------------------------------------------------------------- |
| `modified` | `ComputedRef<boolean>` | Yes      | When `true`, the browser shows a leave-confirmation dialog on tab close or refresh |

### Returns

| Property   | Type                   | Description                                                             |
| ---------- | ---------------------- | ----------------------------------------------------------------------- |
| `modified` | `ComputedRef<boolean>` | Pass-through of the input ref, useful for chaining or template bindings |

## How It Works

Internally, the composable registers a `beforeunload` event listener during `onBeforeMount` and removes it during `onBeforeUnmount`. Inside the listener, it calls `event.preventDefault()` only when `modified` is `true`. Modern browsers intercept `preventDefault()` on the `beforeunload` event to show their native confirmation dialog. The dialog text is always controlled by the browser and cannot be customized -- this is a deliberate security restriction to prevent phishing.

Because the listener is added in `onBeforeMount` (not `setup`), it avoids attaching to the window during SSR or before the component is actually rendered.

## Recipe: Combining with useModificationTracker in a Detail Blade

```vue
<script setup lang="ts">
import { useBeforeUnload } from "@vc-shell/framework";
import { ref, computed, watch } from "vue";

const props = defineProps<{ productId: string }>();

const product = ref({ name: "", price: 0 });
const snapshot = ref({ name: "", price: 0 });

// Load data and take a snapshot of the original state
async function load() {
  const data = await api.getProduct(props.productId);
  product.value = { ...data };
  snapshot.value = { ...data };
}

// Deep-compare current vs. snapshot
const isModified = computed(() => JSON.stringify(product.value) !== JSON.stringify(snapshot.value));

// Guard the browser tab
useBeforeUnload(isModified);

// Also guard blade navigation (separate concern)
defineExpose({
  onBeforeClose: () => {
    if (isModified.value) {
      return confirm("You have unsaved changes. Discard?");
    }
    return true;
  },
});
</script>
```

This pattern separates two concerns: `useBeforeUnload` handles the browser tab close, while `onBeforeClose` handles in-app blade navigation. Together, they cover all data-loss scenarios.

## Tips

- **Always use a computed ref, not a plain ref.** Passing a plain `Ref<boolean>` works at runtime, but the TypeScript signature requires `ComputedRef<boolean>` to encourage derived state rather than manual toggling.
- **Reset your modified flag after saving.** If you forget to reset the source data that drives `isModified`, the dialog will keep appearing even after a successful save.
- **Do not rely on this for critical workflows.** Some browsers (especially mobile) do not reliably fire `beforeunload`. Treat it as a best-effort safety net, not a guarantee.

## Related

- `useModificationTracker` -- tracks whether a value has been modified (produces a `ComputedRef<boolean>` you can pass directly)
- Blade `onBeforeClose` -- in-app navigation guard for blade stack transitions
