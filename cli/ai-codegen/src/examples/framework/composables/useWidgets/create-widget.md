---
id: useWidgets-create-widget
type: FRAMEWORK_API
category: composable
tags: [composable, widgets, blade-widgets, registration]
title: "useWidgets - Create Widget"
description: "Create and register blade widgets"
---

# useWidgets - Create Widget

The `useWidgets` composable manages widget components within blades, allowing dynamic registration and management of supplementary UI elements.

## Overview

- Create custom widget components
- Register widgets for specific blades
- Pass reactive props using computed
- Handle events and updates
- Control widget visibility
- Use VcWidget as base component
- Clean up widgets on unmount

## Basic Widget Component

```vue
<!-- ProductStockWidget.vue -->
<template>
  <VcWidget
    :title="widgetTitle"
    :value="stockLevel"
    :icon="stockIcon"
    @click="handleWidgetClick"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose } from "vue";
import { VcWidget } from "@vc-shell/framework";

interface Props {
  productId: string;
  initialStock?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "stock-updated": [stock: number];
}>();

const stockLevel = ref(props.initialStock || 0);

const widgetTitle = computed(() => `Stock: ${props.productId}`);

const stockIcon = computed(() =>
  stockLevel.value > 0
    ? "material-inventory_2"
    : "material-production_quantity_limits"
);

async function fetchStock() {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  stockLevel.value = Math.floor(Math.random() * 100);
  emit("stock-updated", stockLevel.value);
}

function handleWidgetClick() {
  console.log(`Widget clicked: ${props.productId}`);
  fetchStock();
}

onMounted(() => {
  fetchStock();
});

// Expose function for updateActiveWidget
defineExpose({
  refreshStock: fetchStock
});
</script>
```

## Register Widget in Blade

```vue
<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import ProductStockWidget from "./widgets/ProductStockWidget.vue";

const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

const productId = ref("PROD123");
const stock = ref(10);

// Register widget immediately
registerWidget(
  {
    id: `stock-widget-${productId.value}`,
    component: ProductStockWidget,
    props: {
      productId: productId.value,
      // Use computed for reactive props
      initialStock: computed(() => stock.value)
    },
    events: {
      "stock-updated": (newStock: number) => {
        console.log("Stock updated:", newStock);
        stock.value = newStock;
      }
    },
    isVisible: computed(() => productId.value !== "ARCHIVED"),
    updateFunctionName: "refreshStock"
  },
  blade.value.id
);

onBeforeUnmount(() => {
  // Clean up widget on unmount
  unregisterWidget(`stock-widget-${productId.value}`, blade.value.id);
});
</script>

<template>
  <VcBlade title="Product Details">
    <!-- Blade content -->
    <!-- Widgets are displayed automatically by VcBlade -->
  </VcBlade>
</template>
```

## Widget with Multiple Props

```vue
<!-- OfferStatsWidget.vue -->
<template>
  <VcWidget
    :title="title"
    :value="displayValue"
    :icon="icon"
    :class="statusClass"
    @click="onWidgetClick"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";

interface Props {
  offerId: string;
  status: "active" | "pending" | "expired";
  price: number;
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currency: "USD"
});

const emit = defineEmits<{
  click: [offerId: string];
}>();

const title = computed(() => `Offer ${props.offerId}`);

const displayValue = computed(() => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: props.currency
  }).format(props.price);

  return `${formatted} (${props.status})`;
});

const icon = computed(() => {
  const icons = {
    active: "material-check_circle",
    pending: "material-schedule",
    expired: "material-cancel"
  };
  return icons[props.status];
});

const statusClass = computed(() => {
  const classes = {
    active: "tw-text-green-500",
    pending: "tw-text-yellow-500",
    expired: "tw-text-red-500"
  };
  return classes[props.status];
});

function onWidgetClick() {
  emit("click", props.offerId);
}
</script>
```

## Register Widget with Events

```typescript
import { useWidgets } from "@vc-shell/framework";
import OfferStatsWidget from "./widgets/OfferStatsWidget.vue";

const { registerWidget } = useWidgets();

registerWidget({
  id: "offer-stats",
  component: OfferStatsWidget,
  props: {
    offerId: "OFFER-123",
    status: "active",
    price: 299.99,
    currency: "USD"
  },
  events: {
    click: (offerId: string) => {
      console.log("Offer clicked:", offerId);
      // Open offer details blade
      openBlade({
        blade: OfferDetails,
        param: offerId
      });
    }
  }
}, bladeId);
```

## Widget with Custom Value Display

