---
id: usePopup-popup-dialogs
type: FRAMEWORK_API
category: composable
tags: [composable, popup, modal, dialog, confirmation]
title: "usePopup - Popup Dialogs"
description: "Manage popups, modals, and confirmation dialogs programmatically"
---

# usePopup - Popup Dialogs

The `usePopup` composable provides the primary API for managing popups and modals, enabling programmatic display of standard dialogs and custom popup components.

## Overview

- Show confirmation dialogs
- Display error messages
- Show informational popups
- Create custom popup components
- Manage popup lifecycle
- Handle form submissions in popups
- Declarative vs programmatic popups

## Standard Confirmation Dialog

```vue
<template>
  <VcBlade title="Delete Items">
    <VcTable
      :items="items"
      :columns="columns"
      v-model:selected="selectedItems"
    />

    <div class="tw-mt-4">
      <VcButton
        @click="deleteSelectedItems"
        :disabled="selectedItems.length === 0"
        variant="danger"
      >
        Delete Selected ({{ selectedItems.length }})
      </VcButton>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePopup, VcBlade, VcTable, VcButton } from "@vc-shell/framework";

const { showConfirmation, showInfo, showError } = usePopup();

const items = ref([
  { id: "1", name: "Item 1", status: "active" },
  { id: "2", name: "Item 2", status: "active" },
  { id: "3", name: "Item 3", status: "inactive" }
]);

const selectedItems = ref<string[]>([]);

const columns = [
  { id: "name", field: "name", title: "Name" },
  { id: "status", field: "status", title: "Status" }
];

async function deleteSelectedItems() {
  // Show confirmation dialog
  const confirmed = await showConfirmation(
    `Are you sure you want to delete ${selectedItems.value.length} item(s)?`
  );

  if (confirmed) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove selected items
      items.value = items.value.filter(
        item => !selectedItems.value.includes(item.id)
      );

      selectedItems.value = [];

      showInfo("Items deleted successfully!");
    } catch (error) {
      showError("Failed to delete items. Please try again.");
    }
  } else {
    console.log("Delete operation canceled");
  }
}
</script>
```

## Error and Info Dialogs

```vue
<script setup lang="ts">
import { ref } from "vue";
import { usePopup } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { showError, showInfo } = usePopup();
const { getApiClient } = useApiClient(OffersClient);

const offer = ref<any>(null);
const saving = ref(false);

async function saveOffer() {
  if (!validateOffer()) {
    showError("Please fill in all required fields.");
    return;
  }

  saving.value = true;

  try {
    const client = await getApiClient();
    await client.saveOffer(offer.value);

    showInfo("Offer saved successfully!");
  } catch (error) {
    console.error("Save failed:", error);

    if (error instanceof Error) {
      showError(`Failed to save offer: ${error.message}`);
    } else {
      showError("An unexpected error occurred while saving.");
    }
  } finally {
    saving.value = false;
  }
}

function validateOffer(): boolean {
  return !!(offer.value?.name && offer.value?.price);
}
</script>
```

## Custom Popup Component

```vue
<!-- UserEditPopup.vue -->
<template>
  <VcPopup
    :title="props.isEditMode ? 'Edit User' : 'View User'"
    :modal-width="'tw-max-w-lg'"
    @close="emit('closeRequested')"
  >
    <template #content>
      <form @submit.prevent="handleSubmit" class="tw-space-y-4">
        <VcInput
          v-model="editableUser.name"
          label="Name"
          :disabled="!props.isEditMode"
          required
        />

        <VcInput
          v-model="editableUser.email"
          label="Email"
          type="email"
          :disabled="!props.isEditMode"
          required
        />

        <VcSelect
          v-model="editableUser.role"
          :options="roleOptions"
          label="Role"
          :disabled="!props.isEditMode"
        />

        <VcCheckbox
          v-model="editableUser.active"
          label="Active"
          :disabled="!props.isEditMode"
        />
      </form>
    </template>

    <template #footer>
      <div class="tw-flex tw-justify-end tw-gap-3">
        <VcButton
          variant="outline"
          @click="emit('closeRequested')"
        >
          {{ props.isEditMode ? 'Cancel' : 'Close' }}
        </VcButton>

        <VcButton
          v-if="props.isEditMode"
          @click="handleSubmit"
          :disabled="!isValid"
        >
          Save
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { reactive, computed, watchEffect } from "vue";
import {
  VcPopup,
  VcInput,
  VcSelect,
  VcCheckbox,
  VcButton
} from "@vc-shell/framework";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface Props {
  userData: UserData;
  isEditMode: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  closeRequested: [];
  saveUser: [data: UserData];
}>();

const editableUser = reactive<UserData>({ ...props.userData });

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "user", label: "User" },
  { value: "viewer", label: "Viewer" }
];

const isValid = computed(() => {
  return !!(
    editableUser.name &&
    editableUser.email &&
    editableUser.role
  );
});

// Keep local state in sync with prop changes
watchEffect(() => {
  Object.assign(editableUser, props.userData);
});

function handleSubmit() {
  if (props.isEditMode && isValid.value) {
    emit("saveUser", { ...editableUser });
  }
}
</script>
```

