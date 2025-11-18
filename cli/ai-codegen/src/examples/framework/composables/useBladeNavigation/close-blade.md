# useBladeNavigation - Close Blade

**Capability:** `close-blade`
**When to use:** Close current blade after action (save, delete)
**Source:** Real-world pattern from vendor-portal

---

## Description

Closes the current blade. **IMPORTANT:** In real applications, always use `emit("close:blade")` to close the current blade. The `closeBlade(index)` method is for closing specific blade by index and is rarely used.

---

## Required Imports

```typescript
import { useBladeNavigation } from "@vc-shell/framework";
```

---

## Complete Example

```vue
<script setup lang="ts">
import { notification } from "@vc-shell/framework";

// ✅ CORRECT - Define emit
const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

// Close after successful save
async function onSave() {
  try {
    await saveItem();
    notification.success("Item saved successfully");

    // ✅ Close the blade using emit
    emit("close:blade");
  } catch (error) {
    notification.error("Failed to save item");
  }
}

// Close after delete with parent reload
async function onDelete() {
  try {
    await deleteItem();
    notification.success("Item deleted successfully");

    // ✅ Close blade - parent's onClose callback will handle reload
    emit("close:blade");
  } catch (error) {
    notification.error("Failed to delete item");
  }
}
</script>
```

---

## Usage with VcBlade Component

Blade component should emit close event:

```vue
<template>
  <VcBlade
    @close="$emit('close:blade')"
  >
    <!-- content -->
  </VcBlade>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

function onCustomClose() {
  // Do cleanup before closing
  emit("close:blade");
}
</script>
```

---

## Common Patterns

### Pattern 1: Close After Save
```typescript
import { notification } from "@vc-shell/framework";

const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

async function onSave() {
  try {
    await updateItem(item.value);
    notification.success(t("COMMON.SAVE_SUCCESS"));
    emit("close:blade");  // ✅ Correct
  } catch (error) {
    notification.error(t("COMMON.SAVE_ERROR"));
  }
}
```

### Pattern 2: Close After Delete
```typescript
const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

async function onDelete() {
  if (await showConfirmation(t("COMMON.CONFIRM_DELETE"))) {
    try {
      await deleteItem(item.value.id);
      notification.success(t("COMMON.DELETE_SUCCESS"));
      emit("close:blade");  // Parent's onClose will reload list
    } catch (error) {
      notification.error(t("COMMON.DELETE_ERROR"));
    }
  }
}
```

### Pattern 3: Conditional Close (Keep Blade Open)
```typescript
const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

async function onSaveAndContinue() {
  try {
    await saveItem(item.value);
    notification.success(t("COMMON.SAVE_SUCCESS"));
    // Don't close - user wants to continue editing
  } catch (error) {
    notification.error(t("COMMON.SAVE_ERROR"));
  }
}

async function onSaveAndClose() {
  try {
    await saveItem(item.value);
    notification.success(t("COMMON.SAVE_SUCCESS"));
    emit("close:blade");  // ✅ Close after save
  } catch (error) {
    notification.error(t("COMMON.SAVE_ERROR"));
  }
}
```

---

## Related APIs

- **openBlade()** - Open child blade
- **onBeforeClose()** - Intercept close event
- **emit('close:blade')** - Standard close method (recommended)
- **closeBlade(index)** - Close specific blade by index (advanced)
- **notification** - Show user feedback

---

## Important Notes

1. ✅ **Use emit("close:blade")** - The standard pattern for closing current blade
2. ❌ **NEVER use closeBlade() without index** - This is incorrect for current blade
3. ❌ **NEVER use closeCurrentBlade()** - This function does NOT exist!
4. ✅ **Show notification** - Give user feedback before close
5. ✅ **Handle errors** - Don't close on error
6. ✅ **Parent reloads via onClose** - Set up in parent's openBlade() call

---

## Common Mistakes

### ❌ WRONG - Using closeBlade() for current blade
```typescript
import { useBladeNavigation } from "@vc-shell/framework";

const { closeBlade } = useBladeNavigation();

// ❌ WRONG - closeBlade() needs an index parameter
closeBlade();

// ❌ WRONG - This function does NOT exist
closeCurrentBlade();

// ❌ WRONG - This is router, not blade navigation
router.back();
```

### ✅ CORRECT - Using emit
```typescript
// ✅ CORRECT - Always use emit for current blade
const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

emit("close:blade");  // ✅ This is the standard pattern!
```

### Advanced - Using closeBlade(index) (Rarely Used)
```typescript
import { useBladeNavigation } from "@vc-shell/framework";

const { closeBlade } = useBladeNavigation();

// ⚠️ ADVANCED - Close specific blade by index
// Closes all blades from index to the end
closeBlade(1);  // Closes from blade 1 to last blade
```

---

## Real-World Usage

In details blade after delete (from vendor-portal):

```typescript
import { notification, usePopup } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (event: "close:blade"): void;
}>();

const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });

async function onDelete() {
  if (!item.value.id) return;

  if (await showConfirmation(t("COMMON.CONFIRM_DELETE"))) {
    try {
      await deleteItem({ id: item.value.id });
      notification.success(t("COMMON.DELETE_SUCCESS"));

      // ✅ Close blade - parent list will reload via onClose callback
      emit("close:blade");
    } catch (error) {
      console.error("Error deleting item:", error);
      notification.error(t("COMMON.DELETE_ERROR"));
    }
  }
}
```

This is the standard pattern used throughout VC Shell applications.
