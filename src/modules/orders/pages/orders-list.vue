<template>
  <VcBlade
    :title="$t('ORDERS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="30%"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <VcTable
      class="tw-grow tw-basis-0"
      :expanded="expanded"
      :empty="empty"
      :loading="loading"
      :columns="tableColumns"
      :items="orders"
      :item-action-builder="actionBuilder"
      :total-count="totalCount"
      :pages="pages"
      :sort="sort"
      :search-value="searchValue"
      :active-filter-count="activeFilterCount"
      :selected-item-id="selectedItemId"
      :current-page="currentPage"
      :pull-to-reload="true"
      state-key="orders_list"
      @search:change="onSearchList"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
      @header-click="onHeaderClick"
      @selection-changed="onSelectionChanged"
    >
      <!-- Filters -->
      <template #filters="{ closePanel }">
        <h2
          v-if="$isMobile.value"
          class="tw-my-4 tw-text-[19px] tw-font-bold"
        >
          {{ $t("ORDERS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <VcContainer no-padding>
          <VcRow>
            <VcCol class="filter-col tw-p-2">
              <div class="tw-mb-4 tw-text-[#a1c0d4] tw-font-bold tw-text-[17px]">
                {{ $t("ORDERS.PAGES.LIST.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <VcCheckbox
                  v-for="status in PaymentStatus"
                  :key="status"
                  class="tw-mb-2"
                  :model-value="filter?.status === status"
                  @update:model-value="filter.status = $event ? status : undefined"
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS." + status.toUpperCase()) }}
                </VcCheckbox>
              </div>
            </VcCol>
            <VcCol class="tw-p-2">
              <div class="tw-mb-4 tw-text-[#a1c0d4] tw-font-bold tw-text-[17px]">
                {{ $t("ORDERS.PAGES.LIST.FILTERS.ORDER_DATE") }}
              </div>
              <div>
                <VcInput
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.START_DATE')"
                  type="date"
                  class="tw-mb-3"
                  :model-value="getFilterDate('startDate')"
                  @update:model-value="(e) => setFilterDate('startDate', e as string)"
                ></VcInput>
                <VcInput
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.END_DATE')"
                  type="date"
                  :model-value="getFilterDate('endDate')"
                  @update:model-value="(e) => setFilterDate('endDate', e as string)"
                ></VcInput>
              </div>
            </VcCol>
          </VcRow>
          <VcRow>
            <VcCol class="tw-p-2">
              <div class="tw-flex tw-justify-end">
                <vc-button
                  outline
                  class="tw-mr-4"
                  :disabled="applyFiltersReset"
                  @click="resetFilters(closePanel)"
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.RESET_FILTERS") }}</vc-button
                >
                <vc-button
                  :disabled="applyFiltersDisable"
                  @click="applyFilters(closePanel)"
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.APPLY") }}</vc-button
                >
              </div>
            </VcCol>
          </VcRow>
        </VcContainer>
      </template>

      <!-- Not found template -->
      <template #notfound>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("ORDERS.PAGES.LIST.NOT_FOUND.NO_ORDERS") }}
          </div>
          <vc-button @click="resetSearch">{{ $t("ORDERS.PAGES.LIST.NOT_FOUND.RESET") }}</vc-button>
        </div>
      </template>

      <!-- Empty template -->
      <template #empty>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("ORDERS.PAGES.LIST.EMPTY") }}
          </div>
        </div>
      </template>

      <!-- Override status column template -->
      <template #item_status="itemData">
        <VcStatus v-bind="statusStyle(itemData.item.status as string)">
          {{ itemData.item.status }}
        </VcStatus>
      </template>

      <template #mobile-item="itemData">
        <div class="tw-p-3">
          <div class="tw-w-full tw-flex tw-justify-evenly">
            <div class="tw-grow tw-basis-0">
              <div class="tw-font-bold tw-text-lg">
                {{ itemData.item.number }}
              </div>
              <VcHint class="tw-mt-1">{{ itemData.item.customerName }}</VcHint>
            </div>
            <div>
              <VcStatus v-bind="statusStyle(itemData.item.status as string)">
                {{ itemData.item.status }}
              </VcStatus>
            </div>
          </div>
          <div>
            <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <VcHint>{{ $t("ORDERS.PAGES.LIST.STATUS.TOTAL") }}</VcHint>
                <div class="tw-truncate tw-mt-1">{{ itemData.item.total }} {{ itemData.item.currency }}</div>
              </div>
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <VcHint>{{ $t("ORDERS.PAGES.LIST.STATUS.CREATED") }}</VcHint>
                <div class="tw-truncate tw-mt-1">
                  {{ itemData.item.createdDate && moment(itemData.item.createdDate).fromNow() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch, Ref } from "vue";
import {
  IBladeToolbar,
  useFunctions,
  ITableColumns,
  IActionBuilderResult,
  useBladeNavigation,
} from "@vc-shell/framework";
import moment from "moment";
import { CustomerOrder } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useOrders } from "../composables";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

defineOptions({
  url: "/orders",
  name: "OrdersList",
  isWorkspace: true,
  menuItem: {
    icon: "fas fa-shopping-cart",
    title: "ORDERS.MENU.TITLE",
    priority: 1,
  },
});

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { orders, loadOrders, loading, pages, currentPage, totalCount, changeOrderStatus, PaymentStatus } = useOrders();
const { debounce } = useFunctions();
const { t } = useI18n({ useScope: "global" });
const filter: Ref<{ startDate?: Date; endDate?: Date; status?: string }> = ref({
  startDate: undefined,
  endDate: undefined,
  status: undefined,
});
const appliedFilter = ref({});
const searchValue = ref();
const selectedItemId = ref();
const selectedOrdersIds = ref<string[]>([]);
const sort = ref("createdDate:DESC");
const applyFiltersDisable = computed(() => {
  const activeFilters = filter.value && Object.values(filter.value).filter((x) => x !== undefined);
  return !(activeFilters && activeFilters.length);
});
const applyFiltersReset = computed(() => {
  const activeFilters = Object.values(appliedFilter.value).filter((x) => x !== undefined);
  return !activeFilters.length;
});

onMounted(async () => {
  await loadOrders();
});

watch(sort, async (value) => {
  await loadOrders({
    ...filter.value,
    keyword: searchValue.value,
    sort: value,
  });
});

watch(
  () => props.param,
  async (newVal) => {
    if (newVal) {
      await openBlade({
        blade: resolveBladeByName("OrderEdit"),
        param: newVal,
        onOpen() {
          selectedItemId.value = newVal;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
      });
    }
  },
  { immediate: true },
);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CONFIRM")),
    icon: "fas fa-check",
    disabled: computed(() => !selectedOrdersIds.value?.length),
    isVisible: false,
  },
  {
    title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CANCEL")),
    icon: "fas fa-times-circle",
    disabled: computed(() => !selectedOrdersIds.value?.length),
    isVisible: false,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "number",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER")),
    width: 160,
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "customerName",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER")),
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "total",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL")),
    width: 120,
    alwaysVisible: true,
    sortable: true,
    type: "money",
  },
  {
    id: "status",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS")),
    width: 120,
    alwaysVisible: true,
    sortable: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED")),
    sortable: true,
    width: 180,
    type: "date-ago",
  },
]);

const empty = reactive({
  image: emptyImage,
  text: computed(() => t("ORDERS.PAGES.EMPTY")),
});

const title = computed(() => t("ORDERS.PAGES.LIST.TITLE"));

const onItemClick = (item: CustomerOrder) => {
  openBlade({
    blade: resolveBladeByName("OrderEdit"),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const statusStyle = (status: string) => {
  const result: {
    outline: boolean;
    variant: "success" | "danger" | "info";
  } = {
    outline: true,
    variant: "info",
  };

  switch (status) {
    case "Published":
      result.outline = false;
      result.variant = "success";
      break;
    case "New":
      result.outline = false;
      result.variant = "success";
      break;
    case "Cancelled":
      result.outline = true;
      result.variant = "danger";
      break;
    case "Shipped":
      result.outline = true;
      result.variant = "success";
  }
  return result;
};

const onPaginationClick = async (page: number) => {
  await loadOrders({
    skip: (page - 1) * 20,
  });
};

const actionBuilder = (item: CustomerOrder): IActionBuilderResult[] => {
  const result = [];

  if (item.status === "Paid" || item.status === "Unpaid") {
    result.push({
      icon: "fas fa-check",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.ACCEPT")),
      variant: "success",
      async clickHandler() {
        if (item.id) {
          await changeOrderStatus({ orderId: item.id, newStatus: "Accepted" });
          await reload();
        }
      },
    });
  }

  if (item.status !== "Cancelled") {
    result.push({
      icon: "fas fa-times",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.CANCEL")),
      variant: "danger",
      async clickHandler() {
        if (item.id) {
          await changeOrderStatus({ orderId: item.id, newStatus: "Cancelled" });
          await reload();
        }
      },
    });
  }

  if (item.status === "Accepted") {
    result.push({
      icon: "fas fa-shipping-fast",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.SHIP")),
      variant: "danger",
      async clickHandler() {
        if (item.id) {
          item.status = "Shipped";
          await changeOrderStatus({ orderId: item.id, newStatus: "Cancelled" });
          await reload();
        }
      },
    });
  }

  return result;
};

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadOrders({
    ...filter.value,
    keyword,
  });
}, 1000);

const reload = async () => {
  await loadOrders({
    ...filter.value,
    keyword: searchValue.value,
  });
};

const onHeaderClick = (item: ITableColumns) => {
  const sortOptions = ["DESC", "ASC", ""];

  if (item.sortable) {
    if (sort.value.split(":")[0] === item.id) {
      const index = sortOptions.findIndex((x) => {
        const sorting = sort.value.split(":")[1];
        if (sorting) {
          return x === sorting;
        } else {
          return x === "";
        }
      });

      if (index !== -1) {
        const newSort = sortOptions[(index + 1) % sortOptions.length];

        if (newSort === "") {
          sort.value = `${item.id}`;
        } else {
          sort.value = `${item.id}:${newSort}`;
        }
      }
    } else {
      sort.value = `${item.id}:${sortOptions[0]}`;
    }
  }
};

const onSelectionChanged = (items: CustomerOrder[]) => {
  selectedOrdersIds.value = items.map((item) => item.id!);
};

function setFilterDate(key: keyof typeof filter.value, value: string) {
  const date = moment(value).toDate();
  if (date instanceof Date && !isNaN(date.valueOf()) && key !== "status") {
    filter.value[key] = date;
  } else {
    filter.value[key] = undefined;
  }
}

function getFilterDate(key: keyof Omit<typeof filter.value, "status">) {
  const date = filter.value && filter.value[key];
  if (date) {
    return moment(date).format("YYYY-MM-DD");
  }
  return undefined;
}

async function resetSearch() {
  searchValue.value = "";
  Object.keys(filter.value).forEach((key) => (filter.value[key as keyof typeof filter.value] = undefined));
  await loadOrders({
    ...filter.value,
    keyword: "",
  });
  appliedFilter.value = {};
}
const activeFilterCount = computed(() => Object.values(appliedFilter.value).filter((item) => !!item).length);
async function applyFilters(closePanel: () => void) {
  closePanel();
  await loadOrders({
    ...filter.value,
  });
  appliedFilter.value = {
    ...filter.value,
  };
}
async function resetFilters(closePanel: () => void) {
  closePanel();
  Object.keys(filter.value).forEach((key) => (filter.value[key as keyof typeof filter.value] = undefined));
  await loadOrders({
    ...filter.value,
  });
  appliedFilter.value = {};
}

defineExpose({
  title,
  reload,
});
</script>