## Using Custom Popup Programmatically

```vue
<template>
  <VcBlade title="Users Management">
    <VcTable
      :items="users"
      :columns="columns"
      @item-click="viewUser"
    />

    <div class="tw-mt-4 tw-space-x-2">
      <VcButton @click="createNewUser">Create User</VcButton>
      <VcButton @click="editSelectedUser">Edit User</VcButton>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePopup, VcBlade, VcTable, VcButton } from "@vc-shell/framework";
import UserEditPopup from "./UserEditPopup.vue";

const { showInfo } = usePopup();

const users = ref([
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "admin", active: true },
  { id: "2", name: "Bob Jones", email: "bob@example.com", role: "user", active: true }
]);

const selectedUser = ref<any>(null);

const columns = [
  { id: "name", field: "name", title: "Name" },
  { id: "email", field: "email", title: "Email" },
  { id: "role", field: "role", title: "Role" }
];

// Create popup instance for viewing/editing users
const currentUserData = ref<any>({
  id: "",
  name: "",
  email: "",
  role: "user",
  active: true
});

const isEditMode = ref(false);

const userPopup = usePopup({
  component: UserEditPopup,
  props: {
    userData: currentUserData,
    isEditMode: isEditMode
  },
  emits: {
    closeRequested: () => {
      console.log("User popup closed");
      userPopup.close();
    },
    saveUser: (updatedData: any) => {
      console.log("Saving user:", updatedData);

      if (isEditMode.value) {
        // Update existing user
        const index = users.value.findIndex(u => u.id === updatedData.id);
        if (index !== -1) {
          users.value[index] = { ...updatedData };
        }
      } else {
        // Create new user
        updatedData.id = String(users.value.length + 1);
        users.value.push(updatedData);
      }

      showInfo(
        isEditMode.value
          ? "User updated successfully!"
          : "User created successfully!"
      );

      userPopup.close();
    }
  }
});

function viewUser(user: any) {
  currentUserData.value = { ...user };
  isEditMode.value = false;
  userPopup.open();
}

function editSelectedUser() {
  if (selectedUser.value) {
    currentUserData.value = { ...selectedUser.value };
    isEditMode.value = true;
    userPopup.open();
  }
}

function createNewUser() {
  currentUserData.value = {
    id: "",
    name: "",
    email: "",
    role: "user",
    active: true
  };
  isEditMode.value = true;
  userPopup.open();
}
</script>
```

## Declarative Popup Usage

```vue
<template>
  <div>
    <VcButton @click="showHelpPopup = true">Show Help</VcButton>

    <VcPopup
      v-if="showHelpPopup"
      title="Help & Information"
      modal-width="tw-max-w-2xl"
      @close="showHelpPopup = false"
    >
      <template #content>
        <div class="tw-prose">
          <h3>Getting Started</h3>
          <p>This section provides help for using the application.</p>

          <h4>Features</h4>
          <ul>
            <li><strong>Feature A:</strong> How to use feature A...</li>
            <li><strong>Feature B:</strong> Common issues with feature B...</li>
            <li><strong>Feature C:</strong> Tips for feature C...</li>
          </ul>

          <h4>Keyboard Shortcuts</h4>
          <table class="tw-w-full">
            <tr>
              <td><kbd>Ctrl+S</kbd></td>
              <td>Save current changes</td>
            </tr>
            <tr>
              <td><kbd>Ctrl+N</kbd></td>
              <td>Create new item</td>
            </tr>
          </table>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="tw-flex tw-justify-end">
          <VcButton @click="close">Got it!</VcButton>
        </div>
      </template>
    </VcPopup>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcPopup, VcButton } from "@vc-shell/framework";

const showHelpPopup = ref(false);
</script>
```

## Form Validation in Popup

