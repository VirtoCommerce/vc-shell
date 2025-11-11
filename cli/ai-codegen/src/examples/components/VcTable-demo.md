# VcTable Demo

Real-world examples from vendor-portal application.

## Basic List with Empty/NotFound States

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
    :active-filter-count="activeFilterCount"
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
    <!-- Custom column template -->
    <template #item_status="{ item }">
      <OrderStatusTemplate :status="item.status" />
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ITableColumns } from "@vc-shell/framework";

const { t } = useI18n();

// Table data
const items = ref([]);
const totalCount = ref(0);
const pages = ref(0);
const currentPage = ref(1);
const selectedItemId = ref<string>();
const searchKeyword = ref<string>();
const sortExpression = ref("createdDate:DESC");
const activeFilterCount = ref(0);

// Empty and NotFound states (IMPORTANT: these are objects, not components!)
const empty = {
  icon: "material-shopping_cart",
  text: computed(() => t("ORDERS.PAGES.LIST.EMPTY.NO_ITEMS")),
};

const notfound = {
  icon: "material-shopping_cart",
  text: computed(() => t("ORDERS.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("ORDERS.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    // Reset search
    searchKeyword.value = "";
    await loadOrders({ keyword: "" });
  },
};

// Column configuration
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
  // Open details blade
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

const onSearchChange = debounce(async (keyword: string | undefined) => {
  searchKeyword.value = keyword;
  await loadOrders({ keyword, skip: 0 });
}, 1000);
</script>
```

## Table with Filters

```vue
<template>
  <VcTable
    :items="items"
    :columns="columns"
    :empty="empty"
    :notfound="notfound"
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
```

## Table with Multiselect and Actions

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
import { IActionBuilderResult } from "@vc-shell/framework";

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
</script>
```

## Editable Table

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
</script>
```

## Key Points

1. **Empty/NotFound** are objects with `icon`, `text` (computed), `action`, `clickHandler`
2. **Columns** support various types: `image`, `money`, `status`, `date-ago`, `status-icon`
3. **Custom templates** via `#item_{columnId}="{ item }"`
4. **Mobile positions** for responsive design: `image`, `top-left`, `top-right`, `bottom-left`, `status`
5. **state-key** for persisting table state
6. **Multiselect** with `selection-changed` and `select-all` events
7. **Editable** mode with `editing`, `rules`, and edit events