```vue
<!-- CustomValueWidget.vue -->
<template>
  <VcWidget
    :title="title"
    icon="material-info"
  >
    <template #value>
      <div class="tw-flex tw-flex-col tw-gap-1">
        <span class="tw-text-2xl tw-font-bold">{{ mainValue }}</span>
        <span class="tw-text-sm tw-text-gray-500">{{ subValue }}</span>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";

interface Props {
  title: string;
  mainValue: string | number;
  subValue: string;
}

const props = defineProps<Props>();
</script>
```

## Conditional Widget Visibility

```typescript
import { ref, computed } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { usePermissions } from "@vc-shell/framework";

const { registerWidget } = useWidgets();
const blade = useBlade();
const { hasAccess } = usePermissions();

const isModified = ref(false);
const hasParam = ref(true);

// Static visibility
registerWidget({
  id: "widget1",
  component: Widget1,
  isVisible: true
}, blade.value.id);

// Computed visibility - most common pattern
registerWidget({
  id: "widget2",
  component: Widget2,
  // Widget only visible when param exists
  isVisible: computed(() => !!hasParam.value)
}, blade.value.id);

// Complex computed visibility
registerWidget({
  id: "widget3",
  component: Widget3,
  // Multiple conditions
  isVisible: computed(() =>
    isModified.value && hasParam.value && hasAccess("offers:read")
  )
}, blade.value.id);
```

## Widget with Refresh Functionality

```vue
<!-- RefreshableWidget.vue -->
<template>
  <VcWidget
    :title="title"
    :value="data"
    icon="material-data_usage"
    :loading="loading"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, defineExpose } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";
import { DataClient } from "../api_client/data.client";

interface Props {
  dataSource: string;
}

const props = defineProps<Props>();
const { getApiClient } = useApiClient(DataClient);

const loading = ref(false);
const data = ref<string>("");
const title = ref("Data Widget");

async function loadData() {
  loading.value = true;
  try {
    const client = await getApiClient();
    const result = await client.getData(
      new GetDataQuery({ source: props.dataSource })
    );
    data.value = result.value;
    title.value = result.title;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

// Expose for updateActiveWidget
defineExpose({
  refreshData: loadData
});
</script>
```

## Register with Update Function

```typescript
import { useWidgets, useBlade } from "@vc-shell/framework";
import RefreshableWidget from "./widgets/RefreshableWidget.vue";

const { registerWidget, updateActiveWidget } = useWidgets();
const blade = useBlade();

// Register widget with update function
registerWidget(
  {
    id: "refreshable-widget",
    component: RefreshableWidget,
    props: {
      dataSource: "sales"
    },
    updateFunctionName: "refreshData" // ← Matches defineExpose
  },
  blade.value.id
);

// Later: trigger update on active widget after save
async function saveData() {
  await updateOffer(offerData.value);
  // Calls refreshData() on active widget
  updateActiveWidget();
}
```

## Interactive Widget with Actions

```vue
<!-- InteractiveWidget.vue -->
<template>
  <VcWidget
    :title="title"
    :value="count"
    icon="material-add_circle"
  >
    <template #actions>
      <VcButton
        icon="material-add"
        size="sm"
        variant="text"
        @click="increment"
      />
      <VcButton
        icon="material-remove"
        size="sm"
        variant="text"
        @click="decrement"
      />
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcWidget, VcButton } from "@vc-shell/framework";

const title = ref("Counter Widget");
const count = ref(0);

const emit = defineEmits<{
  "count-changed": [value: number];
}>();

function increment() {
  count.value++;
  emit("count-changed", count.value);
}

function decrement() {
  count.value--;
  emit("count-changed", count.value);
}
</script>
```

## Widget with v-model Support

```vue
<!-- FormWidget.vue -->
<template>
  <VcWidget
    title="Quick Input"
    icon="material-edit"
  >
    <template #value>
      <VcInput
        :model-value="modelValue"
        @update:model-value="onUpdate"
        placeholder="Enter value..."
      />
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { VcWidget, VcInput } from "@vc-shell/framework";

interface Props {
  modelValue?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function onUpdate(value: string) {
  emit("update:modelValue", value);
}
</script>
```

## Register Widget with v-model

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useWidgets } from "@vc-shell/framework";
import FormWidget from "./widgets/FormWidget.vue";

const { registerWidget } = useWidgets();
const inputValue = ref("");

registerWidget({
  id: "form-widget",
  component: FormWidget,
  props: {
    modelValue: inputValue.value
  },
  events: {
    "update:modelValue": (value: string) => {
      inputValue.value = value;
      console.log("Widget value updated:", value);
    }
  }
}, bladeId);
</script>
```

## Widget Interface

```typescript
interface IWidget {
  // Unique identifier (required)
  id: string;

