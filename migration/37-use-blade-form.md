# 37. `useBladeForm` — Unified Form State Management

## What Changed

A new `useBladeForm` composable unifies three separate concerns that every detail blade previously wired up manually:

| Old (manual wiring) | New (single composable) |
|---|---|
| `useForm()` from vee-validate | Built into `useBladeForm` |
| `useModificationTracker()` | Built into `useBladeForm` (baseline diffing) |
| `useBeforeUnload()` | Built into `useBladeForm` (`autoBeforeClose`) |
| `onBeforeClose()` callback | Built into `useBladeForm` (`autoBeforeClose`) |
| Manual `:modified` prop on VcBlade | Auto-detected via provide/inject |
| Custom `canSave` / `disabled` logic | `canSaveOverride` option |

**Why:** Detail blades had 15-40 lines of boilerplate connecting form validation, dirty tracking, unsaved-changes guards, and save-button state. `useBladeForm` collapses this into a single call with consistent behavior across all blades.

## API Reference

```ts
import { useBladeForm } from "@vc-shell/framework";

const form = useBladeForm({
  // Required: the reactive data object being edited
  data: item,

  // Optional: additional condition that must be true for save to be enabled
  canSaveOverride?: computed(() => !isSkuValidating.value),

  // Optional: automatically register onBeforeClose + useBeforeUnload guards
  // Defaults to true
  autoBeforeClose?: boolean | ComputedRef<boolean>,

  // Optional: custom confirmation message for unsaved changes dialog
  closeConfirmMessage?: MaybeRefOrGetter<string>,

  // Optional: callback when user confirms revert/cancel
  onRevert?: () => void | Promise<void>,
});
```

**Returned values:**

| Property | Type | Description |
|---|---|---|
| `setBaseline()` | `() => void` | Snapshot current data as the "clean" state |
| `revert()` | `() => void \| Promise<void>` | Reset data to baseline, calls `onRevert` if provided |
| `canSave` | `ComputedRef<boolean>` | `true` when form is valid, modified, and `canSaveOverride` passes |
| `isModified` | `ComputedRef<boolean>` | `true` when current data differs from baseline |
| `isReady` | `ComputedRef<boolean>` | `true` when data is loaded and baseline is set |
| `formMeta` | vee-validate `FormMeta` | Full vee-validate form metadata |
| `setFieldError` | `(field, message) => void` | Set a validation error on a specific field |
| `errorBag` | `Ref<Record<string, string>>` | All current validation errors |

## Lifecycle

1. **After load**: call `form.setBaseline()` to snapshot the clean state.
2. **After save**: call `form.setBaseline()` again to reset the dirty tracker.
3. **On cancel/reset**: call `form.revert()` to restore the baseline snapshot.

VcBlade automatically detects `isModified` via provide/inject — you no longer need to pass `:modified="isModified"` as a prop.

## Migration Examples

### 1. Simple Blade (useForm + useBeforeUnload)

**Before:**

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { useBeforeUnload, useBlade } from "@vc-shell/framework";

const { item, loading, load, save } = useMyDetails();
const { onBeforeClose } = useBlade();

const { errorBag, setFieldError, meta: formMeta } = useForm({
  initialValues: item,
});

useBeforeUnload(computed(() => formMeta.value.dirty));

onBeforeClose(async () => {
  if (formMeta.value.dirty) {
    return confirm("You have unsaved changes. Discard?");
  }
  return true;
});

const canSave = computed(() => formMeta.value.dirty && formMeta.value.valid);

async function handleSave() {
  await save(item.value);
}
</script>

<template>
  <VcBlade :modified="formMeta.dirty" :closable="true">
    <!-- blade content -->
    <template #action:save>
      <VcButton :disabled="!canSave" @click="handleSave">Save</VcButton>
    </template>
  </VcBlade>
</template>
```

**After:**

```vue
<script setup lang="ts">
import { useBladeForm } from "@vc-shell/framework";

const { item, loading, load, save } = useMyDetails();

const { canSave, setFieldError, errorBag, setBaseline } = useBladeForm({
  data: item,
});

watch(item, () => {
  if (item.value) setBaseline();
}, { once: true });

async function handleSave() {
  await save(item.value);
  setBaseline();
}
</script>

