---
id: component-VcTable-demo
type: COMPONENT
complexity: SIMPLE
category: component
componentRole: table-container
bladeContext: ["list"]
tags: ["component","table","list","grid","data"]
title: "VcTable Demo"
description: "Primary container for displaying tabular data in list blades with sorting, filtering, and pagination"
---

# VcTable Demo

Real-world table examples.

**IMPORTANT**: VcTable has built-in search and filters in its header. No need for separate input components!

## Basic List with Search and Empty States (from orders-list.vue)

```vue
<template>
  <VcTable
    :total-label="$t('ORDERS.PAGES.LIST.TABLE.TOTALS')"
    :items="items"
    :selected-item-id="selectedItemId"
    :search-value="searchKeyword"
    :columns="columns"
    :sort="sortExpression"
    :pages="pages"
    :current-page="currentPage"
    :total-count="totalCount"
    :expanded="expanded"
    column-selector="defined"
    state-key="ORDERS"
    :multiselect="false"
    :empty="empty"
    :notfound="notfound"
    class="tw-grow tw-basis-0"
    @item-click="onItemClick"
    @header-click="onHeaderClick"
    @pagination-click="onPaginationClick"
    @search:change="onSearchChange"
  >
    <template #item_status="{ item }">
      <OrderStatusTemplate :status="item.status" />
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ITableColumns, useFunctions } from "@vc-shell/framework";

const { t } = useI18n();
const { debounce } = useFunctions();

const items = ref([]);
const totalCount = ref(0);
const pages = ref(0);
const currentPage = ref(1);
const selectedItemId = ref<string>();
const searchKeyword = ref<string>();
const sortExpression = ref("createdDate:DESC");

// Empty state
const empty = {
  icon: "material-shopping_cart",
  text: computed(() => t("ORDERS.PAGES.LIST.EMPTY.NO_ITEMS")),
};

// Not found state
const notfound = {
  icon: "material-shopping_cart",
  text: computed(() => t("ORDERS.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("ORDERS.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchKeyword.value = "";
    await loadOrders({ keyword: "" });
  },
};

// Columns configuration
const columns = computed((): ITableColumns[] => [
  {
    id: "lineItemsImg",
    title: t("ORDERS.PAGES.LIST.TABLE.HEADER.ITEMS_IMG"),
    width: "75px",
    alwaysVisible: true,
    type: "image",
    mobilePosition: "image",
  },
  {
    id: "number",
    title: t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER"),
    alwaysVisible: true,
    sortable: true,
    mobilePosition: "top-left",
  },
  {
    id: "total",
    title: t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL"),
    alwaysVisible: true,
    sortable: true,
    type: "money",
    mobilePosition: "top-right",
  },
  {
    id: "status",
    title: t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS"),
    alwaysVisible: true,
    sortable: true,
    type: "status",
    mobilePosition: "status",
  },
  {
    id: "createdDate",
    title: t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED"),
    sortable: true,
    type: "date-ago",
    mobilePosition: "bottom-right",
  },
]);

// Event handlers
async function onItemClick(item: any) {
  selectedItemId.value = item.id;
}

function onHeaderClick(column: ITableColumns) {
  if (column.sortable) {
    // Toggle sort direction
  }
}

async function onPaginationClick(page: number) {
  const skip = (page - 1) * 20;
  await loadOrders({ skip });
}

// Debounced search
const onSearchChange = debounce(async (keyword: string | undefined) => {
  searchKeyword.value = keyword;
  await loadOrders({ keyword, skip: 0 });
}, 1000);

async function loadOrders(params: any) {
  // Load orders from API
}
</script>
```

## Table with Filters (from orders-list.vue)

