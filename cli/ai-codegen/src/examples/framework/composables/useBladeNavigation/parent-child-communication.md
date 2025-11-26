---
id: useBladeNavigation-parent-child-communication
type: FRAMEWORK_API
category: composable
tags: [composable, blade-navigation, parent-child, communication]
title: "useBladeNavigation - Parent-Child Communication"
description: "Enable communication between parent and child blades"
---

# useBladeNavigation - Parent-Child Communication

Parent-child blade communication enables child blades to call methods exposed by their parent blades, facilitating data flow and action coordination in hierarchical blade structures.

## Overview

- Expose methods in parent blade
- Call parent methods from child
- Handle callbacks from parent
- Refresh parent data from child
- Coordinate blade actions
- Bi-directional communication

## Basic Parent-Child Communication

```vue
<!-- ParentBlade.vue -->
<template>
  <VcBlade :title="`Orders - Total: ${orders.length}`">
    <!-- @vue-generic {IOrder} -->
    <VcTable
      :items="orders"
      :columns="columns"
      @item-click="viewOrderDetails"
    />

    <div class="tw-mt-4 tw-text-sm tw-text-gray-600">
      Last refreshed: {{ lastRefreshed }}
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useBladeNavigation, VcBlade, VcTable } from "@vc-shell/framework";
import OrderDetailsBlade from "./OrderDetailsBlade.vue";

const { openBlade } = useBladeNavigation();

const orders = ref([
  { id: "ORD-001", customer: "John Doe", total: 299.99, status: "pending" },
  { id: "ORD-002", customer: "Jane Smith", total: 599.99, status: "shipped" }
]);

const lastRefreshed = ref(new Date().toLocaleTimeString());

const columns = [
  { id: "id", field: "id", title: "Order ID" },
  { id: "customer", field: "customer", title: "Customer" },
  { id: "total", field: "total", title: "Total" },
  { id: "status", field: "status", title: "Status" }
];

function viewOrderDetails(order: any) {
  openBlade({
    blade: OrderDetailsBlade,
    param: order.id
  });
}

// Expose methods for child blades to call
defineExpose({
  refreshOrders(updatedOrder?: any) {
    console.log("Parent: Refreshing orders list");

    if (updatedOrder) {
      // Update specific order
      const index = orders.value.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...updatedOrder };
      }
    } else {
      // Full refresh
      // Simulate API call
      console.log("Parent: Fetching fresh data...");
    }

    lastRefreshed.value = new Date().toLocaleTimeString();

    return {
      success: true,
      ordersCount: orders.value.length,
      timestamp: lastRefreshed.value
    };
  },

  addNewOrder(orderData: any) {
    console.log("Parent: Adding new order", orderData);

    const newOrder = {
      id: `ORD-${String(orders.value.length + 1).padStart(3, "0")}`,
      ...orderData
    };

    orders.value.push(newOrder);

    return {
      success: true,
      orderId: newOrder.id
    };
  }
});
</script>
```

```vue
<!-- OrderDetailsBlade.vue -->
<template>
  <VcBlade
    title="Order Details"
    :toolbar-items="toolbarItems"
  >
    <div class="tw-p-4">
      <div v-if="order">
        <h3 class="tw-font-bold">{{ order.id }}</h3>
        <p>Customer: {{ order.customer }}</p>
        <p>Total: ${{ order.total }}</p>

        <!-- @vue-generic {{ value: string; label: string }} -->
        <VcSelect
          v-model="order.status"
          :options="statusOptions"
          label="Status"
          @update:model-value="updateOrderStatus"
        />
      </div>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade, VcSelect } from "@vc-shell/framework";
import type { IParentCallArgs } from "@vc-shell/framework";

interface Props {
  expanded: boolean;
  closable: boolean;
  param?: string; // Order ID
}

const props = defineProps<Props>();

// Define standard blade events
interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const emit = defineEmits<Emits>();

const order = ref<any>(null);

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" }
];

const toolbarItems = ref([
  {
    id: "refresh-parent",
    title: "Refresh Parent",
    icon: "material-refresh",
    clickHandler: () => refreshParentList()
  }
]);

// Load order data
onMounted(() => {
  order.value = {
    id: props.param,
    customer: "John Doe",
    total: 299.99,
    status: "pending"
  };
});

function updateOrderStatus(newStatus: string) {
  console.log("Child: Status updated to", newStatus);

  // Call parent method to update the order
  emit("parent:call", {
    method: "refreshOrders",
    args: {
      id: order.value.id,
      status: newStatus
    },
    callback: (result: any) => {
      if (result && result.success) {
        console.log("Child: Parent refreshed successfully");
        console.log("Child: Orders count:", result.ordersCount);
      }
    }
  });
}

function refreshParentList() {
  // Call parent without arguments
  emit("parent:call", {
    method: "refreshOrders",
    callback: (result: any) => {
      console.log("Child: Parent refresh result:", result);
    }
  });
}
</script>
```