```vue
<!-- ProductFormPopup.vue -->
<template>
  <VcPopup
    title="Add Product"
    modal-width="tw-max-w-xl"
    @close="emit('close')"
  >
    <template #content>
      <form @submit.prevent="handleSubmit" class="tw-space-y-4">
        <VcInput
          v-model="form.name"
          label="Product Name"
          :error="errors.name"
          required
        />

        <VcInput
          v-model="form.sku"
          label="SKU"
          :error="errors.sku"
          required
        />

        <VcInput
          v-model="form.price"
          label="Price"
          type="number"
          step="0.01"
          :error="errors.price"
          required
        />

        <VcInput
          v-model="form.stock"
          label="Stock"
          type="number"
          :error="errors.stock"
          required
        />

        <VcTextarea
          v-model="form.description"
          label="Description"
          rows="4"
        />
      </form>
    </template>

    <template #footer>
      <div class="tw-flex tw-justify-end tw-gap-3">
        <VcButton variant="outline" @click="emit('close')">
          Cancel
        </VcButton>
        <VcButton
          @click="handleSubmit"
          :disabled="!isValid || submitting"
        >
          {{ submitting ? 'Saving...' : 'Save Product' }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import {
  VcPopup,
  VcInput,
  VcTextarea,
  VcButton
} from "@vc-shell/framework";

interface ProductForm {
  name: string;
  sku: string;
  price: string;
  stock: string;
  description: string;
}

const emit = defineEmits<{
  close: [];
  save: [product: ProductForm];
}>();

const form = reactive<ProductForm>({
  name: "",
  sku: "",
  price: "",
  stock: "",
  description: ""
});

const errors = reactive<Record<string, string>>({});
const submitting = ref(false);

const isValid = computed(() => {
  return !!(
    form.name &&
    form.sku &&
    form.price &&
    form.stock &&
    parseFloat(form.price) > 0 &&
    parseInt(form.stock) >= 0
  );
});

function validateForm(): boolean {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);

  let valid = true;

  if (!form.name) {
    errors.name = "Product name is required";
    valid = false;
  }

  if (!form.sku) {
    errors.sku = "SKU is required";
    valid = false;
  }

  if (!form.price || parseFloat(form.price) <= 0) {
    errors.price = "Price must be greater than 0";
    valid = false;
  }

  if (!form.stock || parseInt(form.stock) < 0) {
    errors.stock = "Stock cannot be negative";
    valid = false;
  }

  return valid;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  submitting.value = true;

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    emit("save", { ...form });
  } finally {
    submitting.value = false;
  }
}
</script>
```

## Multiple Popups Management

```vue
<script setup lang="ts">
import { ref } from "vue";
import { usePopup } from "@vc-shell/framework";
import UserEditPopup from "./UserEditPopup.vue";
import ProductFormPopup from "./ProductFormPopup.vue";
import ConfirmationPopup from "./ConfirmationPopup.vue";

const { showInfo } = usePopup();

// User popup instance
const userPopup = usePopup({
  component: UserEditPopup,
  props: {
    userData: ref({ id: "", name: "", email: "", role: "user", active: true }),
    isEditMode: ref(true)
  },
  emits: {
    closeRequested: () => userPopup.close(),
    saveUser: (data: any) => {
      console.log("User saved:", data);
      showInfo("User saved!");
      userPopup.close();
    }
  }
});

// Product popup instance
const productPopup = usePopup({
  component: ProductFormPopup,
  emits: {
    close: () => productPopup.close(),
    save: (product: any) => {
      console.log("Product saved:", product);
      showInfo("Product saved!");
      productPopup.close();
    }
  }
});

// Confirmation popup instance
const confirmPopup = usePopup({
  component: ConfirmationPopup,
  props: {
    message: ref("Are you sure?")
  },
  emits: {
    confirm: () => {
      console.log("Confirmed");
      confirmPopup.close();
    },
    cancel: () => {
      console.log("Cancelled");
      confirmPopup.close();
    }
  }
});

function openUserPopup() {
  userPopup.open();
}

function openProductPopup() {
  productPopup.open();
}

function openConfirmPopup() {
  confirmPopup.open();
}
</script>
```

## Popup with Slots

```vue
<!-- CustomPopupWithSlots.vue -->
<template>
  <VcPopup
    :title="props.title"
    @close="emit('close')"
  >
    <template #content>
      <div class="tw-space-y-4">
        <p>{{ props.message }}</p>

        <!-- Default slot for additional content -->
        <slot></slot>

        <!-- Named slot for custom actions -->
        <div v-if="$slots.actions" class="tw-border-t tw-pt-4">
          <slot name="actions"></slot>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton variant="outline" @click="emit('close')">
          Close
        </VcButton>
        <slot name="footerButtons"></slot>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcPopup, VcButton } from "@vc-shell/framework";

interface Props {
  title: string;
  message: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
</script>
```

```vue
<!-- Usage of popup with slots -->
<script setup lang="ts">
import { ref } from "vue";
import { usePopup, VcButton } from "@vc-shell/framework";
import CustomPopupWithSlots from "./CustomPopupWithSlots.vue";

const popupWithSlots = usePopup({
  component: CustomPopupWithSlots,
  props: {
    title: "Custom Popup",
    message: "This popup has custom slot content"
  },
  emits: {
    close: () => popupWithSlots.close()
  },
  slots: {
    default: '<p class="tw-text-blue-600">This is default slot content!</p>',
    actions: '<div class="tw-text-sm tw-text-gray-600">Additional actions here</div>',
    footerButtons: '<VcButton @click="handleCustomAction">Custom Action</VcButton>'
  }
});
</script>
```

