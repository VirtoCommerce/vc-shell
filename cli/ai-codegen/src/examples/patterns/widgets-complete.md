---
id: null
type: null
complexity: SIMPLE
---

# Widgets Pattern

Widgets are interactive UI components that can be registered in details blades. They appear in a dedicated widget area and provide additional functionality or display related data.

## What are Widgets?

Widgets in VC-Shell are:
- **Modular UI components** that can be added to details blades
- **Based on VcWidget component** for consistent styling and behavior
- **Dynamically registered and unregistered** based on blade lifecycle
- **Used for related data** like shipping information, price lists, or additional actions

## VcWidget Component

All widgets should be based on the `VcWidget` component, which provides:

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | - | Material icon name |
| `title` | `string` | - | Widget title text |
| `value` | `string \| number` | - | Badge value (count, total, etc.) |
| `disabled` | `boolean` | `false` | Disables widget interaction |
| `isExpanded` | `boolean` | `false` | Expanded state (for widget content) |
| `horizontal` | `boolean` | `false` | Horizontal layout |

### Events

| Event | Description |
|-------|-------------|
| `@click` | Emitted when widget is clicked |

### Basic VcWidget Example

```vue
<template>
  <VcWidget
    icon="material-local_shipping"
    :title="$t('ORDERS.WIDGETS.SHIPPING.TITLE')"
    :value="shipments.length"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  order: {
    shipments: any[];
  };
}

const props = defineProps<Props>();

const shipments = computed(() => props.order.shipments || []);

function handleClick() {
  // Handle widget click - e.g., open a modal, expand details, etc.
  console.log("Shipping widget clicked");
}
</script>
```

**See:** `VcWidget-demo.md` for more VcWidget examples.

## Widget Structure

### File Organization

Widgets should be located in the module's components/widgets directory:

```
src/modules/orders/
  ├── components/
  │   └── widgets/
  │       ├── shipping-widget.vue
  │       ├── payment-widget.vue
  │       └── index.ts
  ├── pages/
  │   └── order-details.vue
  └── composables/
```

### Export Pattern

```typescript
// components/widgets/index.ts
export { default as ShippingWidget } from "./shipping-widget.vue";
export { default as PaymentWidget } from "./payment-widget.vue";
```

## Widget Registration with useWidgets

### Basic Registration

```typescript
import { computed, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { ShippingWidget } from "../components/widgets";

const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

// Define registration function
function registerWidgets() {
  registerWidget(
    {
      id: "ShippingWidget",
      component: ShippingWidget,
      props: {
        order: computed(() => order.value),
      },
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// ✅ CORRECT: Register BEFORE onMounted
registerWidgets();

// ✅ CORRECT: Unregister on unmount
onBeforeUnmount(() => {
  unregisterWidget("ShippingWidget", blade?.value.id);
});
```

### IWidget Interface

```typescript
interface IWidget {
  id: string;                    // Unique widget identifier
  component: Component;          // Vue component (usually based on VcWidget)
  props?: Record<string, any>;   // Props to pass to the widget component
  events?: Record<string, Function>; // Event handlers
  isVisible?: ComputedRef<boolean>; // Visibility control
  updateFunctionName?: string;   // Function name to call when widget data updates
}
```

## Important Rules

### ❌ WRONG: Registration inside onMounted

```typescript
// ❌ DON'T DO THIS
onMounted(() => {
  registerWidget({
    id: "MyWidget",
    component: MyWidget,
  }, blade?.value.id);
});
```

### ✅ CORRECT: Registration before onMounted

```typescript
// ✅ DO THIS
function registerWidgets() {
  registerWidget({
    id: "MyWidget",
    component: MyWidget,
  }, blade?.value.id);
}

// Call immediately after defining the function
registerWidgets();

// Then use onMounted for other initialization
onMounted(async () => {
  await loadData();
});
```

## Complete Examples

### Example 1: Shipping Widget

```vue
<!-- components/widgets/shipping-widget.vue -->
<template>
  <VcWidget
    icon="material-local_shipping"
    :title="$t('ORDERS.WIDGETS.SHIPPING.TITLE')"
    :value="shipmentCount"
    :disabled="!hasShipments"
    @click="openShipmentDetails"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Order } from "../../types";

interface Props {
  order: Order;
}

const props = defineProps<Props>();

const shipmentCount = computed(() => props.order.shipments?.length || 0);
const hasShipments = computed(() => shipmentCount.value > 0);

function openShipmentDetails() {
  if (hasShipments.value) {
    // Open shipment details modal or expand section
    console.log("Opening shipment details for:", props.order.id);
  }
}
</script>
```

### Example 2: Special Prices Widget with Events

