<!--
  @file Reference List Blade
  @description SINGLE SOURCE OF TRUTH for list blade pattern
  @version 2.0.0
  @lastUpdated 2025-11-26

  This is the authoritative example for list blades in VC-Shell.
  All list blades should follow this pattern exactly.

  KEY PATTERNS:
  1. VcBlade with toolbar-items
  2. VcTable with all required props
  3. useBladeNavigation for opening details
  4. useTableSort for column sorting
  5. useFunctions.debounce for search
  6. defineOptions with isWorkspace + menuItem
  7. Direct component reference (NO markRaw!)
-->

<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- @vue-generic {IProduct} -->
    <VcTable
      class="tw-grow tw-basis-0"
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
      :search-placeholder="$t('PRODUCTS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      state-key="PRODUCTS_LIST"
      :empty="empty"
      :notfound="notfound"
      @header-click="onHeaderClick"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchList"
      @scroll:ptr="reload"
    >
      <!-- Custom column slots -->
      <template #item_status="{ item }">
        <VcStatus :outline="false">
          <VcStatusIcon
            :icon-variant="item.isActive ? 'success' : 'danger'"
          />
          {{ item.isActive ? $t('COMMON.STATUS.ACTIVE') : $t('COMMON.STATUS.INACTIVE') }}
        </VcStatus>
      </template>

      <template #item_price="{ item }">
        {{ formatCurrency(item.price) }}
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  IBladeToolbar,
  IParentCallArgs,
  ITableColumns,
  useBladeNavigation,
  useTableSort,
  useFunctions,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

// Import composable from same module
import { useProductList } from "../composables/useProductList";
// Import details blade component
import ProductDetails from "./product-details.vue";
// Import types from API client
import type { IProduct } from "../api_client/products.api";

// =============================================================================
// COMPONENT OPTIONS - defineOptions for workspace blade
// =============================================================================

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
  // permissions: ["products:read"],  // Only if user asks for permissions
});

// =============================================================================
// PROPS & EMITS
// =============================================================================

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "parent:call", args: IParentCallArgs): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

// =============================================================================
// COMPOSABLES
// =============================================================================

const { openBlade } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });
const { debounce } = useFunctions();

// Use composable for data
const {
  loadProducts,
  searchQuery,
  loading,
  items,
  currentPage,
  pages,
  totalCount,
} = useProductList();

// Table sorting
const { sortExpression, handleSortChange: tableSortHandler } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

// =============================================================================
// LOCAL STATE
// =============================================================================

const selectedItemId = ref<string>();
const searchValue = ref<string>();

// Computed title
const title = computed(() => t("PRODUCTS.PAGES.LIST.TITLE"));

// =============================================================================
// EMPTY & NOT FOUND STATES
// =============================================================================

const empty = {
  icon: "material-inventory",
  text: computed(() => t("PRODUCTS.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("PRODUCTS.PAGES.LIST.EMPTY.ADD")),
  clickHandler: onAddProduct,
};

const notfound = {
  icon: "material-search",
  text: computed(() => t("PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("PRODUCTS.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchValue.value = "";
    await loadProducts({ ...searchQuery.value, keyword: "", skip: 0 });
  },
};

// =============================================================================
// TOOLBAR
// =============================================================================

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler: onAddProduct,
  },
]);

// =============================================================================
// TABLE COLUMNS
// =============================================================================

const columns = ref<ITableColumns[]>([
  {
    id: "name",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.NAME")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "sku",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.SKU")),
    sortable: true,
  },
  {
    id: "price",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.PRICE")),
    sortable: true,
    align: "right",
  },
  {
    id: "status",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.STATUS")),
  },
  {
    id: "createdDate",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TABLE.HEADER.CREATED")),
    sortable: true,
    type: "date-ago",
  },
]);

// =============================================================================
// WATCHERS
// =============================================================================

// Watch sort changes
watch(sortExpression, async (value) => {
  await loadProducts({ ...searchQuery.value, sort: value });
});

// Sync selected item with param
watch(
  () => props.param,
  () => {
    selectedItemId.value = props.param;
  },
  { immediate: true }
);

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(async () => {
  await reload();
});

// =============================================================================
// METHODS
// =============================================================================

async function reload() {
  await loadProducts({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
}

function onHeaderClick(item: ITableColumns) {
  tableSortHandler(item.id);
}

async function onPaginationClick(page: number) {
  await loadProducts({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
}

function onItemClick(item: IProduct) {
  openBlade({
    // ✅ Direct component reference - NO markRaw needed!
    blade: ProductDetails,
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

function onAddProduct() {
  openBlade({
    // ✅ Direct component reference - NO markRaw needed!
    blade: ProductDetails,
  });
}

// Debounced search handler
const onSearchList = debounce(async (keyword: string | undefined) => {
  searchValue.value = keyword;
  await loadProducts({
    ...searchQuery.value,
    keyword,
    skip: 0,
  });
}, 1000);

// =============================================================================
// UTILITIES
// =============================================================================

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

// =============================================================================
// EXPOSE
// =============================================================================

defineExpose({
  reload,
  title,
});
</script>