  // Display title (optional)
  title?: string;

  // Vue component (required)
  component: Component;

  // Props to pass to component (optional)
  props?: Record<string, unknown>;

  // Event handlers (optional)
  events?: Record<string, (...args: any[]) => void>;

  // Visibility control (optional)
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: IBladeInstance) => boolean);

  // Update function name (optional)
  updateFunctionName?: string;
}
```

## API Reference

```typescript
interface IWidgetService {
  // Register a widget
  registerWidget: (widget: IWidget, bladeId: string) => void;

  // Unregister a widget
  unregisterWidget: (widgetId: string, bladeId: string) => void;

  // Get widgets for blade
  getWidgets: (bladeId: string) => IWidget[];

  // Clear all widgets for blade
  clearBladeWidgets: (bladeId: string) => void;

  // Check if widget is active
  isActiveWidget: (id: string) => boolean;

  // Set active widget
  setActiveWidget: (options: { exposed: any; widgetId: string }) => void;

  // Update active widget
  updateActiveWidget: () => void;

  // Check if widget is registered
  isWidgetRegistered: (id: string) => boolean;

  // Update widget properties
  updateWidget: (options: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
}
```

## Important Notes

### ✅ DO

- Use unique widget IDs within each blade
- Use `VcWidget` as base component for consistency
- Use `useBlade()` to get blade ID
- Unregister widgets in `onBeforeUnmount`
- Use `defineExpose` for update functions
- Handle widget events properly
- Use computed for reactive props and visibility
- Register widgets immediately, not in `onMounted`

### ❌ DON'T

- Don't use duplicate widget IDs in same blade
- Don't forget to unregister widgets on unmount
- Don't use `markRaw` for components (not needed in Vue 3.3+)
- Don't ignore error handling in async widgets
- Don't register widgets in `onMounted` - do it immediately
- Don't forget to call `updateActiveWidget()` after saving

## Common Widget Patterns

### Stats Widget with Reactive Props
```typescript
const blade = useBlade();

registerWidget(
  {
    id: "stats",
    component: StatsWidget,
    props: {
      value: computed(() => totalSales.value),
      label: "Total Sales"
    }
  },
  blade.value.id
);
```

### Conditional Widget
```typescript
const blade = useBlade();

registerWidget(
  {
    id: "admin",
    component: AdminWidget,
    // Only visible when condition is met
    isVisible: computed(() => hasAccess("admin") && !!entityId.value)
  },
  blade.value.id
);
```

### Refreshable Widget with Update Function
```typescript
const blade = useBlade();

registerWidget(
  {
    id: "data",
    component: DataWidget,
    props: { items: computed(() => dataItems.value) },
    updateFunctionName: "refresh" // Exposed by widget
  },
  blade.value.id
);

// Call after save
async function save() {
  await saveData();
  updateActiveWidget(); // Calls refresh() on widget
}
```

## Real-World Complete Example

```vue
<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { SpecialPricesWidget } from "../components/widgets";

const props = defineProps<{
  param?: string; // Offer ID for edit mode
}>();

const { registerWidget, unregisterWidget, updateActiveWidget } = useWidgets();
const blade = useBlade();

const offer = ref({
  id: "",
  name: "",
  priceLists: []
});

// Register widget immediately
function registerWidgets() {
  registerWidget(
    {
      id: "SpecialPricesWidget",
      component: SpecialPricesWidget,
      // Reactive props using computed
      props: { priceLists: computed(() => offer.value.priceLists) },
      // Function to call on update
      updateFunctionName: "updateActiveWidgetCount",
      // Only show in edit mode (when param exists)
      isVisible: computed(() => !!props.param),
    },
    blade.value.id,
  );
}

registerWidgets();

// Save handler
async function saveOffer() {
  if (offer.value.id) {
    await updateOffer(offer.value);
  } else {
    await createOffer(offer.value);
  }

  // Update widget after save
  updateActiveWidget();
}

// Clean up on unmount
onBeforeUnmount(() => {
  unregisterWidget("SpecialPricesWidget", blade.value.id);
});
</script>

<template>
  <VcBlade title="Offer Details">
    <!-- Blade content -->
  </VcBlade>
</template>
```

## See Also

- [widget-lifecycle.md](./widget-lifecycle.md) - Widget lifecycle management
- [VcWidget Component](../../ui-components/vc-widget.md) - Widget base component

**Reference:** [Official VC-Shell Documentation - useWidgets](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useWidgets/)
