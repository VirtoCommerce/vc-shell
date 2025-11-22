---
id: useModificationTracker-track-changes
type: FRAMEWORK_API
category: composable
tags: [composable, modification-tracker, form, validation, changes]
title: "useModificationTracker - Track Changes"
description: "Track data modifications in forms and detail screens"
---

# useModificationTracker - Track Changes

The `useModificationTracker` composable detects changes in reactive data, enabling you to control UI elements like Save buttons based on whether data has been modified.

## Overview

- Track object/array modifications with deep equality comparison
- Enable/disable save buttons based on modification state
- Prevent data loss with unsaved changes warnings
- Reset modification state after load/save operations
- Combine with form validation for complete form management
- Export as composable pattern for reusability

## Key Implementation Points

**From Real Production Code ([offers-details.vue](apps/vendor-portal/src/modules/offers/pages/offers-details.vue), [useOffer](apps/vendor-portal/src/modules/offers/composables/useOffer/index.ts)):**

1. **Use in Composables** - Create a composable that wraps `useModificationTracker` and exports `currentValue` as a meaningful name (e.g., `offer`, `product`)
2. **Export `isModified` as `modified`** - Used for blade's `:modified` prop and toolbar button states
3. **Reset after data loads** - Call `resetModificationState()` in `onMounted` after async data loading
4. **Reset inside save actions** - Update `currentValue.value` with API response, then call `resetModificationState()`
5. **Bind to `currentValue`** - Always use `v-model="offer.name"` (not the original ref)
6. **VcBlade integration** - Pass `:modified="modified"` to show visual indicator
7. **Combine with validation** - Disable save button when `!modified.value || !meta.value.valid`
8. **Prevent data loss** - Use `onBeforeClose` and `useBeforeUnload` with `modified` check

## Basic Usage

```vue
<template>
  <VcBlade
    :title="title"
    :toolbar-items="bladeToolbar"
    :modified="modified"
    @close="$emit('close:blade')"
  >
    <VcContainer :no-padding="true">
      <div class="tw-p-4">
        <VcForm class="tw-space-y-4">
          <VcInput
            v-model="offer.name"
            label="Offer Name"
            required
          />

          <VcInput
            v-model="offer.sku"
            label="SKU"
            required
          />

          <VcInput
            v-model="offer.price"
            label="Price"
            type="number"
          />
        </VcForm>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  useModificationTracker,
  useBladeNavigation,
  usePopup,
  VcBlade,
  VcContainer,
  VcForm,
  VcInput
} from "@vc-shell/framework";
import { useOffer } from "../composables";

interface Props {
  param?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "close:blade"): void;
  (event: "parent:call", args: { method: string }): void;
}>();

const { onBeforeClose } = useBladeNavigation();
const { showConfirmation } = usePopup();
const {
  offer,
  loadOffer,
  createOffer,
  updateOffer,
  resetModificationState,
  modified
} = useOffer();

const title = computed(() => {
  return props.param ? offer.value?.name ?? "" : "New Offer";
});

const bladeToolbar = ref([
  {
    id: "save",
    title: "Save",
    icon: "material-save",
    async clickHandler() {
      if (offer.value.id) {
        await updateOffer(offer.value);
      } else {
        await createOffer(offer.value);
      }

      resetModificationState();

      emit("parent:call", { method: "reload" });
    },
    disabled: computed(() => !modified.value)
  }
]);

onMounted(async () => {
  if (props.param) {
    await loadOffer({ id: props.param });
  }

  // Reset modification state after data is loaded
  resetModificationState();
});

// Prevent closing blade with unsaved changes
onBeforeClose(async () => {
  if (modified.value) {
    return await showConfirmation("You have unsaved changes. Discard?");
  }
});
</script>
```

## With Form Validation

