# UI Composables

This directory contains reusable composables for UI components.

## Available Composables

### useAdaptiveItems

A composable for adaptive rendering of elements in a container that automatically determines which elements fit in the available space without using hidden "measure" containers.

#### Features

- **Automatic size measurement** — precise element size detection using ResizeObserver
- **Size caching** — improves performance by storing element dimensions
- **Support for different display strategies** — choose between displaying from the beginning or end of the list
- **Reactivity** — automatic recalculation when container or element sizes change
- **Performance** — optimized algorithm with minimal DOM operations

#### Usage

```vue
<template>
  <div ref="containerRef">
    <!-- Visible elements -->
    <div 
      v-for="item in visibleItems" 
      :key="item.id"
      :data-item-key="item.id"
    >
      {{ item.content }}
    </div>
    
    <!-- Dropdown menu for hidden elements -->
    <dropdown-menu 
      v-if="showMoreButton"
      :items="hiddenItems"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAdaptiveItems } from 'framework/ui/composables/useAdaptiveItems';

const containerRef = ref(null);
const items = ref([
  { id: '1', content: 'Item 1' },
  { id: '2', content: 'Item 2' },
  // ...
]);

const { 
  visibleItems,      // Elements that fit in the container
  hiddenItems,       // Elements that don't fit
  showMoreButton,    // Flag indicating if "More" button should be shown
  recalculate,       // Function for manual recalculation
  updateObserver     // Function to update the observer
} = useAdaptiveItems({
  containerRef,
  items,
  getItemKey: (item) => item.id,             // Function to get unique element key
  moreButtonWidth: 80,                       // Width of the "More" button
  calculationStrategy: 'forward',            // Strategy: 'forward' or 'reverse'
  initialItemWidth: 100                      // Initial estimate of element width
});
</script>
```

#### Important: data-item-key Attribute

For the composable to work correctly, you need to add the `data-item-key` attribute to each element:

```vue
<div 
  v-for="item in visibleItems" 
  :key="item.id"
  :data-item-key="item.id" <!-- Required for size measurement -->
>
  {{ item.content }}
</div>
```

#### API

```typescript
function useAdaptiveItems<T>(options: {
  // Reference to the container
  containerRef: Ref<HTMLElement | null>;
  
  // List of items
  items: Ref<T[]> | ComputedRef<T[]>;
  
  // Function to get unique key for an item
  getItemKey: (item: T) => string;
  
  // Width of the "More" button
  moreButtonWidth: number;
  
  // Calculation strategy: 'forward' (from beginning) or 'reverse' (from end)
  calculationStrategy?: 'forward' | 'reverse';
  
  // Initial estimate of item width (before measurement)
  initialItemWidth?: number;
}): {
  // Elements that fit in the container
  visibleItems: Ref<T[]>;
  
  // Elements that don't fit
  hiddenItems: Ref<T[]>;
  
  // Flag indicating if "More" button should be shown
  showMoreButton: Ref<boolean>;
  
  // Function for manual recalculation
  recalculate: () => void;
  
  // Function to update the observer (if the list of elements has changed)
  updateObserver: () => void;
}
```

#### Calculation Strategies

- **forward** (default) — elements are displayed from the beginning of the list, remaining ones are hidden
- **reverse** — elements are displayed from the end of the list, first elements are hidden

#### Usage Examples

##### Breadcrumbs (with reverse strategy)

```typescript
const { visibleItems, hiddenItems, showMoreButton } = useAdaptiveItems({
  containerRef: el,
  items: toRef(props, "items"),
  getItemKey: (item) => item.id,
  moreButtonWidth: 100,
  calculationStrategy: "reverse", // Show last elements, hide first ones
  initialItemWidth: 100
});
```

##### Toolbar

```typescript
const { visibleItems, hiddenItems, showMoreButton } = useAdaptiveItems({
  containerRef: toolbarRef,
  items: computed(() => tools),
  getItemKey: (item) => item.id,
  moreButtonWidth: 70,
  calculationStrategy: "forward", // Show first elements, hide last ones
  initialItemWidth: 60
});
```

#### Performance Optimization

1. **Don't overuse recalculations** — use `recalculate()` only when truly necessary
2. **Set accurate initialItemWidth** — this reduces the number of redraws during initial loading
3. **Use updateObserver** — after adding new elements, call this function to update the observer
4. **Let the composable do its job** — the automatic measurement mechanism is efficient, trust it
