---
id: null
type: null
complexity: SIMPLE
---

# Details Composable Pattern

This pattern is used for managing data in details/form blades, including loading, saving, deleting, and tracking modifications.

## Purpose
Encapsulate all data fetching, saving, and state management logic for a details blade. The composable provides reactive state for a single item and methods for CRUD operations.

## Key Features
- Reactive state for single item
- API integration for CRUD operations
- Modification tracking (dirty state)
- Auto-save detection
- Create and update support
- Notifications integration

## Complete Example

### useProductDetails.ts

```typescript
import { Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

// Import your API client and types
// import { ProductClient } from "@/api_client/products";
// import { IProduct } from "@/api/products";

interface IProduct {
  id?: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  category?: string;
  isActive?: boolean;
  createdDate?: string;
  [key: string]: unknown;
}

export function useProductDetails() {
  const { t } = useI18n({ useScope: "global" });
  const router = useRouter();

  // State
  const item: Ref<IProduct> = ref({});
  const loading = ref(false);
  const isModified = ref(false);
  const originalItem: Ref<IProduct | null> = ref(null);

  // Methods
  async function loadProduct(id: string) {
    loading.value = true;

    try {
      const client = new ProductClient();
      const result = await client.get(id);
      
      item.value = result;
      originalItem.value = JSON.parse(JSON.stringify(result));
    } catch (error) {
      console.error("[useProductDetails] Error loading product:", error);
      notification.error(t("NOTIFICATIONS.LOAD_ERROR"));
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function saveProduct() {
    loading.value = true;

    try {
      const client = new ProductClient();
      
      if (item.value.id) {
        // Update existing
        await client.update(item.value);
      } else {
        // Create new
        const created = await client.create(item.value);
        item.value = created;
        
        // Navigate to the created item
        router.replace({ params: { id: created.id } });
      }

      notification.success(t("NOTIFICATIONS.SAVED"));
      isModified.value = false;
      originalItem.value = JSON.parse(JSON.stringify(item.value));
    } catch (error) {
      console.error("[useProductDetails] Error saving product:", error);
      notification.error(t("NOTIFICATIONS.SAVE_ERROR"));
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: string) {
    loading.value = true;

    try {
      const client = new ProductClient();
      await client.delete([id]);

      notification.success(t("NOTIFICATIONS.DELETED"));

      // Close blade after delete
      router.back();
    } catch (error) {
      console.error("[useProductDetails] Error deleting product:", error);
      notification.error(t("NOTIFICATIONS.DELETE_ERROR"));
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetModificationState() {
    isModified.value = false;
    originalItem.value = JSON.parse(JSON.stringify(item.value));
  }

  // Track modifications by comparing current item with original
  watch(
    item,
    (newValue) => {
      if (originalItem.value) {
        isModified.value =
          JSON.stringify(newValue) !== JSON.stringify(originalItem.value);
      }
    },
    { deep: true }
  );

  return {
    // State
    item,
    loading,
    isModified,
    
    // Methods
    loadProduct,
    saveProduct,
    deleteProduct,
    resetModificationState,
  };
}
```

## Return Values

### State (Refs)
- `item: Ref<T>` - The item being edited
- `loading: Ref<boolean>` - Loading state indicator
- `isModified: Ref<boolean>` - Whether item has unsaved changes

### Methods
- `loadEntity(id: string)` - Load an item by ID
- `saveEntity()` - Save the current item (create or update)
- `deleteEntity(id: string)` - Delete an item by ID
- `resetModificationState()` - Reset the modified flag (after save)

## Usage in Blade

```vue
<script setup lang="ts">
import { useProductDetails } from "../composables";

const {
  item,
  loading,
  isModified,
  loadProduct,
  saveProduct,
  deleteProduct,
  resetModificationState,
} = useProductDetails();

onMounted(async () => {
  if (props.param) {
    await loadProduct(props.param);
  }
});

async function handleSave() {
  await saveProduct();
  resetModificationState();
}
</script>
```

## Patterns to Follow

1. **Naming convention**: `use{EntityName}Details`
2. **Return object**: Return state and methods, not just values
3. **Loading state**: Set loading to true before async operations
4. **Error handling**: Always catch and log errors, show notifications
5. **Modification tracking**: Use deep watch to detect changes
6. **Original copy**: Keep a copy of original item for comparison
7. **Create vs Update**: Handle both in the save method
8. **Navigation**: Navigate to new item after creation
9. **Reset after save**: Call resetModificationState after successful save
10. **TypeScript**: Define interface for entity type
11. **Notifications**: Use notification service for user feedback
12. **Router integration**: Use router for navigation after delete
13. **Deep clone**: Use JSON.parse/stringify for deep cloning objects
14. **Reactive refs**: All state should be refs
15. **i18n**: Use translation keys for notifications

