---
id: parent-child-communication
type: PATTERN
complexity: MODERATE
category: pattern
tags: [pattern]
title: "Parent Child Communication"
description: "Parent Child Communication pattern"
---

# Parent-Child Blade Communication Pattern

This example shows the **correct** way to handle communication between parent and child blades in VC-Shell framework.

## ❌ WRONG: Using onParentCall (DOES NOT EXIST)

```typescript
// ❌ THIS WILL CAUSE TYPESCRIPT ERROR:
// Property 'onParentCall' does not exist on type 'IBladeEvent'

const { openBlade } = useBladeNavigation();

openBlade({
  blade: markRaw(ProductDetails),
  param: product.id,
  onParentCall(args) {  // ❌ ERROR: onParentCall doesn't exist!
    if (args.method === "reload") {
      reload();
    }
  }
});
```

## ✅ CORRECT: Using emit and blade event handlers

### Pattern 1: Reload on Close (Most Common)

**Parent blade (list):**
```typescript
import { useBladeNavigation } from '@vc-shell/framework';
import { markRaw } from 'vue';
import ProductDetails from './product-details.vue';

const { openBlade } = useBladeNavigation();

async function onItemClick(item: Product) {
  openBlade({
    blade: markRaw(ProductDetails),
    param: item.id,
    onClose() {
      // Child closed - reload parent list
      reload();
    }
  });
}
```

**Child blade (details):**
```typescript
// Just close the blade after save
async function onSave() {
  await saveProduct();
  notification.success(t('PRODUCT.SAVED'));

  // Close blade - parent's onClose will trigger reload
  emit('close:blade');
}
```

### Pattern 2: Custom Parent Methods via defineExpose

**Parent blade:**
```typescript
import { useBladeNavigation } from '@vc-shell/framework';

const { openBlade } = useBladeNavigation();

// Expose methods that child can call
defineExpose({
  reload,
  updateItem,
  deleteItem
});

function updateItem(id: string, data: Partial<Product>) {
  const index = items.value.findIndex(i => i.id === id);
  if (index !== -1) {
    items.value[index] = { ...items.value[index], ...data };
  }
}

function deleteItem(id: string) {
  items.value = items.value.filter(i => i.id !== id);
}
```

**Child blade:**
```typescript
import { useBladeNavigation } from '@vc-shell/framework';

const { blades } = useBladeNavigation();

async function onSave() {
  await saveProduct();

  // Get parent blade component instance
  const parentBlade = blades.value[blades.value.length - 2];
  const parentComponent = parentBlade?.component?.exposed;

  // Call parent's exposed method
  if (parentComponent?.updateItem) {
    parentComponent.updateItem(product.value.id, product.value);
  }

  emit('close:blade');
}
```

### Pattern 3: Event Bus (For Complex Scenarios)

**Use window.dispatchEvent for cross-blade communication:**

**Child blade (emitter):**
```typescript
async function onSave() {
  await saveProduct();

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('ProductUpdated', {
    detail: { productId: product.value.id, product: product.value }
  }));

  emit('close:blade');
}
```

**Parent blade (listener):**
```typescript
import { onMounted, onBeforeUnmount } from 'vue';

// Event handler with correct type signature
function onProductUpdated(event: Event) {
  const customEvent = event as CustomEvent<{ productId: string; product: Product }>;
  const { productId, product } = customEvent.detail;

  updateItemInList(productId, product);
}

onMounted(() => {
  // ✅ CORRECT: Use Event type, not CustomEvent
  window.addEventListener('ProductUpdated', onProductUpdated);
});

onBeforeUnmount(() => {
  window.removeEventListener('ProductUpdated', onProductUpdated);
});
```

## Summary

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| **onClose callback** | Simple reload after child closes | ⭐ Simple |
| **defineExpose** | Direct method calls from child to parent | ⭐⭐ Medium |
| **Event Bus** | Multiple listeners, cross-module communication | ⭐⭐⭐ Complex |

### Key Points

1. ❌ **NEVER** use `onParentCall` in `openBlade()` config - it doesn't exist in `IBladeEvent`
2. ✅ **ALWAYS** use `onClose`, `onOpen` callbacks for simple communication
3. ✅ Use `defineExpose()` in parent + `blades.value[n].component.exposed` in child for direct calls
4. ✅ Use `window.dispatchEvent` + `addEventListener` for event-based communication
5. ⚠️ Event handlers MUST use `Event` type, then cast to `CustomEvent` inside function

## IBladeEvent Interface Reference

```typescript
interface IBladeEvent<T = Component> {
  blade: T;                    // ✅ Blade component to open
  param?: string | object;     // ✅ Parameters to pass to blade
  options?: object;            // ✅ Additional options
  replaceCurrentBlade?: boolean; // ✅ Replace current blade instead of push
  onOpen?: () => void;         // ✅ Callback when blade opens
  onClose?: () => void;        // ✅ Callback when blade closes

  // ❌ onParentCall DOES NOT EXIST
  // ❌ onUpdate DOES NOT EXIST
  // ❌ onReload DOES NOT EXIST
}
```