## Multiple Parent Methods

```vue
<!-- ParentWithMultipleMethods.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";

const { openBlade } = useBladeNavigation();

const counter = ref(0);
const items = ref<string[]>([]);
const statusMessage = ref("");

// Expose multiple methods
defineExpose({
  incrementCounter(amount: number = 1) {
    counter.value += amount;
    console.log(`Counter incremented by ${amount}, new value: ${counter.value}`);

    return {
      success: true,
      newValue: counter.value
    };
  },

  decrementCounter(amount: number = 1) {
    counter.value -= amount;
    console.log(`Counter decremented by ${amount}, new value: ${counter.value}`);

    return {
      success: true,
      newValue: counter.value
    };
  },

  addItem(itemName: string) {
    items.value.push(itemName);
    console.log(`Item added: ${itemName}, total items: ${items.value.length}`);

    return {
      success: true,
      itemsCount: items.value.length
    };
  },

  removeItem(itemName: string) {
    const index = items.value.indexOf(itemName);
    if (index !== -1) {
      items.value.splice(index, 1);
      return { success: true, removed: true };
    }

    return { success: false, removed: false };
  },

  updateStatus(message: string) {
    statusMessage.value = message;
    console.log(`Status updated: ${message}`);

    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  },

  getParentState() {
    return {
      counter: counter.value,
      items: [...items.value],
      statusMessage: statusMessage.value
    };
  }
});
</script>
```

```vue
<!-- ChildWithMultipleCalls.vue -->
<script setup lang="ts">
import type { IParentCallArgs } from "@vc-shell/framework";

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
}

const emit = defineEmits<Emits>();

function incrementParent(amount: number) {
  emit("parent:call", {
    method: "incrementCounter",
    args: amount,
    callback: (result: any) => {
      console.log("Increment result:", result);
    }
  });
}

function addItemToParent(itemName: string) {
  emit("parent:call", {
    method: "addItem",
    args: itemName,
    callback: (result: any) => {
      if (result?.success) {
        console.log(`Added item. Total items: ${result.itemsCount}`);
      }
    }
  });
}

function updateParentStatus(message: string) {
  emit("parent:call", {
    method: "updateStatus",
    args: message,
    callback: (result: any) => {
      console.log("Status updated at:", result?.timestamp);
    }
  });
}

function getParentData() {
  emit("parent:call", {
    method: "getParentState",
    callback: (state: any) => {
      console.log("Parent state:", state);
    }
  });
}
</script>

<template>
  <VcBlade title="Child Controls">
    <div class="tw-p-4 tw-space-y-2">
      <VcButton @click="incrementParent(1)">Increment by 1</VcButton>
      <VcButton @click="incrementParent(5)">Increment by 5</VcButton>
      <VcButton @click="addItemToParent('New Item')">Add Item</VcButton>
      <VcButton @click="updateParentStatus('Processing...')">Update Status</VcButton>
      <VcButton @click="getParentData()">Get Parent Data</VcButton>
    </div>
  </VcBlade>
</template>
```

## Async Parent Methods

```vue
<!-- ParentWithAsyncMethods.vue -->
<script setup lang="ts">
import { ref } from "vue";

const data = ref<any>(null);
const loading = ref(false);

defineExpose({
  async fetchDataFromAPI(filters: any) {
    loading.value = true;

    try {
      console.log("Parent: Fetching data with filters", filters);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      data.value = {
        items: ["Item 1", "Item 2", "Item 3"],
        total: 3,
        filters
      };

      return {
        success: true,
        data: data.value
      };
    } catch (error) {
      console.error("Parent: Fetch failed", error);

      return {
        success: false,
        error: String(error)
      };
    } finally {
      loading.value = false;
    }
  },

  async saveChanges(updatedData: any) {
    loading.value = true;

    try {
      console.log("Parent: Saving changes", updatedData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      data.value = { ...data.value, ...updatedData };

      return {
        success: true,
        savedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: String(error)
      };
    } finally {
      loading.value = false;
    }
  }
});
</script>
```