```vue
<!-- components/widgets/special-prices-widget.vue -->
<template>
  <VcWidget
    icon="material-attach_money"
    :title="$t('OFFERS.WIDGETS.SPECIAL_PRICES.TITLE')"
    :value="priceCount"
    @click="emit('open-prices')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  priceLists: any[];
}

interface Emits {
  (event: "open-prices"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const priceCount = computed(() => props.priceLists?.length || 0);
</script>
```

### Example 3: Registration in Details Blade

```vue
<!-- pages/order-details.vue -->
<template>
  <VcBlade
    :title="bladeTitle"
    :modified="modified"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer>
      <VcForm>
        <!-- Form fields here -->
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { ShippingWidget, PaymentWidget } from "../components/widgets";
import { useOrderDetails } from "../composables";

interface Props {
  param?: string;
}

const props = defineProps<Props>();

const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();
const { order, loadOrder } = useOrderDetails();

// Widget registration function
function registerWidgets() {
  // Shipping widget
  registerWidget(
    {
      id: "ShippingWidget",
      component: ShippingWidget,
      props: {
        order: computed(() => order.value),
      },
      isVisible: computed(() => !!order.value?.shipments?.length),
    },
    blade?.value.id,
  );

  // Payment widget
  registerWidget(
    {
      id: "PaymentWidget",
      component: PaymentWidget,
      props: {
        order: computed(() => order.value),
      },
      events: {
        "process-payment": handlePaymentProcess,
      },
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// ✅ CRITICAL: Register widgets BEFORE onMounted
registerWidgets();

onMounted(async () => {
  if (props.param) {
    await loadOrder(props.param);
  }
});

onBeforeUnmount(() => {
  unregisterWidget("ShippingWidget", blade?.value.id);
  unregisterWidget("PaymentWidget", blade?.value.id);
});

function handlePaymentProcess() {
  // Handle payment processing
  console.log("Processing payment for order:", order.value.id);
}
</script>
```

## External Widgets

External widgets can be automatically registered across multiple blade types using `useExternalWidgets`.

### Example: Global Widget Registration

```typescript
import { computed } from "vue";
import { useExternalWidgets } from "@vc-shell/framework";

// Define blade data for external widget system
const bladeData = computed(() => ({
  bladeType: "order",
  entityId: order.value?.id,
  entityType: "order",
}));

// Automatically register external widgets
useExternalWidgets(bladeData);
```

### Registering External Widget Globally

```typescript
// In your module's main setup or plugin
import { registerExternalWidget } from "@vc-shell/framework";
import { OrderNotesWidget } from "./components/widgets";

registerExternalWidget({
  id: "OrderNotesWidget",
  component: OrderNotesWidget,
  bladeType: "order", // Will appear on all "order" type blades
});
```

## Widget with Update Function

Widgets can call a function in the parent blade to update data:

```typescript
function registerWidgets() {
  registerWidget(
    {
      id: "SpecialPricesWidget",
      component: SpecialPricesWidget,
      props: {
        priceLists: computed(() => offer.value.priceLists),
      },
      updateFunctionName: "updateActiveWidgetCount", // Function name in parent
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// Define the update function
function updateActiveWidgetCount() {
  // Update widget badge value or refresh data
  console.log("Widget count updated");
}
```

## Conditional Widget Visibility

Control widget visibility based on data state:

```typescript
registerWidget(
  {
    id: "ReviewsWidget",
    component: ReviewsWidget,
    props: {
      product: computed(() => product.value),
    },
    // Only show widget when product has reviews
    isVisible: computed(() => 
      !!product.value?.reviews?.length && 
      !!props.param
    ),
  },
  blade?.value.id,
);
```

## Best Practices

1. **Register BEFORE onMounted** - Widgets must be registered before component mounts
2. **Always unregister** - Clean up widgets in `onBeforeUnmount`
3. **Use computed props** - Pass reactive data using `computed()`
4. **Conditional visibility** - Use `isVisible` to show/hide widgets based on state
5. **Widget naming** - Use descriptive IDs: `{Entity}{Purpose}Widget`
6. **Location consistency** - Keep all widgets in `components/widgets/`
7. **Export pattern** - Export widgets from `components/widgets/index.ts`
8. **Base on VcWidget** - Always use VcWidget as the base component
9. **Event handling** - Use `events` prop for widget-to-parent communication
10. **i18n for titles** - Never hardcode widget titles

## Real-World Examples

### From vendor-portal Application

1. **offers-details.vue** (line 682) - Special prices widget registration
2. **order-details.vue** (line 540) - Multiple widgets with different purposes
3. **ProductDetailsBase.vue** (line 646) - Product-related widgets
4. **shipping-widget.vue** - Simple shipping information widget
5. **special-prices-widget.vue** - Complex widget with props and events

## Related Documentation

- `VcWidget-demo.md` - VcWidget component examples and API
- `useWidgets.md` - Complete useWidgets composable documentation
- `blade-details-pattern.md` - How widgets fit into details blade pattern