```vue
<template>
  <VcBlade
    title="User Profile"
    :toolbar-items="toolbarItems"
  >
    <form @submit.prevent="saveUser" class="tw-p-4 tw-space-y-4">
      <VcInput
        v-model="currentValue.name"
        label="Name"
        :error="errors.name"
        required
      />

      <VcInput
        v-model="currentValue.email"
        label="Email"
        type="email"
        :error="errors.email"
        required
      />

      <VcInput
        v-model="currentValue.phone"
        label="Phone"
        :error="errors.phone"
      />
    </form>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import {
  useModificationTracker,
  usePopup,
  VcBlade,
  VcInput
} from "@vc-shell/framework";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const { showInfo, showError } = usePopup();

const userData = ref<User>({
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890"
});

const { currentValue, isModified, resetModificationState } = useModificationTracker(userData);

const errors = reactive<Record<string, string>>({});

const isFormValid = computed(() => {
  return !!(
    currentValue.value?.name &&
    currentValue.value?.email &&
    !errors.name &&
    !errors.email
  );
});

const canSave = computed(() => {
  return isModified.value && isFormValid.value;
});

const toolbarItems = computed(() => [
  {
    id: "save",
    title: "Save Changes",
    icon: "material-save",
    isDisabled: !canSave.value,
    clickHandler: () => saveUser()
  }
]);

function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key]);

  let valid = true;

  if (!currentValue.value.name) {
    errors.name = "Name is required";
    valid = false;
  }

  if (!currentValue.value.email) {
    errors.email = "Email is required";
    valid = false;
  } else if (!isValidEmail(currentValue.value.email)) {
    errors.email = "Invalid email format";
    valid = false;
  }

  return valid;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveUser() {
  if (!validateForm()) {
    showError("Please fix validation errors");
    return;
  }

  try {
    console.log("Saving user:", currentValue.value);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    resetModificationState();
    showInfo("User saved successfully!");
  } catch (error) {
    showError("Failed to save user");
  }
}
</script>
```

## Composable Pattern (Recommended)

The best practice is to create a composable that encapsulates the modification tracking logic:

```typescript
// composables/useOffer/index.ts
import { computed, Ref, ref } from "vue";
import { useApiClient, useAsync, useLoading, useModificationTracker, useUser } from "@vc-shell/framework";
import { VcmpSellerCatalogClient, IOffer, Offer, CreateNewOfferCommand, UpdateOfferCommand } from "@vcmp-vendor-portal/api/marketplacevendor";

interface IUseOffer {
  offer: Ref<IOffer>;
  loading: ComputedRef<boolean>;
  modified: Ref<boolean>;
  resetModificationState: () => void;
  loadOffer: (args: { id: string }) => Promise<void>;
  createOffer: (details: IOffer) => Promise<void>;
  updateOffer: (details: IOffer) => Promise<void>;
}

export default (): IUseOffer => {
  const { getApiClient } = useApiClient(VcmpSellerCatalogClient);
  const { user } = useUser();

  const offer = ref<IOffer>(new Offer());

  // Use modification tracker to track changes
  const { isModified, currentValue, resetModificationState } = useModificationTracker(offer);

  const { action: createOffer, loading: createOfferLoading } = useAsync<IOffer>(async (details) => {
    const client = await getApiClient();

    if (!details) return;

    const command = new CreateNewOfferCommand({
      sellerName: user.value?.userName,
      productId: details?.productId,
      details: details,
    });

    // Update currentValue with the saved data
    currentValue.value = await client.createNewOffer(command);

    // Reset modification state after save
    resetModificationState();
  });

  const { action: updateOffer, loading: updateOfferLoading } = useAsync<IOffer>(async (details) => {
    const client = await getApiClient();

    if (!details) return;

    const command = new UpdateOfferCommand({
      sellerName: user.value?.userName,
      offerId: details?.id,
      offerDetails: details,
    });

    // Update currentValue with the saved data
    currentValue.value = await client.updateOffer(command);

    // Reset modification state after save
    resetModificationState();
  });

  const { action: loadOffer, loading: loadOfferLoading } = useAsync<{id: string}>(async (args) => {
    const client = await getApiClient();

    if (!args?.id) return;

    // Load data into currentValue
    currentValue.value = await client.getOfferByIdGET(args.id);
  });

  return {
    offer: currentValue, // Export currentValue as offer
    loading: useLoading(loadOfferLoading, createOfferLoading, updateOfferLoading),
    modified: isModified, // Export isModified as modified
    loadOffer,
    createOffer,
    updateOffer,
    resetModificationState,
  };
};
```

