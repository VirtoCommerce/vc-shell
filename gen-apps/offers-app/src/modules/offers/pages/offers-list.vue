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
    <!-- @vue-generic {IOffer} -->
    <VcTable
      :loading="loading"
      :expanded="expanded"
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      multiselect
      :columns="tableColumns"
      :items="items"
      enable-item-actions
      :item-action-builder="actionBuilder"
      :sort="sortExpression"
      :pages="pages"
      :current-page="currentPage"
      :search-value="searchValue"
      :search-placeholder="$t('OFFERS.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('OFFERS.PAGES.LIST.TABLE.TOTALS')"
      :total-count="totalCount"
      :selected-item-id="selectedItemId"
      :active-filter-count="activeFilterCount"
      select-all
      state-key="offers_list"
      @search:change="onSearchList"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
      @selection-changed="onSelectionChanged"
      @select:all="selectAllOffers"
    >
      <template #filters>
        <div class="tw-p-4">
          <VcRow class="tw-gap-16">
            <!-- Status Filter -->
            <div class="tw-flex tw-flex-col">
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("OFFERS.PAGES.LIST.TABLE.FILTER.STATUS.TITLE") }}
              </h3>
              <div class="tw-space-y-2">
                <VcRadioButton
                  v-for="status in statuses"
                  :key="status.value"
                  :model-value="stagedFilters.status[0] || ''"
                  :value="status.value"
                  :label="status.displayValue"
                  @update:model-value="(value) => toggleFilter('status', String(value), true)"
                />
              </div>
            </div>

            <!-- Date Range Filter -->
            <div class="tw-flex tw-flex-col">
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("OFFERS.PAGES.LIST.TABLE.FILTER.DATE.TITLE") }}
              </h3>
              <div class="tw-space-y-3">
                <VcInput
                  v-model="stagedFilters.startDate"
                  type="date"
                  :label="$t('OFFERS.PAGES.LIST.TABLE.FILTER.DATE.START_DATE')"
                  @update:model-value="(value) => toggleFilter('startDate', String(value || ''), true)"
                />
                <VcInput
                  v-model="stagedFilters.endDate"
                  type="date"
                  :label="$t('OFFERS.PAGES.LIST.TABLE.FILTER.DATE.END_DATE')"
                  @update:model-value="(value) => toggleFilter('endDate', String(value || ''), true)"
                />
              </div>
            </div>
          </VcRow>

          <!-- Filter Controls -->
          <div class="tw-flex tw-gap-2 tw-mt-4">
            <VcButton variant="primary" :disabled="!hasFilterChanges" @click="applyFilters">
              {{ $t("OFFERS.PAGES.LIST.TABLE.FILTER.APPLY") }}
            </VcButton>
            <VcButton variant="secondary" :disabled="!hasFiltersApplied" @click="resetFilters">
              {{ $t("OFFERS.PAGES.LIST.TABLE.FILTER.RESET") }}
            </VcButton>
          </div>
        </div>
      </template>

      <!-- Product Image Column -->
      <template #item_imgSrc="itemData">
        <div class="tw-w-10 tw-h-10">
          <img
            v-if="itemData.item.imgSrc"
            :src="itemData.item.imgSrc"
            :alt="itemData.item.productName"
            class="tw-w-full tw-h-full tw-object-cover tw-rounded"
          />
          <div v-else class="tw-w-full tw-h-full tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center">
            <span class="tw-text-xs tw-text-gray-400">N/A</span>
          </div>
        </div>
      </template>

      <!-- Product Name Column -->
      <template #item_productName="itemData">
        <div class="tw-truncate tw-font-medium">
          {{ itemData.item.productName }}
        </div>
      </template>

      <!-- Status Column (Enabled) -->
      <template #item_isActive="itemData">
        <VcIcon
          :icon="itemData.item.isActive ? 'fas fa-check-circle' : 'fas fa-times-circle'"
          :class="itemData.item.isActive ? 'tw-text-green-500' : 'tw-text-red-500'"
          size="s"
        />
      </template>

      <!-- Default Status Column -->
      <template #item_isDefault="itemData">
        <VcIcon
          v-if="itemData.item.isDefault"
          icon="fas fa-star"
          class="tw-text-yellow-500"
          size="s"
        />
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, watch, markRaw, Ref } from "vue";
import {
  IBladeToolbar,
  IParentCallArgs,
  useFunctions,
  IActionBuilderResult,
  ITableColumns,
  useNotifications,
  notification,
  useBladeNavigation,
  usePopup,
  useTableSort,
  useBlade,
} from "@vc-shell/framework";
import type { IOffer } from "../types";
import { useOffersList } from "../composables";
import OfferDetails from "./offer-details.vue";
import { useI18n } from "vue-i18n";

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

