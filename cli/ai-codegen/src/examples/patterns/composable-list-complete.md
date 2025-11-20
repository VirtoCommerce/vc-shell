---
id: null
type: null
complexity: SIMPLE
---

# List Composable Pattern

This pattern is used for managing data in list/grid blades, including loading, pagination, search, sorting, and CRUD operations.

## Purpose
Encapsulate all data fetching and state management logic for a list blade. The composable provides reactive state and methods that the blade component can use.

## Key Features
- Reactive state for items, loading, pagination
- API integration for fetching data
- Search and sort functionality
- Pagination support
- CRUD operations
- Auto-reload on parameter changes

## Complete Example

### useProductList.ts

```typescript
import { Ref, ref, computed, watch } from "vue";

// Import your API client
// import { ProductClient } from "@/api_client/products";
// import { IProduct } from "@/api/products";

interface IProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  createdDate: string;
  [key: string]: unknown;
}

export interface UseProductListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  keyword?: string;
}

export function useProductList() {
  // State
  const items: Ref<IProduct[]> = ref([]);
  const loading = ref(false);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const searchValue = ref("");
  const sortExpression = ref<string | undefined>("createdDate:desc");
  const selectedItemId = ref<string | undefined>();
  const activeFilterCount = ref(0);

  // Computed
  const pages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  // Methods
  async function loadProductList(params?: UseProductListParams) {
    loading.value = true;

    try {
      // Call your API
      const client = new ProductClient();
      const response = await client.search({
        skip: ((params?.page || currentPage.value) - 1) * pageSize.value,
        take: pageSize.value,
        sort: params?.sort || sortExpression.value,
        keyword: params?.keyword || searchValue.value,
      });
      
      items.value = response.results || [];
      totalCount.value = response.totalCount || 0;
    } catch (error) {
      console.error("[useProductList] Error loading products:", error);
      items.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  }

  async function removeProduct(id: string) {
    loading.value = true;

    try {
      const client = new ProductClient();
      await client.delete([id]);

      // Refresh list after delete
      await loadProductList();
    } catch (error) {
      console.error("[useProductList] Error removing product:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function reload() {
    await loadProductList();
  }

  // Auto-reload when search, sort, or page changes
  watch([searchValue, sortExpression, currentPage], () => {
    loadProductList();
  });

  return {
    // State
    items,
    loading,
    totalCount,
    pages,
    currentPage,
    pageSize,
    searchValue,
    sortExpression,
    selectedItemId,
    activeFilterCount,
    
    // Methods
    loadProductList,
    removeProduct,
    reload,
  };
}
```

## Return Values

### State (Refs)
- `items: Ref<T[]>` - Array of items to display
- `loading: Ref<boolean>` - Loading state indicator
- `totalCount: Ref<number>` - Total number of items (for pagination)
- `pages: ComputedRef<number>` - Total number of pages
- `currentPage: Ref<number>` - Current page number (1-indexed)
- `pageSize: Ref<number>` - Items per page
- `searchValue: Ref<string>` - Search keyword
- `sortExpression: Ref<string | undefined>` - Sort expression (e.g., "name:asc")
- `selectedItemId: Ref<string | undefined>` - ID of selected item
- `activeFilterCount: Ref<number>` - Number of active filters

### Methods
- `loadEntityList(params?)` - Load items with optional parameters
- `removeEntity(id)` - Delete an item by ID
- `reload()` - Reload the current list

## Usage in Blade

```vue
<script setup lang="ts">
import { useProductList } from "../composables";

const {
  items,
  loading,
  totalCount,
  pages,
  currentPage,
  searchValue,
  sortExpression,
  selectedItemId,
  loadProductList,
  reload,
  removeProduct,
} = useProductList();

onMounted(async () => {
  await loadProductList();
});
</script>
```

## Patterns to Follow

1. **Naming convention**: `use{EntityName}List`
2. **Return object**: Always return state and methods, not just values
3. **Loading state**: Always set loading to true before async operations
4. **Error handling**: Always catch and log errors
5. **Auto-reload**: Use `watch` to reload when search/sort/page changes
6. **TypeScript**: Define interfaces for entity and params
7. **API integration**: Separate API client logic from composable
8. **Computed properties**: Use computed for derived values (e.g., pages)
9. **Reactive refs**: All state should be refs or computed
10. **Export interface**: Export params interface for type safety