```vue
<template>
  <VcTable
    :items="items"
    :columns="columns"
    :active-filter-count="activeFilterCount"
    :search-value="searchKeyword"
    :empty="empty"
    :notfound="notfound"
    @search:change="onSearchChange"
  >
    <template #filters>
      <div class="tw-p-4">
        <VcRow class="tw-gap-16">
          <!-- Status Filter -->
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">
              {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.STATUS.TITLE") }}
            </h3>
            <div class="tw-space-y-2">
              <VcRadioButton
                v-for="status in statuses"
                :key="status.value"
                :model-value="stagedFilters.status[0] || ''"
                :value="status.value"
                :label="status.displayValue"
                @update:model-value="(value) => toggleStatusFilter(value)"
              />
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">
              {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.DATE.TITLE") }}
            </h3>
            <div class="tw-space-y-3">
              <VcInput
                v-model="stagedFilters.startDate"
                type="date"
                :label="$t('ORDERS.PAGES.LIST.TABLE.FILTER.DATE.START_DATE')"
                @update:model-value="(value) => toggleFilter('startDate', String(value || ''), true)"
              />
              <VcInput
                v-model="stagedFilters.endDate"
                type="date"
                :label="$t('ORDERS.PAGES.LIST.TABLE.FILTER.DATE.END_DATE')"
                @update:model-value="(value) => toggleFilter('endDate', String(value || ''), true)"
              />
            </div>
          </div>
        </VcRow>

        <!-- Filter Controls -->
        <div class="tw-flex tw-gap-2 tw-mt-4">
          <VcButton
            variant="primary"
            :disabled="!hasFilterChanges"
            @click="applyFilters"
          >
            {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.APPLY") }}
          </VcButton>

          <VcButton
            variant="secondary"
            :disabled="!hasFiltersApplied"
            @click="resetFilters"
          >
            {{ $t("ORDERS.PAGES.LIST.TABLE.FILTER.RESET") }}
          </VcButton>
        </div>
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcRow, VcInput, VcRadioButton, VcButton } from "@vc-shell/framework";

// Staged filters (user's current selections)
const stagedFilters = ref({ status: [], startDate: undefined, endDate: undefined });

// Applied filters (actually used for data fetching)
const appliedFilters = ref({ status: [], startDate: undefined, endDate: undefined });

const hasFilterChanges = computed(() => {
  return JSON.stringify(stagedFilters.value) !== JSON.stringify(appliedFilters.value);
});

const hasFiltersApplied = computed(() => {
  return appliedFilters.value.status.length > 0 
    || !!appliedFilters.value.startDate 
    || !!appliedFilters.value.endDate;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (appliedFilters.value.status.length > 0) count++;
  if (appliedFilters.value.startDate) count++;
  if (appliedFilters.value.endDate) count++;
  return count;
});

function toggleFilter(filterType: string, value: string, replace = false) {
  if (replace) {
    stagedFilters.value[filterType] = value;
  }
}

function toggleStatusFilter(value: string) {
  stagedFilters.value.status = [value];
}

async function applyFilters() {
  appliedFilters.value = JSON.parse(JSON.stringify(stagedFilters.value));
  await loadOrders({ ...appliedFilters.value, skip: 0 });
}

async function resetFilters() {
  const empty = { status: [], startDate: undefined, endDate: undefined };
  stagedFilters.value = empty;
  appliedFilters.value = empty;
  await loadOrders({ skip: 0 });
}
</script>
```

## Table with Multiselect and Actions (from offers-list.vue)

```vue
<template>
  <VcTable
    :loading="loading"
    :columns="columns"
    :items="offers"
    :empty="empty"
    :notfound="notfound"
    multiselect
    enable-item-actions
    :item-action-builder="actionBuilder"
    select-all
    state-key="offers_list"
    @selection-changed="onSelectionChanged"
    @select:all="selectAllOffers"
  >
    <template #item_name="itemData">
      <div class="tw-truncate">
        {{ itemData.item.name }}
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { IActionBuilderResult, VcTable } from "@vc-shell/framework";

const offers = ref([]);
const selectedOfferIds = ref<string[]>([]);

function onSelectionChanged(items: any[]) {
  selectedOfferIds.value = items.flatMap((item) => (item.id ? [item.id] : []));
}

const actionBuilder = (): IActionBuilderResult[] => {
  return [
    {
      icon: "material-delete",
      title: "Delete",
      type: "danger",
      async clickHandler(item: any) {
        if (item.id && !selectedOfferIds.value.includes(item.id)) {
          selectedOfferIds.value.push(item.id);
        }
        await removeOffers();
        selectedOfferIds.value = [];
      },
    },
  ];
};

async function selectAllOffers() {
  // Select all offers logic
}

async function removeOffers() {
  // Remove offers logic
}
</script>
```

## Editable Table (from order-details.vue)

```vue
<template>
  <VcTable
    :items="item.items"
    :columns="itemsColumns"
    expanded
    :editing="!disabled"
    :header="false"
    :footer="false"
    state-key="order-details-items"
    @item-click="onItemClick"
    @on-cell-blur="onCellBlur"
    @on-edit-complete="onEditComplete"
  >
    <template #item_name="{ item: lineItem }">
      <OrderGridName :sku="lineItem.sku" :name="lineItem.name" />
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ITableColumns, VcTable } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const itemsColumns = computed((): ITableColumns[] => [
  {
    id: "imageUrl",
    title: t("ORDERS.PAGES.DETAILS.FORM.TABLE.PIC"),
    width: "60px",
    type: "image",
  },
  {
    id: "name",
    title: t("ORDERS.PAGES.DETAILS.FORM.TABLE.NAME"),
  },
  {
    id: "quantity",
    title: t("ORDERS.PAGES.DETAILS.FORM.TABLE.QUANTITY"),
    editable: true,
    rules: {
      min_value: 0,
    },
    type: "number",
  },
  {
    id: "price",
    title: t("ORDERS.PAGES.DETAILS.FORM.TABLE.UNIT_PRICE"),
    editable: true,
    rules: {
      min_value: 0,
    },
    type: "money",
  },
]);

function onEditComplete(args: {
  event: { field: string; value: string | number };
  index: number;
}) {
  item.value.items[args.index][args.event.field] = args.event.value;
}

function onCellBlur() {
  calculateTotals();
}

function calculateTotals() {
  // Calculate order totals
}
</script>
```