defineOptions({
  name: "OffersList",
  url: "/offers",
  notifyType: "OfferDeletedDomainEvent",
  isWorkspace: true,
  menuItem: {
    id: "offers",
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-tags",
    priority: 10,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
const { openBlade, closeBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

const { t } = useI18n({ useScope: "global" });
const { debounce } = useFunctions();

const {
  searchQuery,
  items,
  totalCount,
  pages,
  currentPage,
  loadOffers,
  loading,
  deleteOffers,
  statuses,
  stagedFilters,
  appliedFilters,
  hasFilterChanges,
  hasFiltersApplied,
  activeFilterCount,
  toggleFilter,
  applyFilters,
  resetFilters,
} = useOffersList();

const { markAsRead, setNotificationHandler } = useNotifications("OfferDeletedDomainEvent");
const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: "createdDate",
  initialDirection: "DESC",
});
const blade = useBlade();

const searchValue = ref();
const selectedItemId = ref<string>();
const selectedOfferIds = ref<string[]>([]);
const allSelected = ref(false);
const isDesktop = inject<Ref<boolean>>("isDesktop");
const bladeTitle = computed(() => t("OFFERS.PAGES.LIST.TITLE"));

setNotificationHandler((message) => {
  if (message.title) {
    notification.success(message.title, {
      onClose() {
        markAsRead(message);
      },
    });
  }
});

watch(sortExpression, async (value) => {
  await loadOffers({ ...searchQuery.value, sort: value });
});

watch(
  () => props.param,
  (newVal) => {
    if (newVal) {
      selectedItemId.value = newVal;
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  await loadOffers({ ...searchQuery.value, sort: sortExpression.value });
});

const reload = async () => {
  selectedOfferIds.value = [];
  await loadOffers({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 20),
    sort: sortExpression.value,
  });
  emit("parent:call", {
    method: "reload",
  });
};

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadOffers({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler() {
      addOffer();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "material-delete",
    async clickHandler() {
      await removeOffers();
    },
    disabled: computed(() => !selectedOfferIds.value?.length),
    isVisible: isDesktop,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.IMAGE")),
    sortable: false,
    alwaysVisible: true,
    width: 60,
  },
  {
    id: "productName",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    sortable: true,
    alwaysVisible: true,
    mobilePosition: "top-left",
  },
  {
    id: "createdDate",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED")),
    sortable: true,
    type: "date-ago",
    mobilePosition: "bottom-left",
  },
  {
    id: "sku",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU")),
    sortable: true,
  },
  {
    id: "isActive",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.ENABLED")),
    sortable: true,
    mobilePosition: "status",
  },
  {
    id: "isDefault",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.DEFAULT")),
    sortable: true,
  },
]);

const empty = {
  icon: "fas fa-tags",
  text: computed(() => t("OFFERS.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("OFFERS.PAGES.LIST.EMPTY.ADD")),
  clickHandler: () => {
    addOffer();
  },
};

const notfound = {
  icon: "fas fa-search",
  text: computed(() => t("OFFERS.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("OFFERS.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchValue.value = "";
    await loadOffers({
      ...searchQuery.value,
      keyword: "",
    });
  },
};

const onItemClick = (item: IOffer) => {
  openBlade({
    blade: markRaw(OfferDetails),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const onHeaderClick = (item: ITableColumns) => {
  handleSortChange(item.id);
};

const addOffer = () => {
  openBlade({
    blade: markRaw(OfferDetails),
  });
};

const onPaginationClick = async (page: number) => {
  await loadOffers({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
};

const onSelectionChanged = (items: IOffer[]) => {
  selectedOfferIds.value = items.flatMap((item) => (item.id ? [item.id] : []));
};

const actionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "material-delete",
    title: t("OFFERS.PAGES.LIST.ACTIONS.DELETE"),
    type: "danger",
    async clickHandler(item: IOffer) {
      if (item.id && !selectedOfferIds.value.includes(item.id)) {
        selectedOfferIds.value.push(item.id);
      }
      await removeOffers();
      selectedOfferIds.value = [];
    },
  });

  return result;
};

async function removeOffers() {
  if (
    await showConfirmation(
      t("OFFERS.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE", {
        count: allSelected.value
          ? t("OFFERS.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.ALL", { totalCount: totalCount.value })
          : selectedOfferIds.value.length,
      }),
    )
  ) {
    closeBlade((blade.value.navigation?.idx ?? 0) + 1);
    await deleteOffers({ allSelected: allSelected.value, offerIds: selectedOfferIds.value });

    if (searchQuery.value.skip && searchQuery.value.take) {
      if (searchQuery.value.skip >= searchQuery.value.take) {
        if (allSelected.value) {
          searchQuery.value.skip = 0;
        } else {
          searchQuery.value.skip -= searchQuery.value.take;
        }
      }
    }
    await reload();
  }
}

async function selectAllOffers(all: boolean) {
  allSelected.value = all;
}

defineExpose({
  title: bladeTitle,
  reload,
  onItemClick,
});
</script>
