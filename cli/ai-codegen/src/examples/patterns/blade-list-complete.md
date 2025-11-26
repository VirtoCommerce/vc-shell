---
id: blade-list-complete
type: PATTERN
complexity: MODERATE
category: blade
tags: ["blade", "list", "VcTable", "workspace"]
title: "Complete List Blade Pattern"
description: "Full working example of list blade with VcTable, search, pagination, sorting"
bladeContext: ["list"]
---

# Complete List Blade Pattern

This document describes the authoritative pattern for list blades in VC-Shell.

## Authoritative Reference

**The single source of truth is:** `reference/blade-list.vue`

See [reference/blade-list.vue](../reference/blade-list.vue) for the complete, production-ready implementation.

## Use Cases

- Product list
- Order list
- Customer list
- Any entity list view

## Key Features

- VcTable with columns and sorting
- Built-in search (controlled by `header` prop)
- Built-in filters via `#filters` slot
- Pagination with page navigation
- Empty and not-found states
- Mobile-responsive view
- Toolbar with Add and Refresh actions
- Opens details blade on item click

## Architecture

```
list-blade.vue
├── Uses: composable-list.ts (data management)
├── Uses: useBladeNavigation (open details)
├── Uses: useTableSort (column sorting)
├── Uses: useFunctions.debounce (search)
└── Opens: details-blade.vue (on item click)
```

## Critical Patterns

### 1. defineOptions for Workspace Blade

```typescript
defineOptions({
  name: "ProductList",
  url: "/products",
  isWorkspace: true,
  menuItem: {
    title: "PRODUCTS.MENU.TITLE",
    icon: "material-inventory",
    priority: 10,
  },
  // ⚠️ DO NOT add permissions unless explicitly requested!
});
```

### 2. useTableSort for Column Sorting

```typescript
const { sortExpression, handleSortChange } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

function onHeaderClick(item: ITableColumns) {
  handleSortChange(item.id);
}
```

### 3. Blade Navigation (NO markRaw!)

```typescript
// ✅ CORRECT - Direct component reference
import ProductDetails from "./product-details.vue";

openBlade({
  blade: markRaw(ProductDetails),
  param: item.id,
});
```

### 4. Debounced Search

```typescript
const { debounce } = useFunctions();

const onSearchList = debounce(async (keyword: string | undefined) => {
  searchValue.value = keyword;
  await loadProducts({ ...searchQuery.value, keyword, skip: 0 });
}, 1000);
```

### 5. VcTable Required Props

```vue
<!-- @vue-generic {IProduct} -->
<VcTable
  :loading="loading"
  :expanded="expanded"
  :columns="columns"
  :items="items"
  :sort="sortExpression"
  :pages="pages"
  :current-page="currentPage"
  :total-count="totalCount"
  :selected-item-id="selectedItemId"
  :search-value="searchValue"
  :empty="empty"
  :notfound="notfound"
  state-key="PRODUCTS_LIST"
  @header-click="onHeaderClick"
  @item-click="onItemClick"
  @pagination-click="onPaginationClick"
  @search:change="onSearchList"
/>
```

## Required Composable Interface

List blade expects composable to return:

```typescript
interface IUseProductList {
  items: ComputedRef<IProduct[]>;
  totalCount: ComputedRef<number>;
  pages: ComputedRef<number>;
  currentPage: ComputedRef<number>;
  loading: ComputedRef<boolean>;
  searchQuery: Ref<IProductSearchQuery>;
  loadProducts: (query?: IProductSearchQuery) => Promise<void>;
}
```

## Required i18n Keys

```json
{
  "PRODUCTS": {
    "MENU": { "TITLE": "Products" },
    "PAGES": {
      "LIST": {
        "TITLE": "Products",
        "SEARCH": { "PLACEHOLDER": "Search products..." },
        "TABLE": {
          "HEADER": {
            "NAME": "Name",
            "SKU": "SKU",
            "PRICE": "Price",
            "STATUS": "Status",
            "CREATED": "Created"
          }
        },
        "TOOLBAR": {
          "REFRESH": "Refresh",
          "ADD": "Add Product"
        },
        "EMPTY": {
          "NO_ITEMS": "No products yet",
          "ADD": "Add your first product"
        },
        "NOT_FOUND": {
          "EMPTY": "No products found",
          "RESET": "Reset Search"
        }
      }
    }
  }
}
```

## Related Patterns

- [composable-list-complete.md](./composable-list-complete.md) - Data management
- [blade-details-complete.md](./blade-details-complete.md) - Details blade opened from list
- [list-patterns.md](./list-patterns.md) - Additional list patterns
