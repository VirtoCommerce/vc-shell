<template>
  <VcBlade
    :title="$t('ORDERS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="30%"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <!-- Blade contents -->
    <VcTable
      class="tw-grow tw-basis-0"
      :expanded="expanded"
      :empty="empty"
      :loading="loading"
      :columns="tableColumns"
      :items="orders"
      :itemActionBuilder="actionBuilder"
      :totalCount="totalCount"
      :pages="pages"
      :sort="sort"
      :searchValue="searchValue"
      :activeFilterCount="activeFilterCount"
      :selectedItemId="selectedItemId"
      :currentPage="currentPage"
      @search:change="onSearchList"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      @headerClick="onHeaderClick"
      @selectionChanged="onSelectionChanged"
      state-key="orders_list"
    >
      <!-- Filters -->
      <template v-slot:filters="{ closePanel }">
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
                  class="tw-mb-2"
                  v-for="status in PaymentStatus"
                  :key="status"
                  :modelValue="filter?.status === status"
                  @update:modelValue="filter.status = $event ? status : undefined"
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
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="(e: string) => setFilterDate('startDate', e)"
                ></VcInput>
                <VcInput
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.END_DATE')"
                  type="date"
                  :modelValue="getFilterDate('endDate')"
                  @update:modelValue="(e: string) => setFilterDate('endDate', e)"
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
                  @click="resetFilters(closePanel)"
                  :disabled="applyFiltersReset"
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.RESET_FILTERS") }}</vc-button
                >
                <vc-button
                  @click="applyFilters(closePanel)"
                  :disabled="applyFiltersDisable"
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.APPLY") }}</vc-button
                >
              </div>
            </VcCol>
          </VcRow>
        </VcContainer>
      </template>

      <!-- Not found template -->
      <template v-slot:notfound>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("ORDERS.PAGES.LIST.NOT_FOUND.NO_ORDERS") }}
          </div>
          <vc-button @click="resetSearch">{{ $t("ORDERS.PAGES.LIST.NOT_FOUND.RESET") }}</vc-button>
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("ORDERS.PAGES.LIST.EMPTY") }}
          </div>
        </div>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <VcStatus v-bind="statusStyle(itemData.item.status as string)">
          {{ itemData.item.status }}
        </VcStatus>
      </template>

      <template v-slot:mobile-item="itemData">
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

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, shallowRef } from "vue";

export default defineComponent({
  url: "/orders",
});
</script>

<script lang="ts" setup>
import {
  IBladeEvent,
  IBladeToolbar,
  useFunctions,
  useI18n,
  ITableColumns,
  IActionBuilderResult,
} from "@vc-shell/framework";
import moment from "moment";
import { CustomerOrder } from "../../../api_client/orders";
import { useOrders } from "../composables";
import OrdersDetails from "./orders-edit.vue";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "open:blade", blade: IBladeEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();
const { orders, loadOrders, loading, pages, currentPage, totalCount, changeOrderStatus, PaymentStatus } = useOrders();
const { debounce } = useFunctions();
const { t } = useI18n();
const filter = ref<{ status: string }>({status: undefined});
const appliedFilter = ref({});
const searchValue = ref();
const selectedItemId = ref();
const selectedOrdersIds = ref([]);
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
  selectedItemId.value = props.param;
  await loadOrders();
});

watch(sort, async (value) => {
  await loadOrders({
    ...filter.value,
    keyword: searchValue.value,
    sort: value,
  });
});

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

const onItemClick = (item: { id: string }) => {
  emit("open:blade", {
    component: shallowRef(OrdersDetails),
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
  let result = [];

  if (item.status === "Paid" || item.status === "Unpaid") {
    result.push({
      icon: "fas fa-check",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.ACCEPT")),
      variant: "success",
      async clickHandler() {
        await changeOrderStatus({ orderId: item.id, newStatus: "Accepted" });
        await reload();
      },
    });
  }

  if (item.status !== "Cancelled") {
    result.push({
      icon: "fas fa-times",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.CANCEL")),
      variant: "danger",
      async clickHandler() {
        await changeOrderStatus({ orderId: item.id, newStatus: "Cancelled" });
        await reload();
      },
    });
  }

  if (item.status === "Accepted") {
    result.push({
      icon: "fas fa-shipping-fast",
      title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.SHIP")),
      variant: "danger",
      async clickHandler() {
        item.status = "Shipped";
        item.status = "Shipped";
        await changeOrderStatus({ orderId: item.id, newStatus: "Cancelled" });
        await reload();
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
}, 200);

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
  selectedOrdersIds.value = items.map((item) => item.id);
};





function setFilterDate(key: string, value: string) {
  const date = moment(value).toDate();
  if (date instanceof Date && !isNaN(date.valueOf())) {
    filter.value[key] = date;
  } else {
    filter.value[key] = undefined;
  }
}

function getFilterDate(key: string) {
  const date = filter.value && filter.value[key] as Date;
  if (date) {
    return moment(date).format("YYYY-MM-DD");
  }
  return undefined;
}

async function resetSearch() {
  searchValue.value = "";
  Object.keys(filter.value).forEach((key: string) => (filter.value[key] = undefined));
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
  Object.keys(filter.value).forEach((key: string) => (filter.value[key] = undefined));
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
