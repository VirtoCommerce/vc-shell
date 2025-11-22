---
id: useWidgets-widget-lifecycle
type: FRAMEWORK_API
category: composable
tags: [composable, widgets, lifecycle]
title: "useWidgets - Widget Lifecycle"
description: "Manage widget lifecycle within blades"
---

# useWidgets - Widget Lifecycle

Advanced widget lifecycle management including registration, updates, cleanup, and activation.

## Overview

- Register/unregister widgets dynamically
- Update widget properties
- Clear blade widgets
- Widget activation and updates
- Automatic cleanup on unmount

## Basic Widget Registration Pattern

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { SpecialPricesWidget } from "../components/widgets";

const props = defineProps<{
  param?: string;
}>();

const { registerWidget, unregisterWidget, updateActiveWidget } = useWidgets();
const blade = useBlade();

const offer = ref({ id: "", priceLists: [] });

// Register widgets in a function
function registerWidgets() {
  registerWidget(
    {
      id: "SpecialPricesWidget",
      component: SpecialPricesWidget,
      props: { priceLists: computed(() => offer.value.priceLists) },
      updateFunctionName: "updateActiveWidgetCount",
      isVisible: computed(() => !!props.param),
    },
    blade.value.id,
  );
}

// Call registration immediately
registerWidgets();

// Clean up on unmount
onBeforeUnmount(() => {
  unregisterWidget("SpecialPricesWidget", blade.value.id);
});

// Update active widget after save
async function saveOffer() {
  await updateOffer(offer.value);
  updateActiveWidget();
}
</script>

<template>
  <VcBlade title="Offer Details">
    <!-- Blade content -->
  </VcBlade>
</template>
```

## Update Widget Properties

```typescript
import { ref, watch } from "vue";
import { useWidgets } from "@vc-shell/framework";

const { registerWidget, updateWidget } = useWidgets();

const widgetConfig = ref({
  refreshInterval: 30000,
  showChart: true
});

// Initial registration
registerWidget({
  id: "configurable-widget",
  component: ConfigurableWidget,
  props: widgetConfig.value
}, bladeId);

// Update widget props when config changes
watch(widgetConfig, (newConfig) => {
  updateWidget({
    id: "configurable-widget",
    bladeId: bladeId,
    widget: {
      props: newConfig
    }
  });
}, { deep: true });
```

## Clear All Blade Widgets

```typescript
import { useWidgets } from "@vc-shell/framework";

const { clearBladeWidgets, getWidgets } = useWidgets();

function resetBladeWidgets() {
  // Get current widgets
  const widgets = getWidgets(bladeId);
  console.log(`Clearing ${widgets.length} widgets`);

  // Clear all widgets for this blade
  clearBladeWidgets(bladeId);

  // Re-register default widgets
  registerDefaultWidgets();
}

function registerDefaultWidgets() {
  registerWidget({
    id: "default-widget",
    component: DefaultWidget
  }, bladeId);
}
```

## Widget Activation

```vue
<script setup lang="ts">
import { onMounted, defineExpose } from "vue";
import { useWidgets } from "@vc-shell/framework";
import { VcWidget } from "@vc-shell/framework";

const { setActiveWidget, isActiveWidget } = useWidgets();

const widgetId = "my-widget";

// Expose methods that can be called externally
const exposed = {
  refreshData: async () => {
    await loadData();
  },
  reset: () => {
    data.value = null;
  }
};

onMounted(() => {
  // Register this widget as active
  setActiveWidget({
    exposed,
    widgetId
  });
});

// Check if this widget is active
const isActive = computed(() => isActiveWidget(widgetId));
</script>

<template>
  <VcWidget
    title="My Widget"
    :class="{ 'active-widget': isActive }"
  >
    <!-- Widget content -->
  </VcWidget>
</template>
```

## Update Active Widget

```typescript
import { useWidgets } from "@vc-shell/framework";

const { updateActiveWidget, registerWidget } = useWidgets();

// Register widget with update function
registerWidget({
  id: "refreshable",
  component: RefreshableWidget,
  updateFunctionName: "refreshData" // ← Function name in defineExpose
}, bladeId);

// Trigger update on active widget
function handleGlobalRefresh() {
  // This calls refreshData() on the currently active widget
  updateActiveWidget();
}
```

## Reactive Widget Props

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { ProductStatsWidget } from "../components/widgets";

const { registerWidget } = useWidgets();
const blade = useBlade();

const product = ref({
  id: "123",
  name: "Product A",
  stock: 100,
  price: 29.99
});

// Register widget with reactive computed props
registerWidget(
  {
    id: "product-stats",
    component: ProductStatsWidget,
    props: {
      // Reactive computed properties will update widget automatically
      productName: computed(() => product.value.name),
      stockLevel: computed(() => product.value.stock),
      price: computed(() => product.value.price),
    }
  },
  blade.value.id
);

// When product changes, widget props update automatically
function updateProduct() {
  product.value.stock = 75;
  product.value.price = 24.99;
  // Widget receives new props automatically via computed properties
}
</script>
```

## Widget Registration Lifecycle

