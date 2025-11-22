---
id: null
type: null
complexity: SIMPLE
---

# Blade List Pattern (Grid Layout)

This pattern is used for displaying a list/table of items with search, sorting, pagination, and CRUD operations.

## Use Case
- Product list
- Order list
- Vendor list
- Any entity list view

## Key Features
- VcTable with columns and sorting
- **Built-in search field in table header** (controlled by `header` prop, default `true`)
- **Built-in filters** via `#filters` slot (button appears when slot is provided)
- No need for separate VcInput component for search
- To disable search, set `:header="false"` on VcTable
- Active filter count badge via `:active-filter-count` prop
- Pagination
- Empty and not-found states
- Mobile-responsive view
- Toolbar with Add and Refresh actions
- Opens details blade on item click

## Complete Example

### ProductList.vue

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="bladeTitle"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      :total-label="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :items="items"
      :selected-item-id="selectedItemId"
      :search-value="searchValue"
      :columns="tableColumns"
      :sort="sortExpression"
      :pages="pages"
      :current-page="currentPage"
      :total-count="totalCount"
      :expanded="expanded"
      :active-filter-count="activeFilterCount"
      :empty="empty"
      :notfound="notfound"
      state-key="products_list"
      :multiselect="false"
      class="tw-grow tw-basis-0"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchList"
      @scroll:ptr="reload"
    >
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  IBladeToolbar,
  IParentCallArgs,
  useBladeNavigation,
} from "@vc-shell/framework";
import { useProductList } from "../composables";
import moment from "moment";

// Import your types
// import { IProduct } from "@/api/products";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

// Define blade metadata
defineOptions({
  name: "ProductList",
  url: "/products",
  isWorkspace: true,
  menuItem: {
    id: "products",
    title: "PRODUCTS.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  },
});

const { t } = useI18n({ useScope: "global" });
const { openBlade } = useBladeNavigation();

// Use the list composable
const {
  items,
  loading,
  totalCount,
  pages,
  currentPage,
  searchValue,
  sortExpression,
  selectedItemId,
  activeFilterCount,
  loadProductList,
  reload,
  removeProduct,
} = useProductList();

const bladeTitle = computed(() => t("PRODUCTS.PAGES.LIST.TITLE"));

// Empty and Not Found state configurations
const empty = {
  icon: "material-list",
  text: computed(() => t("PRODUCTS.PAGES.LIST.EMPTY.NO_ITEMS")),
};

const notfound = {
  icon: "material-search",
  text: computed(() => t("PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("PRODUCTS.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    onSearchList("");
  },
};

const tableColumns = computed(() => [
  {
    id: "name",
    title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME"),
    width: "auto",
    sortable: true,
  },
  {
    id: "sku",
    title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.SKU"),
    width: "150px",
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED_DATE"),
    width: "180px",
    sortable: true,
    type: "date-ago",
  },
]);

const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "refresh",
    title: t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH"),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD"),
    icon: "material-add",
    clickHandler() {
      addItem();
    },
  },
]);

function onItemClick(item: { id: string }) {
  openBlade({
    blade: { name: "ProductDetails" }, // ✅ Use registered name (recommended)
    // OR: blade: ProductDetails, // ✅ Direct component reference also works
    param: item.id,
    options: {
      product: item,
    },
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

function onHeaderClick(item: { id: string }) {
  const sortOrder = sortExpression.value?.startsWith(item.id + ":desc") ? "asc" : "desc";
  sortExpression.value = `${item.id}:${sortOrder}`;
}

function onPaginationClick(page: number) {
  currentPage.value = page;
}

function onSearchList(keyword: string) {
  searchValue.value = keyword;
}

function addItem() {
  openBlade({
    blade: { name: "ProductDetails" },
  });
}

function createdDate(date: string) {
  return moment(date).format("L LT");
}

onMounted(async () => {
  await loadProductList();
});

defineExpose({
  reload,
  title: bladeTitle,
});
</script>
```

## Required i18n Keys

```json
{
  "PRODUCTS": {
    "MENU": {
      "TITLE": "Products"
    },
    "PAGES": {
      "LIST": {
        "TITLE": "Products",
        "TABLE": {
          "TOTALS": "{{count}} products",
          "HEADER": {
            "NAME": "Name",
            "SKU": "SKU",
            "CREATED_DATE": "Created"
          }
        },
        "TOOLBAR": {
          "REFRESH": "Refresh",
          "ADD": "Add Product"
        },
        "EMPTY": {
          "NO_ITEMS": "No products yet"
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

## Patterns to Follow

1. **Use composable for data management**: All data operations in `useEntityList()`
2. **i18n for all strings**: Never hardcode strings
3. **Empty and NotFound states**: Define as objects with icon, text, action, clickHandler
4. **Computed properties**: For derived state (columns, bladeTitle, toolbar)
5. **Toolbar actions**: Use `bladeToolbar` computed property
6. **Mobile view**: Always provide `mobile-item` slot
7. **Blade metadata**: Use `defineOptions` for name, url, isWorkspace, menuItem
8. **TypeScript**: Properly type Props, Emits, and data