```vue
<!-- ChildCallingAsyncMethods.vue -->
<script setup lang="ts">
import { ref } from "vue";
import type { IParentCallArgs } from "@vc-shell/framework";

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
}

const emit = defineEmits<Emits>();

const childLoading = ref(false);
const resultMessage = ref("");

async function fetchFromParent() {
  childLoading.value = true;
  resultMessage.value = "Fetching...";

  emit("parent:call", {
    method: "fetchDataFromAPI",
    args: {
      category: "electronics",
      limit: 10
    },
    callback: (result: any) => {
      childLoading.value = false;

      if (result?.success) {
        resultMessage.value = `Loaded ${result.data.total} items`;
        console.log("Data:", result.data);
      } else {
        resultMessage.value = `Error: ${result?.error}`;
      }
    }
  });
}

async function saveToParent() {
  childLoading.value = true;
  resultMessage.value = "Saving...";

  emit("parent:call", {
    method: "saveChanges",
    args: {
      title: "Updated Title",
      description: "New description"
    },
    callback: (result: any) => {
      childLoading.value = false;

      if (result?.success) {
        resultMessage.value = `Saved at ${result.savedAt}`;
      } else {
        resultMessage.value = `Save failed: ${result?.error}`;
      }
    }
  });
}
</script>

<template>
  <VcBlade title="Async Operations">
    <div class="tw-p-4">
      <VcButton
        @click="fetchFromParent"
        :disabled="childLoading"
      >
        Fetch Data from Parent
      </VcButton>

      <VcButton
        @click="saveToParent"
        :disabled="childLoading"
      >
        Save to Parent
      </VcButton>

      <div v-if="resultMessage" class="tw-mt-4">
        {{ resultMessage }}
      </div>
    </div>
  </VcBlade>
</template>
```

## Error Handling in Communication

```vue
<!-- ParentWithErrorHandling.vue -->
<script setup lang="ts">
import { ref } from "vue";

const items = ref<any[]>([]);

defineExpose({
  updateItem(itemId: string, updates: any) {
    try {
      const item = items.value.find(i => i.id === itemId);

      if (!item) {
        throw new Error(`Item with ID ${itemId} not found`);
      }

      if (!updates || typeof updates !== "object") {
        throw new Error("Invalid updates object");
      }

      Object.assign(item, updates);

      return {
        success: true,
        item
      };
    } catch (error) {
      console.error("Parent: Update failed", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  deleteItem(itemId: string) {
    try {
      const index = items.value.findIndex(i => i.id === itemId);

      if (index === -1) {
        throw new Error(`Item with ID ${itemId} not found`);
      }

      const deletedItem = items.value.splice(index, 1)[0];

      return {
        success: true,
        deletedItem
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
});
</script>
```

```vue
<!-- ChildWithErrorHandling.vue -->
<script setup lang="ts">
import { ref } from "vue";
import type { IParentCallArgs } from "@vc-shell/framework";

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
}

const emit = defineEmits<Emits>();

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

function updateParentItem(itemId: string, updates: any) {
  errorMessage.value = null;
  successMessage.value = null;

  emit("parent:call", {
    method: "updateItem",
    args: { itemId, updates }, // Can pass object as args
    callback: (result: any) => {
      if (result?.success) {
        successMessage.value = "Item updated successfully";
        console.log("Updated item:", result.item);
      } else {
        errorMessage.value = result?.error || "Update failed";
      }
    }
  });
}

function deleteParentItem(itemId: string) {
  errorMessage.value = null;
  successMessage.value = null;

  emit("parent:call", {
    method: "deleteItem",
    args: itemId,
    callback: (result: any) => {
      if (result?.success) {
        successMessage.value = "Item deleted successfully";
      } else {
        errorMessage.value = result?.error || "Delete failed";
      }
    }
  });
}
</script>

<template>
  <VcBlade title="Item Operations">
    <div class="tw-p-4">
      <VcAlert v-if="errorMessage" type="error">
        {{ errorMessage }}
      </VcAlert>

      <VcAlert v-if="successMessage" type="success">
        {{ successMessage }}
      </VcAlert>

      <VcButton @click="updateParentItem('item-1', { title: 'New Title' })">
        Update Item
      </VcButton>

      <VcButton @click="deleteParentItem('item-1')">
        Delete Item
      </VcButton>
    </div>
  </VcBlade>
</template>
```

## Coordinated Actions