### Using the Composable

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useOffer } from "../composables";

interface Props {
  param?: string;
}

const props = defineProps<Props>();

// The composable returns currentValue as "offer" and isModified as "modified"
const {
  offer,
  modified,
  loadOffer,
  createOffer,
  updateOffer,
  resetModificationState,
} = useOffer();

onMounted(async () => {
  if (props.param) {
    await loadOffer({ id: props.param });
  }

  // IMPORTANT: Always reset modification state after loading
  resetModificationState();
});

async function saveOffer() {
  if (offer.value.id) {
    await updateOffer(offer.value);
  } else {
    await createOffer(offer.value);
  }

  // resetModificationState() is called inside the composable
}
</script>
```

## Prevent Unsaved Changes Loss

```vue
<script setup lang="ts">
import { ref, watchEffect } from "vue";
import {
  useModificationTracker,
  useBladeNavigation,
  usePopup
} from "@vc-shell/framework";

interface FormData {
  title: string;
  content: string;
  tags: string[];
}

const formData = ref<FormData>({
  title: "",
  content: "",
  tags: []
});

const { currentValue, isModified, resetModificationState } = useModificationTracker(formData);
const { onBeforeClose } = useBladeNavigation();
const { showConfirmation } = usePopup();

// Prevent blade closure if there are unsaved changes
onBeforeClose(async () => {
  if (isModified.value) {
    const confirmed = await showConfirmation(
      "You have unsaved changes. Are you sure you want to close?"
    );

    // Return true to prevent closing, false to allow
    return !confirmed;
  }

  return false; // No changes, allow closing
});

async function save() {
  console.log("Saving:", currentValue.value);

  // Simulate save
  await new Promise(resolve => setTimeout(resolve, 500));

  resetModificationState();
}
</script>
```

## Multiple Tracked Objects

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useModificationTracker } from "@vc-shell/framework";

interface PersonalInfo {
  name: string;
  email: string;
}

interface AddressInfo {
  street: string;
  city: string;
  country: string;
}

const personalData = ref<PersonalInfo>({
  name: "John Doe",
  email: "john@example.com"
});

const addressData = ref<AddressInfo>({
  street: "123 Main St",
  city: "New York",
  country: "USA"
});

// Track personal info
const {
  currentValue: currentPersonal,
  isModified: personalModified,
  resetModificationState: resetPersonal
} = useModificationTracker(personalData);

// Track address info
const {
  currentValue: currentAddress,
  isModified: addressModified,
  resetModificationState: resetAddress
} = useModificationTracker(addressData);

// Check if any section is modified
const anyModified = computed(() => {
  return personalModified.value || addressModified.value;
});

async function saveAll() {
  if (personalModified.value) {
    await savePersonalInfo();
    resetPersonal();
  }

  if (addressModified.value) {
    await saveAddressInfo();
    resetAddress();
  }
}

async function savePersonalInfo() {
  console.log("Saving personal:", currentPersonal.value);
  await new Promise(resolve => setTimeout(resolve, 300));
}

async function saveAddressInfo() {
  console.log("Saving address:", currentAddress.value);
  await new Promise(resolve => setTimeout(resolve, 300));
}
</script>
```

## Array Modifications

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useModificationTracker } from "@vc-shell/framework";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

const todos = ref<TodoItem[]>([
  { id: "1", title: "Task 1", completed: false },
  { id: "2", title: "Task 2", completed: true }
]);

const { currentValue: currentTodos, isModified, resetModificationState } = useModificationTracker(todos);

