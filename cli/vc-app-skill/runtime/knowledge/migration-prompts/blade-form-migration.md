---
name: blade-form-migration
description: AI transformation rules for useForm + onBeforeClose → useBladeForm.
---

# Blade Form Migration: useForm → useBladeForm

Replace manual wiring of `useForm()` (vee-validate) + `useModificationTracker()` + `useBeforeUnload()` + `onBeforeClose()` with the unified `useBladeForm()` composable.

## RULE 1: Replace useForm + onBeforeClose with useBladeForm

**BEFORE:**

```typescript
import { useForm } from "vee-validate";
import { useBeforeUnload, useModificationTracker, useBlade, usePopup } from "@vc-shell/framework";

const { item, loading, load, save } = useMyDetails();
const { onBeforeClose } = useBlade();
const { showConfirmation } = usePopup();

const { errorBag, setFieldError, meta: formMeta } = useForm({
  initialValues: item,
});

const { currentValue, resetModificationState, isModified } = useModificationTracker(item);

useBeforeUnload(computed(() => isModified.value));

onBeforeClose(async () => {
  if (isModified.value) {
    return showConfirmation(t("MY_MODULE.ALERTS.CLOSE_CONFIRMATION"));
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
```

**AFTER:**

```typescript
import { useBladeForm } from "@vc-shell/framework";

const { item, loading, load, save } = useMyDetails();

const { canSave, isModified, setBaseline, revert, setFieldError, errorBag } = useBladeForm({
  data: item,
  closeConfirmMessage: () => t("MY_MODULE.ALERTS.CLOSE_CONFIRMATION"),
});

watch(item, () => {
  if (item.value) setBaseline();
}, { once: true });

async function handleSave() {
  await save(item.value);
  setBaseline();
}
```

## RULE 2: Remove onBeforeClose Entirely

`useBladeForm` handles the unsaved-changes guard automatically via `autoBeforeClose` (defaults to `true`).

**BEFORE:**

```typescript
const { onBeforeClose } = useBlade();

onBeforeClose(async () => {
  if (formMeta.value.dirty) {
    return confirm("You have unsaved changes. Discard?");
  }
  return true;
});
```

**AFTER:**

```typescript
// Remove entirely. useBladeForm handles this.
// If you need a custom message, pass closeConfirmMessage option:
const form = useBladeForm({
  data: item,
  closeConfirmMessage: () => t("MY_MODULE.ALERTS.CLOSE_CONFIRMATION"),
});
```

## RULE 3: Update Toolbar Disabled Logic

**BEFORE:**

```typescript
const canSave = computed(
  () => !meta.value.valid || !isModified.value,
);

// or in toolbar items:
{
  id: "save",
  disabled: computed(() => !formMeta.value.valid || !isModified.value),
}
```

**AFTER:**

```typescript
// canSave is returned directly from useBladeForm:
const { canSave } = useBladeForm({ data: item });

// In toolbar items:
{
  id: "save",
  disabled: computed(() => !canSave.value),
}
```

For additional disabled conditions (e.g., async validation in progress), use `canSaveOverride`:

```typescript
const { canSave } = useBladeForm({
  data: item,
  canSaveOverride: computed(() => !isSkuValidating.value && !loading.value),
});
```

## RULE 4: Keep Field from vee-validate

Only remove `useForm` from vee-validate imports. Keep `Field`, `ErrorMessage`, and other template-level components — they still work with `useBladeForm` which uses vee-validate internally.

**BEFORE:**

```typescript
import { useForm, Field, ErrorMessage } from "vee-validate";
```

**AFTER:**

```typescript
import { Field, ErrorMessage } from "vee-validate";
```

## RULE 5: Remove useBeforeUnload / useModificationTracker

`useBladeForm` handles both browser unload guards and modification tracking internally.

**BEFORE:**

```typescript
import { useBeforeUnload, useModificationTracker } from "@vc-shell/framework";

const { currentValue, resetModificationState, isModified } = useModificationTracker(item);
useBeforeUnload(computed(() => isModified.value));
```

**AFTER:**

```typescript
// Remove entirely. useBladeForm provides:
// - isModified (deep comparison against baseline)
// - setBaseline() (replaces resetModificationState)
// - revert() (replaces manual JSON.parse(JSON.stringify(currentValue.value)))
// - Browser unload guard (automatic)
```

Also remove `useModificationTracker` from data composables if present:

**BEFORE (data composable):**

```typescript
export function useMyDetails() {
  const item = ref<MyItem>();
  const { currentValue, resetModificationState, isModified } = useModificationTracker(item);

  async function load(id: string) {
    item.value = await api.get(id);
    resetModificationState();
  }

  return { item, currentValue, resetModificationState, isModified, load, save };
}
```

**AFTER (data composable):**

```typescript
export function useMyDetails() {
  const item = ref<MyItem>();

  async function load(id: string) {
    item.value = await api.get(id);
  }

  return { item, load, save };
}
```

## Template Changes

Remove `:modified` prop from `<VcBlade>` — it is auto-detected via provide/inject.

**BEFORE:**

```vue
<template>
  <VcBlade :modified="isModified" :closable="true">
    <!-- content -->
  </VcBlade>
</template>
```

**AFTER:**

```vue
<template>
  <VcBlade :closable="true">
    <!-- content — no :modified prop needed -->
  </VcBlade>
</template>
```

## Verification

After migration:

1. Run `npx tsc --noEmit` to verify no TypeScript errors
2. Confirm the blade shows a modified indicator when data changes
3. Confirm closing a modified blade shows the confirmation dialog
4. Confirm the save button is disabled when form is clean or invalid
5. Confirm `setBaseline()` is called after initial load and after save
6. Confirm cancel/revert restores data to the last baseline
7. Confirm `useModificationTracker` is removed from data composables
8. Confirm no stale imports of `useForm`, `useBeforeUnload`, `useModificationTracker`, or `onBeforeClose`