```typescript
import { onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { Widget1, Widget2, Widget3 } from "../components/widgets";

const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

const widgets = [
  { id: "widget1", component: Widget1 },
  { id: "widget2", component: Widget2 },
  { id: "widget3", component: Widget3 }
];

// Register widgets immediately
function registerWidgets() {
  widgets.forEach((widget) => {
    registerWidget(widget, blade.value.id);
    console.log(`Registered: ${widget.id}`);
  });
}

registerWidgets();

// Clean up on unmount
onBeforeUnmount(() => {
  console.log("Cleaning up widgets...");
  widgets.forEach((widget) => {
    unregisterWidget(widget.id, blade.value.id);
    console.log(`Unregistered: ${widget.id}`);
  });
});
```

## Conditional Widget Visibility

```typescript
import { ref, computed } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";

const { registerWidget } = useWidgets();
const blade = useBlade();
const offer = ref({ status: "active", id: null });

// Widget visible only for specific conditions
registerWidget(
  {
    id: "conditional-widget",
    component: ConditionalWidget,
    props: { offerId: computed(() => offer.value.id) },
    // Show only when offer is active and has an ID
    isVisible: computed(() =>
      offer.value.status === "active" && !!offer.value.id
    ),
  },
  blade.value.id
);
```

## Widget State Management

```vue
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useWidgets } from "@vc-shell/framework";

const { registerWidget, updateWidget, getWidgets } = useWidgets();

const widgetState = ref({
  loading: false,
  data: null,
  error: null
});

// Register widget
registerWidget({
  id: "stateful-widget",
  component: StatefulWidget,
  props: { state: widgetState.value }
}, bladeId);

// Update widget state
watch(widgetState, (newState) => {
  updateWidget({
    id: "stateful-widget",
    bladeId,
    widget: {
      props: { state: newState }
    }
  });
}, { deep: true });

// Update state from async operations
async function loadData() {
  widgetState.value.loading = true;
  widgetState.value.error = null;

  try {
    const data = await fetchData();
    widgetState.value.data = data;
  } catch (error) {
    widgetState.value.error = error;
  } finally {
    widgetState.value.loading = false;
  }
}
</script>
```

## API Reference

```typescript
interface IWidgetService {
  // Registration
  registerWidget: (widget: IWidget, bladeId: string) => void;
  unregisterWidget: (widgetId: string, bladeId: string) => void;
  clearBladeWidgets: (bladeId: string) => void;

  // Querying
  getWidgets: (bladeId: string) => IWidget[];
  isWidgetRegistered: (id: string) => boolean;

  // Updates
  updateWidget: (options: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
  updateActiveWidget: () => void;

  // Activation
  isActiveWidget: (id: string) => boolean;
  setActiveWidget: (options: { exposed: any; widgetId: string }) => void;
}
```

## Important Notes

### ✅ DO

- Always unregister widgets in `onBeforeUnmount`
- Use unique widget IDs within each blade
- Use `useBlade()` composable to get blade ID
- Use computed properties for reactive widget props
- Call `updateActiveWidget()` after saving blade data
- Handle widget state updates properly with computed refs

### ❌ DON'T

- Don't forget to clean up widgets on unmount
- Don't reuse widget IDs across different widgets
- Don't update non-existent widgets
- Don't use `onMounted` for registration - register immediately
- Don't create memory leaks with widget refs

## Best Practices

```typescript
// 1. Register widgets immediately, not in onMounted
function registerWidgets() {
  registerWidget(
    {
      id: "my-widget",
      component: MyWidget,
      props: { data: computed(() => myData.value) }
    },
    blade.value.id
  );
}

// Call immediately at setup
registerWidgets();

// 2. Use computed for reactive props
registerWidget(
  {
    id: "reactive-widget",
    component: ReactiveWidget,
    props: {
      // ✅ Computed props update automatically
      items: computed(() => offer.value.priceLists),
      isActive: computed(() => !!offer.value.id)
    }
  },
  blade.value.id
);

// 3. Always clean up in onBeforeUnmount
onBeforeUnmount(() => {
  unregisterWidget("my-widget", blade.value.id);
});

// 4. Call updateActiveWidget after save
async function saveOffer() {
  await updateOffer(offer.value);
  // Update widget to reflect saved state
  updateActiveWidget();
}

// 5. Use isVisible for conditional display
registerWidget(
  {
    id: "conditional",
    component: ConditionalWidget,
    // Widget appears/disappears based on condition
    isVisible: computed(() => !!props.param)
  },
  blade.value.id
);
```

## Real-World Example

```vue
<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useWidgets, useBlade, useBladeNavigation } from "@vc-shell/framework";
import { SpecialPricesWidget } from "../components/widgets";

const props = defineProps<{
  param?: string;
}>();

const { registerWidget, unregisterWidget, updateActiveWidget } = useWidgets();
const blade = useBlade();

const offer = ref({
  id: "",
  name: "",
  priceLists: []
});

// Register widgets
function registerWidgets() {
  registerWidget(
    {
      id: "SpecialPricesWidget",
      component: SpecialPricesWidget,
      props: { priceLists: computed(() => offer.value.priceLists) },
      updateFunctionName: "updateActiveWidgetCount",
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

  // Trigger widget update
  updateActiveWidget();
}

// Clean up
onBeforeUnmount(() => {
  unregisterWidget("SpecialPricesWidget", blade.value.id);
});
</script>
```

## See Also

- [create-widget.md](./create-widget.md) - Creating blade widgets
- [VcWidget Component](../../ui-components/vc-widget.md) - Widget base component

**Reference:** [Official VC-Shell Documentation - useWidgets](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useWidgets/)