## Table Without Search/Header

```vue
<template>
  <!-- Disable header to hide search -->
  <VcTable
    :items="items"
    :columns="columns"
    :header="false"
    :footer="false"
    expanded
    state-key="compact-table"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable } from "@vc-shell/framework";

const items = ref([
  { id: "1", name: "Item 1", quantity: 10 },
  { id: "2", name: "Item 2", quantity: 5 },
]);

const columns = ref([
  { id: "name", title: "Name" },
  { id: "quantity", title: "Quantity" },
]);
</script>
```

## Key Points

### Built-in Search
- **Header prop** - Controls search visibility (default: `true`)
- **Search value** - Use `:search-value` for controlled search
- **Search event** - Use `@search:change` with debounce (1000ms recommended)
- **Disable search** - Set `:header="false"` to hide search

### Built-in Filters
- **Filters slot** - Use `#filters` slot to show filter button
- **Active count** - Use `:active-filter-count` to display badge
- **Pattern** - Use staged/applied filters for better UX
- **Reset** - Always reset to page 0 when applying filters

### Column Types
- `image` - Display images
- `money` - Format as currency
- `status` - Status badges
- `date-ago` - Relative time
- `status-icon` - Icon with status
- `number` - Numeric values

### Mobile Positions
- `image` - Top-left image
- `top-left` - Primary text
- `top-right` - Secondary text (e.g., price)
- `bottom-left` - Tertiary text
- `bottom-right` - Date/time
- `status` - Status badge

### States
- **Empty** - Object with `icon`, `text`, optional `action`/`clickHandler`
- **NotFound** - Same as empty, shown when search returns no results
- **Loading** - Use `:loading` prop during data fetch

### Props
- `:items` - Array of data
- `:columns` - Column configuration
- `:search-value` - Current search term
- `:active-filter-count` - Number of active filters
- `:sort` - Sort expression (e.g., "name:ASC")
- `:pages` - Total pages
- `:current-page` - Current page number
- `:total-count` - Total items
- `:selected-item-id` - Selected row ID
- `state-key` - Key for persisting table state
- `:header` - Show/hide header (default: `true`)
- `:footer` - Show/hide footer
- `expanded` - Expanded layout
- `multiselect` - Enable row selection
- `enable-item-actions` - Show row actions

### Events
- `@item-click` - Row clicked
- `@header-click` - Column header clicked (for sorting)
- `@pagination-click` - Page changed
- `@search:change` - Search value changed
- `@selection-changed` - Selected rows changed
- `@on-edit-complete` - Cell edit complete (editable mode)

### Slots
- `#filters` - Filter UI (makes filter button visible)
- `#item_{columnId}` - Custom cell template
- `#empty` - Custom empty state
- `#notfound` - Custom not found state
- `#mobile-item` - Custom mobile row template

## Common Patterns

### Basic List with Search
```vue
<VcTable
  :items="items"
  :columns="columns"
  :search-value="searchValue"
  @search:change="debounce((k) => loadItems({ keyword: k }), 1000)"
/>
```

### With Filters
```vue
<VcTable
  :items="items"
  :columns="columns"
  :active-filter-count="activeFilterCount"
>
  <template #filters>
    <!-- Filter UI here -->
  </template>
</VcTable>
```

### Sortable Columns
```vue
<VcTable
  :columns="columns"
  :sort="sortExpression"
  @header-click="(col) => {
    if (col.sortable) toggleSort(col.id);
  }"
/>
```

### With Empty/NotFound States
```vue
<VcTable
  :empty="{
    icon: 'material-list',
    text: t('NO_ITEMS'),
  }"
  :notfound="{
    icon: 'material-search',
    text: t('NOT_FOUND'),
    action: t('RESET'),
    clickHandler: () => resetSearch(),
  }"
/>
```

### Custom Cell Template
```vue
<VcTable :items="items" :columns="columns">
  <template #item_status="{ item }">
    <VcBadge :content="item.status" :variant="getVariant(item.status)" />
  </template>
</VcTable>
```