## Async Operations in Popup

```vue
<!-- AsyncOperationPopup.vue -->
<template>
  <VcPopup
    title="Import Data"
    @close="emit('close')"
  >
    <template #content>
      <div class="tw-space-y-4">
        <VcFileUpload
          v-model="selectedFile"
          accept=".csv,.xlsx"
          :disabled="processing"
        />

        <div v-if="processing" class="tw-flex tw-items-center tw-gap-2">
          <VcSpinner size="sm" />
          <span>Processing... {{ progress }}%</span>
        </div>

        <div v-if="result" class="tw-mt-4">
          <VcAlert :type="result.success ? 'success' : 'error'">
            {{ result.message }}
          </VcAlert>

          <div v-if="result.details" class="tw-mt-2 tw-text-sm">
            <p>Processed: {{ result.details.processed }}</p>
            <p>Success: {{ result.details.success }}</p>
            <p>Errors: {{ result.details.errors }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton
          variant="outline"
          @click="emit('close')"
          :disabled="processing"
        >
          {{ result ? 'Close' : 'Cancel' }}
        </VcButton>

        <VcButton
          v-if="!result"
          @click="startImport"
          :disabled="!selectedFile || processing"
        >
          Start Import
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcPopup,
  VcButton,
  VcFileUpload,
  VcSpinner,
  VcAlert
} from "@vc-shell/framework";

const emit = defineEmits<{
  close: [];
  importComplete: [result: any];
}>();

const selectedFile = ref<File | null>(null);
const processing = ref(false);
const progress = ref(0);
const result = ref<any>(null);

async function startImport() {
  if (!selectedFile.value) return;

  processing.value = true;
  progress.value = 0;
  result.value = null;

  try {
    // Simulate file processing with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      progress.value = i;
    }

    // Simulate successful import
    result.value = {
      success: true,
      message: "Import completed successfully!",
      details: {
        processed: 150,
        success: 145,
        errors: 5
      }
    };

    emit("importComplete", result.value);
  } catch (error) {
    result.value = {
      success: false,
      message: "Import failed: " + (error instanceof Error ? error.message : String(error))
    };
  } finally {
    processing.value = false;
  }
}
</script>
```

## API Reference

```typescript
interface IUsePopup {
  // Show standard confirmation dialog
  showConfirmation: (message: string, title?: string) => Promise<boolean>;

  // Show error dialog
  showError: (message: string, title?: string) => void;

  // Show info dialog
  showInfo: (message: string, title?: string) => void;
}

interface UsePopupProps<T extends Component> {
  // Component to render as popup
  component: T;

  // Props to pass to the component
  props?: Record<string, any>;

  // Event handlers for component events
  emits?: Record<string, (...args: any[]) => void>;

  // Slot content for component slots
  slots?: {
    [key: string]: string | Component | VueSlot;
  };
}

interface PopupInstance {
  // Open the popup
  open: () => void;

  // Close the popup
  close: () => void;
}
```

## Important Notes

### ✅ DO

- Use `VcPopup` component when building custom popups
- Use `showConfirmation` for user confirmations
- Handle async operations properly in popups
- Validate forms before submission
- Close popups after successful operations
- Use reactive props for dynamic popup content
- Define clear emit interfaces for custom popups

### ❌ DON'T

- Don't forget to close popups programmatically
- Don't use popups for complex multi-step workflows
- Don't ignore validation errors
- Don't forget loading states for async operations
- Don't create deeply nested popups
- Don't use global state when popup props work better
- Don't forget to handle popup close events

## Common Patterns

### Confirmation Before Action
```typescript
const confirmed = await showConfirmation("Delete this item?");
if (confirmed) {
  await deleteItem();
  showInfo("Item deleted!");
}
```

### Form Submission Popup
```typescript
const formPopup = usePopup({
  component: FormPopup,
  emits: {
    save: (data) => {
      saveData(data);
      formPopup.close();
    },
    close: () => formPopup.close()
  }
});
```

### Error Handling
```typescript
try {
  await saveData();
  showInfo("Saved successfully!");
} catch (error) {
  showError(`Save failed: ${error.message}`);
}
```

## See Also

- [VcPopup Component](../../ui-components/vc-popup.md) - Popup UI component
- [useNotifications](../useNotifications/basic-usage.md) - Toast notifications
- [useBladeNavigation](../useBladeNavigation/blade-management.md) - Blade navigation

**Reference:** [Official VC-Shell Documentation - usePopup](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/shared/components/popup-handler/)