<template>
  <VcBlade :closable="true">
    <!-- blade content — no :modified prop needed -->
    <template #action:save>
      <VcButton :disabled="!canSave" @click="handleSave">Save</VcButton>
    </template>
  </VcBlade>
</template>
```

### 2. Medium Blade (useForm + useModificationTracker + useBeforeUnload + onBeforeClose)

**Before:**

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { useBeforeUnload, useModificationTracker, useBlade, usePopup } from "@vc-shell/framework";

const { item, loading, load, save } = useOfferDetails();
const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

const { errorBag, setFieldError, meta: formMeta } = useForm({
  initialValues: item,
});

const { currentValue, resetModificationState, isModified } = useModificationTracker(item);

useBeforeUnload(computed(() => isModified.value));

onBeforeClose(async () => {
  if (isModified.value) {
    return showConfirmation(t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
  return true;
});

const canSave = computed(
  () => isModified.value && formMeta.value.valid && !loading.value,
);

async function handleSave() {
  await save(item.value);
  resetModificationState();
}

async function handleCancel() {
  item.value = JSON.parse(JSON.stringify(currentValue.value));
  resetModificationState();
}
</script>

<template>
  <VcBlade :modified="isModified" :closable="true">
    <!-- blade content -->
    <template #action:save>
      <VcButton :disabled="!canSave" @click="handleSave">Save</VcButton>
    </template>
    <template #action:cancel>
      <VcButton @click="handleCancel">Cancel</VcButton>
    </template>
  </VcBlade>
</template>
```

**After:**

```vue
<script setup lang="ts">
import { useBladeForm } from "@vc-shell/framework";

const { item, loading, load, save } = useOfferDetails();

const { canSave, isModified, setBaseline, revert, setFieldError, errorBag } = useBladeForm({
  data: item,
  closeConfirmMessage: () => t("OFFERS.PAGES.ALERTS.CLOSE_CONFIRMATION"),
});

watch(item, () => {
  if (item.value) setBaseline();
}, { once: true });

async function handleSave() {
  await save(item.value);
  setBaseline();
}
</script>

<template>
  <VcBlade :closable="true">
    <!-- blade content — no :modified prop needed -->
    <template #action:save>
      <VcButton :disabled="!canSave" @click="handleSave">Save</VcButton>
    </template>
    <template #action:cancel>
      <VcButton @click="revert">Cancel</VcButton>
    </template>
  </VcBlade>
</template>
```

### 3. Complex Blade (all of the above + custom disabled logic)

**Before:**

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import {
  useBeforeUnload,
  useModificationTracker,
  useBlade,
  usePopup,
} from "@vc-shell/framework";

const { item, loading, load, save } = useProductDetails();
const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

const isSkuValidating = ref(false);

const { errorBag, setFieldError, meta: formMeta } = useForm({
  initialValues: item,
});

const { currentValue, resetModificationState, isModified } = useModificationTracker(item);

useBeforeUnload(computed(() => isModified.value));

onBeforeClose(async () => {
  if (isModified.value) {
    return showConfirmation(t("PRODUCTS.PAGES.ALERTS.CLOSE_CONFIRMATION"));
  }
  return true;
});

const canSave = computed(
  () =>
    isModified.value &&
    formMeta.value.valid &&
    !loading.value &&
    !isSkuValidating.value,
);

function markProductDirty() {
  // Force modification tracker to see a change
  if (item.value) {
    item.value.__dirty = Date.now();
  }
}

async function handleSave() {
  await save(item.value);
  resetModificationState();
}

async function handleCancel() {
  item.value = JSON.parse(JSON.stringify(currentValue.value));
  resetModificationState();
}
</script>

<template>
  <VcBlade :modified="isModified" :closable="true">
    <!-- blade content -->
    <template #action:save>
      <VcButton :disabled="!canSave" @click="handleSave">Save</VcButton>
    </template>
  </VcBlade>
</template>
```

**After:**

```vue
<script setup lang="ts">
import { useBladeForm } from "@vc-shell/framework";

const { item, loading, load, save } = useProductDetails();

const isSkuValidating = ref(false);