```vue
<!-- ParentCoordinator.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useNotifications } from "@vc-shell/framework";

const { success, error } = useNotifications();

const selectedItems = ref<string[]>([]);
const processingStatus = ref<string>("");

defineExpose({
  selectItem(itemId: string) {
    if (!selectedItems.value.includes(itemId)) {
      selectedItems.value.push(itemId);
    }

    return {
      success: true,
      selectedCount: selectedItems.value.length
    };
  },

  unselectItem(itemId: string) {
    const index = selectedItems.value.indexOf(itemId);
    if (index !== -1) {
      selectedItems.value.splice(index, 1);
    }

    return {
      success: true,
      selectedCount: selectedItems.value.length
    };
  },

  clearSelection() {
    selectedItems.value = [];
    return { success: true };
  },

  async processSelected() {
    if (selectedItems.value.length === 0) {
      error("No items selected");
      return { success: false, error: "No items selected" };
    }

    processingStatus.value = "Processing...";

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const processedCount = selectedItems.value.length;
    selectedItems.value = [];
    processingStatus.value = "";

    success(`Processed ${processedCount} items`);

    return {
      success: true,
      processedCount
    };
  }
});
</script>
```

```vue
<!-- ChildItemSelector.vue -->
<script setup lang="ts">
import { ref } from "vue";
import type { IParentCallArgs } from "@vc-shell/framework";

interface Props {
  param?: string; // Item ID
}

const props = defineProps<Props>();

interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
}

const emit = defineEmits<Emits>();

const isSelected = ref(false);

function toggleSelection() {
  const method = isSelected.value ? "unselectItem" : "selectItem";

  emit("parent:call", {
    method,
    args: props.param,
    callback: (result: any) => {
      if (result?.success) {
        isSelected.value = !isSelected.value;
        console.log(`Selected count: ${result.selectedCount}`);
      }
    }
  });
}

function processAll() {
  emit("parent:call", {
    method: "processSelected",
    callback: (result: any) => {
      if (result?.success) {
        console.log(`Processed ${result.processedCount} items`);
        isSelected.value = false; // This item was processed
      }
    }
  });
}
</script>

<template>
  <VcBlade title="Item Details">
    <div class="tw-p-4">
      <VcCheckbox
        v-model="isSelected"
        label="Select for batch processing"
        @update:model-value="toggleSelection"
      />

      <VcButton @click="processAll" class="tw-mt-4">
        Process Selected Items
      </VcButton>
    </div>
  </VcBlade>
</template>
```

## API Reference

```typescript
interface IParentCallArgs {
  // Name of the method exposed by parent via defineExpose
  method: string;

  // Arguments to pass to the parent's method (can be any type)
  args?: unknown;

  // Callback to receive the result from parent's method
  callback?: (result: unknown) => void;
}

// Standard blade events
interface BladeEmits {
  // Call exposed parent method
  (event: "parent:call", args: IParentCallArgs): void;

  // Request blade closure
  (event: "close:blade"): void;

  // Request blade collapse
  (event: "collapse:blade"): void;

  // Request blade expansion
  (event: "expand:blade"): void;
}
```

## Important Notes

### ✅ DO

- Use `defineExpose` in parent to expose methods
- Emit `parent:call` event from child with method name
- Use callbacks to receive results from parent
- Handle errors in parent methods gracefully
- Return structured results ({ success, data, error })
- Use TypeScript for type safety
- Document exposed parent methods

### ❌ DON'T

- Don't call parent methods directly (use parent:call event)
- Don't forget to define Emits interface
- Don't ignore callback results
- Don't expose methods that mutate parent state unsafely
- Don't create circular dependencies
- Don't use global state instead of parent:call
- Don't forget error handling in callbacks

## Common Patterns

### Refresh Parent List
```typescript
defineExpose({
  refreshList() {
    loadData();
    return { success: true, timestamp: Date.now() };
  }
});

// Child
emit("parent:call", {
  method: "refreshList",
  callback: (result) => console.log("Refreshed:", result)
});
```

### Update Parent State
```typescript
defineExpose({
  updateCounter(amount: number) {
    counter.value += amount;
    return { success: true, newValue: counter.value };
  }
});

// Child
emit("parent:call", {
  method: "updateCounter",
  args: 5
});
```

### Async Parent Operation
```typescript
defineExpose({
  async saveData(data: any) {
    await api.save(data);
    return { success: true };
  }
});

// Child
emit("parent:call", {
  method: "saveData",
  args: formData,
  callback: (result) => {
    if (result?.success) handleSuccess();
  }
});
```

## See Also

- [blade-management.md](./blade-management.md) - Blade navigation basics
- [VcBlade Component](../../ui-components/vc-blade.md) - Blade UI component
- [useBladeNavigation API](../../composables/useBladeNavigation.md) - Full API reference

**Reference:** [Official VC-Shell Documentation - Parent-Child Communication](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/Usage-Guides/working-with-blade-navigation/#4-parent-child-communication)
