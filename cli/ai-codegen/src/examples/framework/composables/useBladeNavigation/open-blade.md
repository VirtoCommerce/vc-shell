---
id: framework-useBladeNavigation
type: API
complexity: MODERATE
category: framework
tags: [composable, framework]
critical: true
title: "useBladeNavigation"
description: "useBladeNavigation composable API"
---

# useBladeNavigation - Open Blade

**Capability:** `open-blade`
**When to use:** Open child blade from list or parent blade
**Source:** `apps/vendor-portal/src/modules/offers/pages/offers-list.vue`

---

## Description

Opens a child blade for viewing or editing details. The opened blade is added to the navigation stack and can communicate with parent via events.

---

## Required Imports

```typescript
import { useBladeNavigation } from "@vc-shell/framework";
import DetailsComponent from "./details.vue";
```

---

## Complete Example (from vendor-portal)

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";
import OffersDetails from "./offers-details.vue";

const { openBlade } = useBladeNavigation();
const selectedItemId = ref<string>();

// Open details blade from table row click
async function onItemClick(item: { id: string }) {
  await openBlade({
    blade: OffersDetails,
    param: item.id,  // Pass ID as route param
    onOpen() {
      // Called when blade is opened
      selectedItemId.value = item.id;
    },
    onClose() {
      // Called when blade is closed
      selectedItemId.value = undefined;
    },
  });
}

// Open empty details blade for creating new item
async function onAddClick() {
  await openBlade({
    blade: OffersDetails,
    // No param = create mode
  });
}

// Open blade with custom options
async function onEditWithOptions(item: any) {
  await openBlade({
    blade: OffersDetails,
    param: item.id,
    options: {
      // Custom data passed to child blade
      sellerProduct: item.sellerProduct,
      addOffer: true,
    },
  });
}
</script>
```

---

## Key Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `blade` | `Component` | Yes | Vue component to open |
| `param` | `string` | No | Route parameter (usually ID) |
| `options` | `object` | No | Custom data for child blade |
| `onOpen` | `() => void` | No | Callback when blade opens |
| `onClose` | `() => void` | No | Callback when blade closes |

---

## Common Patterns

### Pattern 1: List to Details Navigation
```typescript
// In list blade
async function onItemClick(item: { id: string }) {
  await openBlade({
    blade: ItemDetails,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;  // Highlight selected row
    },
    onClose() {
      selectedItemId.value = undefined;
      reload();  // Refresh list after details close
    },
  });
}
```

### Pattern 2: Create New Item
```typescript
// In toolbar "Add" button
async function onAddItem() {
  await openBlade({
    blade: ItemDetails,
    // No param = create mode
    onClose() {
      reload();  // Refresh list with new item
    },
  });
}
```

### Pattern 3: Open with Custom Options
```typescript
// Pass complex data to child blade
async function onOpenWithContext(item: any) {
  await openBlade({
    blade: ChildBlade,
    param: item.id,
    options: {
      parentData: item,
      mode: "edit",
      relatedItems: item.relatedItems,
    },
  });
}
```

---

## Related APIs

- **closeBlade()** - Close current or specific blade
- **onBeforeClose()** - Intercept blade close event
- **emit('close:blade')** - Alternative way to close blade

---

## Important Notes

1. ✅ **Use openBlade()** - Not `navigateTo()` or router
2. ✅ **Pass param for edit mode** - Omit param for create mode
3. ✅ **Use onClose callback** - To reload parent list
4. ❌ **Don't use markRaw()** - Pass component directly
5. ❌ **Don't manipulate router directly** - Use framework navigation

---

## Real Production Example

From `apps/vendor-portal/src/modules/offers/pages/offers-list.vue:232-247`:

```typescript
async function onItemClick(item: IOffer) {
  await openBlade({
    blade: OffersDetails,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}
```

This pattern is used throughout vendor-portal for all list → details navigation.