const { canSave, isModified, setBaseline, revert, setFieldError, errorBag } = useBladeForm({
  data: item,
  canSaveOverride: computed(() => !isSkuValidating.value && !loading.value),
  closeConfirmMessage: () => t("PRODUCTS.PAGES.ALERTS.CLOSE_CONFIRMATION"),
});

watch(item, () => {
  if (item.value) setBaseline();
}, { once: true });

async function handleSave() {
  await save(item.value);
  setBaseline();
}
</script>

<template>
  <VcBlade :closable="true">
    <!-- blade content — no :modified prop, no markProductDirty -->
    <template #action:save>
      <VcButton :disabled="!canSave" @click="handleSave">Save</VcButton>
    </template>
    <template #action:cancel>
      <VcButton @click="revert">Cancel</VcButton>
    </template>
  </VcBlade>
</template>
```

**What was removed:**
- `useForm()` — absorbed by `useBladeForm`
- `useModificationTracker()` — absorbed by `useBladeForm` (baseline diffing)
- `useBeforeUnload()` — absorbed by `useBladeForm` (`autoBeforeClose`)
- `onBeforeClose()` callback — absorbed by `useBladeForm` (`autoBeforeClose`)
- `:modified` prop on VcBlade — auto-detected via inject
- `markProductDirty()` hack — no longer needed; `isModified` is based on deep comparison
- `currentValue` ref — replaced by internal baseline in `useBladeForm`
- `resetModificationState()` — replaced by `setBaseline()`

## Data Composable Migration

If your data composable (e.g., `useOfferDetails`) uses `useModificationTracker` internally, migrate it:

**Before:**

```ts
export function useOfferDetails() {
  const item = ref<Offer>();
  const { currentValue, resetModificationState, isModified } = useModificationTracker(item);

  async function load(id: string) {
    item.value = await api.getOffer(id);
    resetModificationState();
  }

  async function save(data: Offer) {
    item.value = await api.saveOffer(data);
    resetModificationState();
  }

  return { item, currentValue, resetModificationState, isModified, load, save };
}
```

**After:**

```ts
export function useOfferDetails() {
  const item = ref<Offer>();

  async function load(id: string) {
    item.value = await api.getOffer(id);
  }

  async function save(data: Offer) {
    item.value = await api.saveOffer(data);
  }

  return { item, load, save };
}
```

The blade component now owns modification tracking via `useBladeForm`. The data composable simply loads and saves — no tracking responsibility.

## Migration Checklist

- [ ] Replace `useForm()` + `useModificationTracker()` + `useBeforeUnload()` with `useBladeForm()`
- [ ] Remove `onBeforeClose()` callback — `useBladeForm` handles it via `autoBeforeClose`
- [ ] Remove `:modified` prop from `<VcBlade>` — auto-detected via inject
- [ ] Call `setBaseline()` after initial load and after each successful save
- [ ] Replace cancel/reset logic with `revert()`
- [ ] If custom save-disabled logic exists, pass `canSaveOverride` option
- [ ] Remove `useModificationTracker` from data composables; remove `currentValue` and `resetModificationState` from return values
- [ ] Remove `markProductDirty()` or similar hacks — `isModified` uses deep comparison
- [ ] Remove manual `import { useForm } from "vee-validate"` — no longer needed in blade components

## Automated Migration

```bash
npx @vc-shell/migrate --transform use-blade-form
```

The codemod handles:
- Replacing `useForm` + `useModificationTracker` + `useBeforeUnload` imports with `useBladeForm`
- Rewriting the composable call and destructuring
- Removing `:modified` prop from `<VcBlade>`
- Replacing `resetModificationState()` calls with `setBaseline()`

Manual review is needed for:
- Custom `canSaveOverride` logic (codemod adds a TODO comment)
- `onRevert` callbacks with side effects
- Data composables that return `currentValue` or `resetModificationState` to other consumers

## How to Find

```bash
# Find blades using useForm + useModificationTracker (primary candidates)
grep -rn "useModificationTracker" src/ --include="*.vue" --include="*.ts"

# Find blades with manual onBeforeClose + dirty check pattern
grep -rn "onBeforeClose" src/ --include="*.vue"

# Find blades passing :modified prop to VcBlade
grep -rn ':modified=' src/ --include="*.vue"

# Find data composables returning resetModificationState
grep -rn "resetModificationState" src/ --include="*.ts"
```
