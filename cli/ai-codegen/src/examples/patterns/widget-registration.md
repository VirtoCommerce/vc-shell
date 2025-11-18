# Widget Registration Pattern

Based on real production code from `apps/vendor-portal/src/modules/offers/pages/offers-details.vue:668-682`.

## Overview

Widgets are contextual side panels that display related information or actions for the current blade. The VC-Shell framework provides the `useWidgets()` API for proper widget lifecycle management.

## Correct Pattern

```typescript
import { useWidgets, useBlade } from "@vc-shell/framework";
import { onBeforeUnmount, computed } from "vue";
import { SpecialPricesWidget } from "../widgets/special-prices-widget.vue";

// Get widget API and blade reference
const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

// Widget registration function
function registerWidgets() {
  registerWidget(
    {
      id: "special-prices",
      component: SpecialPricesWidget,  // Direct component reference
      props: {
        // Reactive props using computed()
        priceLists: computed(() => offer.value.priceLists),
        offerId: computed(() => offer.value?.id),
      },
      updateFunctionName: "updateActiveWidgetCount",  // Optional callback
      isVisible: computed(() => !!props.param),  // Show only for existing items
    },
    blade?.value.id,  // Parent blade ID for proper widget nesting
  );
}

// Call registration immediately after setup
registerWidgets();

// IMPORTANT: Always cleanup on unmount
onBeforeUnmount(() => {
  unregisterWidget("special-prices", blade?.value.id);
});
```

## Key Points

### 1. NO `markRaw()` on Component
❌ **WRONG:**
```typescript
component: markRaw(SpecialPricesWidget),  // Don't do this!
```

✅ **CORRECT:**
```typescript
component: SpecialPricesWidget,  // Direct component reference
```

### 2. Reactive Props with `computed()`
Widget props should be reactive to reflect current blade state:

```typescript
props: {
  data: computed(() => entity.value),
  isEditing: computed(() => !!entity.value?.id),
}
```

### 3. Conditional Visibility
Use `isVisible` to control when widget appears:

```typescript
isVisible: computed(() => {
  // Only show for existing items (not during creation)
  return !!props.param;
}),
```

### 4. Immediate Registration
Call `registerWidgets()` right after setup, not in `onMounted`:

```typescript
// Setup hooks
const { registerWidget, unregisterWidget } = useWidgets();

function registerWidgets() {
  // ... registration code
}

// Call immediately
registerWidgets();  // ← Not in onMounted!
```

### 5. Always Cleanup
Unregister widgets in `onBeforeUnmount` to prevent memory leaks:

```typescript
onBeforeUnmount(() => {
  unregisterWidget("widget-id", blade?.value.id);
});
```

## Complete Example

```vue
<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { useOfferDetails } from "../composables";
import { SpecialPricesWidget } from "../widgets/special-prices-widget.vue";

interface Props {
  param?: string;
  // ... other props
}

const props = defineProps<Props>();

// Composable
const { offer, loading } = useOfferDetails();

// Widget API
const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

// Register widgets
function registerWidgets() {
  registerWidget(
    {
      id: "special-prices",
      component: SpecialPricesWidget,
      props: {
        priceLists: computed(() => offer.value.priceLists),
        offerId: computed(() => offer.value?.id),
      },
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// Call immediately
registerWidgets();

// Cleanup
onBeforeUnmount(() => {
  unregisterWidget("special-prices", blade?.value.id);
});
</script>
```

## Common Mistakes

### ❌ Using `markRaw()`
```typescript
// WRONG - Don't wrap component in markRaw
component: markRaw(MyWidget),
```

### ❌ Non-Reactive Props
```typescript
// WRONG - Props won't update when data changes
props: {
  data: entity.value,  // Static snapshot!
}

// CORRECT - Reactive props
props: {
  data: computed(() => entity.value),  // Updates automatically
}
```

### ❌ Registering in `onMounted`
```typescript
// WRONG - Too late, widget won't appear immediately
onMounted(() => {
  registerWidgets();
});

// CORRECT - Call immediately after setup
registerWidgets();
```

### ❌ Forgetting to Unregister
```typescript
// WRONG - Memory leak! Widget stays registered after blade closes
// No cleanup code

// CORRECT - Always cleanup
onBeforeUnmount(() => {
  unregisterWidget("my-widget", blade?.value.id);
});
```

## Widget Component Structure

Your widget component should follow this pattern:

```vue
<!-- widgets/special-prices-widget.vue -->
<template>
  <VcWidget
    :title="$t('WIDGETS.SPECIAL_PRICES.TITLE')"
    :count="count"
  >
    <!-- Widget content -->
    <div v-if="priceLists?.length">
      <VcTable
        :items="priceLists"
        :columns="columns"
      />
    </div>
    <div v-else>
      {{ $t('WIDGETS.SPECIAL_PRICES.EMPTY') }}
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  priceLists?: any[];
  offerId?: string;
}

const props = defineProps<Props>();

const count = computed(() => props.priceLists?.length || 0);

// Optional: Expose update function for parent blade
defineExpose({
  updateActiveWidgetCount: (newCount: number) => {
    // Handle count update if needed
  },
});
</script>
```

## References

- Real implementation: `apps/vendor-portal/src/modules/offers/pages/offers-details.vue:668-682`
- Framework docs: `@vc-shell/framework` useWidgets API
- Widget component: `@vc-shell/framework` VcWidget