function addTodo(title: string) {
  currentTodos.value.push({
    id: String(Date.now()),
    title,
    completed: false
  });
}

function removeTodo(id: string) {
  const index = currentTodos.value.findIndex(t => t.id === id);
  if (index !== -1) {
    currentTodos.value.splice(index, 1);
  }
}

function toggleTodo(id: string) {
  const todo = currentTodos.value.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
}

async function saveTodos() {
  if (!isModified.value) return;

  console.log("Saving todos:", currentTodos.value);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  resetModificationState();
}
</script>

<template>
  <div class="tw-space-y-4">
    <div v-for="todo in currentTodos" :key="todo.id" class="tw-flex tw-gap-2">
      <VcCheckbox
        v-model="todo.completed"
        :label="todo.title"
        @update:model-value="toggleTodo(todo.id)"
      />
      <VcButton size="sm" @click="removeTodo(todo.id)">Remove</VcButton>
    </div>

    <VcButton @click="saveTodos" :disabled="!isModified">
      Save Changes
    </VcButton>
  </div>
</template>
```

## Reset with New Baseline

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useModificationTracker } from "@vc-shell/framework";

interface Settings {
  theme: string;
  notifications: boolean;
  language: string;
}

const settings = ref<Settings>({
  theme: "light",
  notifications: true,
  language: "en"
});

const { currentValue, isModified, resetModificationState } = useModificationTracker(settings);

// Save and set new baseline
async function saveSettings() {
  console.log("Saving settings:", currentValue.value);

  // Simulate API call that returns updated settings
  await new Promise(resolve => setTimeout(resolve, 500));

  const updatedSettings = {
    ...currentValue.value,
    lastUpdated: new Date().toISOString()
  };

  // Reset with new baseline (both pristine and current)
  resetModificationState(updatedSettings);
}

// Reset to current pristine state
function resetToDefaults() {
  // Reset currentValue to match pristineValue
  resetModificationState(settings.value);
}

// Reset with completely new values
function loadDefaults() {
  const defaultSettings: Settings = {
    theme: "light",
    notifications: true,
    language: "en"
  };

  resetModificationState(defaultSettings);
}
</script>
```

## Compare Current and Pristine

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useModificationTracker } from "@vc-shell/framework";

interface Product {
  name: string;
  price: number;
  stock: number;
}

const product = ref<Product>({
  name: "Original Name",
  price: 100,
  stock: 50
});

const { currentValue, pristineValue, isModified } = useModificationTracker(product);

// Calculate what changed
const changes = computed(() => {
  if (!isModified.value) return [];

  const diff: string[] = [];

  if (currentValue.value.name !== pristineValue.value.name) {
    diff.push(`Name: "${pristineValue.value.name}" → "${currentValue.value.name}"`);
  }

  if (currentValue.value.price !== pristineValue.value.price) {
    diff.push(`Price: $${pristineValue.value.price} → $${currentValue.value.price}`);
  }

  if (currentValue.value.stock !== pristineValue.value.stock) {
    diff.push(`Stock: ${pristineValue.value.stock} → ${currentValue.value.stock}`);
  }

  return diff;
});
</script>

<template>
  <div class="tw-space-y-4">
    <VcInput v-model="currentValue.name" label="Name" />
    <VcInput v-model.number="currentValue.price" label="Price" type="number" />
    <VcInput v-model.number="currentValue.stock" label="Stock" type="number" />

    <div v-if="isModified" class="tw-mt-4 tw-p-4 tw-bg-yellow-50">
      <h4 class="tw-font-bold">Changes:</h4>
      <ul class="tw-list-disc tw-ml-4">
        <li v-for="change in changes" :key="change">{{ change }}</li>
      </ul>
    </div>
  </div>
</template>
```

## API Reference

```typescript
interface UseModificationTrackerReturn<T> {
  // Current reactive value (bind UI controls to this)
  currentValue: Ref<T>;

  // Original pristine value (readonly)
  pristineValue: Ref<T>;

  // True if currentValue differs from pristine
  isModified: DeepReadonly<Ref<boolean>>;

  // Reset modification state
  // - No args: Reset currentValue to match pristineValue
  // - With arg: Set both currentValue and pristineValue to new baseline
  resetModificationState: (newBaselineValue?: T | Ref<T>) => void;
}

// Usage
function useModificationTracker<T>(
  initialValueProp: T | Ref<T>
): UseModificationTrackerReturn<T>;
```

### resetModificationState Behavior

```typescript
// After loading data - reset to establish baseline
await loadOffer({ id: "123" });
resetModificationState(); // currentValue and pristineValue now match

// After saving - reset with new data from server
currentValue.value = await client.updateOffer(command);
resetModificationState(); // Sets new baseline

// Discard changes - revert to pristine state
resetModificationState(); // currentValue = pristineValue
```

## Important Notes

### ✅ DO

- **Export `currentValue` from composables** - Return it with a meaningful name like `offer`, `product`, etc.
- **Export `isModified`** - Return it as `modified` for use in blade toolbar
- **Bind UI to the exported ref** - Use `v-model="offer.name"`, not the original ref
- **Pass `:modified="modified"` to VcBlade** - Shows visual indicator
- **Reset after loading** - Call `resetModificationState()` in `onMounted` after data loads
- **Reset after saving** - Call inside the save action (create/update)
- **Update `currentValue` before reset** - When saving, assign response to `currentValue.value` first
- **Use with form validation** - Combine `modified` with `meta.valid` for toolbar buttons
- **Prevent data loss** - Use `onBeforeClose` and `useBeforeUnload` with `modified` check

### ❌ DON'T

- **Don't bind to the original ref** - Always use `currentValue` (exported as `offer`, etc.)
- **Don't forget to reset after loading** - Without reset, form starts as modified
- **Don't reset before save completes** - Update data first, then reset
- **Don't use for simple primitives** - Only for objects/arrays that need tracking
- **Don't modify pristineValue directly** - It's readonly and managed automatically
- **Don't create multiple trackers for same data** - Use one tracker in the composable

## Common Patterns

### Enable Save Button with Validation
```typescript
// In blade component
const bladeToolbar = ref([
  {
    id: "save",
    title: "Save",
    icon: "material-save",
    async clickHandler() {
      await saveOffer();
    },
    // Disable if not modified OR form is invalid
    disabled: computed(() => !modified.value || !meta.value.valid)
  }
]);
```

### Update and Reset After Save
```typescript
// In composable
const { action: updateOffer } = useAsync<IOffer>(async (details) => {
  const client = await getApiClient();
  const command = new UpdateOfferCommand({ offerDetails: details });

  // 1. Update currentValue with server response
  currentValue.value = await client.updateOffer(command);

  // 2. Reset modification state
  resetModificationState();
});
```

### Reset After Loading
```typescript
// In blade component
onMounted(async () => {
  if (props.param) {
    await loadOffer({ id: props.param });
  }

  // Always reset after loading to establish baseline
  resetModificationState();
});
```

### Prevent Data Loss
```typescript
// In blade component
import { useBeforeUnload } from "@vc-shell/framework";

onBeforeClose(async () => {
  if (modified.value) {
    return await showConfirmation("You have unsaved changes. Discard?");
  }
});

// Also prevent browser/tab close
useBeforeUnload(computed(() => modified.value));
```

### Pass Modified State to VcBlade
```vue
<VcBlade
  :title="title"
  :toolbar-items="bladeToolbar"
  :modified="modified"
  @close="$emit('close:blade')"
>
  <!-- Blade content -->
</VcBlade>
```

## See Also

- [useBeforeUnload](../useBeforeUnload/prevent-unload.md) - Prevent browser unload
- [useBladeNavigation](../useBladeNavigation/blade-management.md) - Blade lifecycle
- [usePopup](../usePopup/popup-dialogs.md) - Confirmation dialogs

**Reference:** [Official VC-Shell Documentation - useModificationTracker](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useModificationTracker/)
