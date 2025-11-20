<!-- @vue-generic {IOffer} -->
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
      :total-label="$t('OFFERS.PAGES.LIST.TABLE.TOTALS')"
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
      :multiselect="true"
      state-key="offers_list"
      class="tw-grow tw-basis-0"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchList"
      @scroll:ptr="reload"
      @selection-changed="onSelectionChanged"
    >
      <!-- Custom column slots -->
      <template #item_image="{ item }">
        <VcImage
          :src="item.product?.imgSrc"
          size="s"
          aspect="1x1"
          :bordered="true"
        />
      </template>

      <template #item_productName="{ item }">
        <div class="tw-truncate">
          {{ item.product?.name }}
        </div>
      </template>

      <template #item_createdDate="{ item }">
        <span>{{ formatDateAgo(item.createdDate) }}</span>
      </template>

      <template #item_isActive="{ item }">
        <VcStatusIcon :status="item.isActive" />
      </template>

      <template #item_isDefault="{ item }">
        <VcStatusIcon v-if="showDefaultColumn" :status="item.isDefault" />
      </template>

      <!-- Filters slot -->
      <template #filters>
        <div class="tw-p-4 tw-space-y-4">
          <!-- Search by keywords -->
          <VcInput
            v-model="stagedFilters.keyword"
            :label="$t('OFFERS.PAGES.LIST.FILTERS.SEARCH')"
            :placeholder="$t('OFFERS.PAGES.LIST.FILTERS.SEARCH_PLACEHOLDER')"
            clearable
          />

          <!-- Sort by -->
          <VcSelect
            v-model="stagedFilters.sort"
            :label="$t('OFFERS.PAGES.LIST.FILTERS.SORT_BY')"
            :options="sortOptions"
            option-label="label"
            option-value="value"
          />

          <!-- Filter actions -->
          <div class="tw-flex tw-gap-2 tw-justify-end">
            <VcButton
              @click="resetFilters"
              variant="outline"
            >
              {{ $t('OFFERS.PAGES.LIST.FILTERS.RESET') }}
            </VcButton>
            <VcButton
              @click="applyFilters"
              variant="primary"
            >
              {{ $t('OFFERS.PAGES.LIST.FILTERS.APPLY') }}
            </VcButton>
          </div>
        </div>
      </template>

      <!-- Mobile item template -->
      <template #mobile-item="{ item }">
        <div class="tw-flex tw-items-center tw-gap-3 tw-p-3">
          <VcImage
            :src="item.product?.imgSrc"
            size="m"
            aspect="1x1"
            :bordered="true"
          />
          <div class="tw-flex-1 tw-min-w-0">
            <div class="tw-font-semibold tw-truncate">
              {{ item.product?.name }}
            </div>
            <div class="tw-text-sm tw-text-gray-500">
              {{ $t('OFFERS.PAGES.LIST.TABLE.HEADER.SKU') }}: {{ item.sku }}
            </div>
            <div class="tw-text-xs tw-text-gray-400">
              {{ formatDateAgo(item.createdDate) }}
            </div>
          </div>
          <div class="tw-flex tw-flex-col tw-items-end tw-gap-1">
            <VcStatusIcon :status="item.isActive" />
            <VcStatusIcon v-if="showDefaultColumn" :status="item.isDefault" />
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  IBladeToolbar,
  IParentCallArgs,
  useBladeNavigation,
  usePopup,
  notification,
} from "@vc-shell/framework";
import { useOffersList } from "../composables";
import OfferDetails from "./offer-details.vue";
import moment from "moment";

interface IOffer {
  id: string;
  sku: string;
  isActive: boolean;
  isDefault: boolean;
  createdDate: string;
  product?: {
    id: string;
    name: string;
    imgSrc?: string;
  };
}

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

defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,
});

const { t } = useI18n({ useScope: "global" });
const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

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
  load,
  reload,
  remove,
  bulkDelete,
  settings,
} = useOffersList();

// Local state for filters
const stagedFilters = ref<{
  keyword?: string;
  sort?: string;
}>({
  keyword: searchValue.value,
  sort: sortExpression.value,
});

// Selected items for multiselect
const selectedItems = ref<string[]>([]);

const bladeTitle = computed(() => t("OFFERS.PAGES.LIST.TITLE"));

// Show default column based on settings
const showDefaultColumn = computed(() => settings.value?.allowMultipleOffers === true);

// Sort options
const sortOptions = computed(() => [
  { label: t("OFFERS.PAGES.LIST.FILTERS.SORT_NAME"), value: "product.name:asc" },
  { label: t("OFFERS.PAGES.LIST.FILTERS.SORT_DATE"), value: "createdDate:desc" },
  { label: t("OFFERS.PAGES.LIST.FILTERS.SORT_SKU"), value: "sku:asc" },
  { label: t("OFFERS.PAGES.LIST.FILTERS.SORT_ACTIVE"), value: "isActive:desc" },
  { label: t("OFFERS.PAGES.LIST.FILTERS.SORT_DEFAULT"), value: "isDefault:desc" },
]);

// Empty and Not Found state configurations
const empty = {
  icon: "fas fa-box-open",
  text: computed(() => t("OFFERS.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("OFFERS.PAGES.LIST.EMPTY.ADD_OFFER")),
  clickHandler: () => {
    addOffer();
  },
};

const notfound = {
  icon: "fas fa-search",
  text: computed(() => t("OFFERS.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("OFFERS.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    onSearchList("");
    resetFilters();
  },
};

// Table columns
const tableColumns = computed(() => {
  const columns = [
    {
      id: "image",
      title: t("OFFERS.PAGES.LIST.TABLE.HEADER.IMAGE"),
      width: "80px",
      sortable: false,
      alwaysVisible: true,
    },
    {
      id: "productName",
      title: t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME"),
      width: "auto",
      sortable: true,
    },
    {
      id: "createdDate",
      title: t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED"),
      width: "180px",
      sortable: true,
      type: "date-ago",
    },
    {
      id: "sku",
      title: t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU"),
      width: "150px",
      sortable: true,
    },
    {
      id: "isActive",
      title: t("OFFERS.PAGES.LIST.TABLE.HEADER.ENABLED"),
      width: "100px",
      sortable: true,
    },
  ];

  // Add default column conditionally
  if (showDefaultColumn.value) {
    columns.push({
      id: "isDefault",
      title: t("OFFERS.PAGES.LIST.TABLE.HEADER.DEFAULT"),
      width: "100px",
      sortable: true,
    });
  }

  return columns;
});

// Toolbar configuration
const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "refresh",
    title: t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH"),
    icon: "fas fa-sync",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: t("OFFERS.PAGES.LIST.TOOLBAR.ADD"),
    icon: "fas fa-plus",
    clickHandler() {
      addOffer();
    },
  },
  {
    id: "delete-selected",
    title: t("OFFERS.PAGES.LIST.TOOLBAR.DELETE_SELECTED"),
    icon: "fas fa-trash",
    isVisible: selectedItems.value.length > 0,
    clickHandler() {
      deleteSelected();
    },
  },
]);

// Event handlers
function onItemClick(item: IOffer) {
  openBlade({
    blade: markRaw(OfferDetails),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
      reload();
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
  stagedFilters.value.keyword = keyword;
}

function onSelectionChanged(selectedIds: string[]) {
  selectedItems.value = selectedIds;
}

function applyFilters() {
  searchValue.value = stagedFilters.value.keyword || "";
  sortExpression.value = stagedFilters.value.sort || "createdDate:desc";
  activeFilterCount.value = (stagedFilters.value.keyword ? 1 : 0) + (stagedFilters.value.sort ? 1 : 0);
}

function resetFilters() {
  stagedFilters.value = {
    keyword: "",
    sort: "createdDate:desc",
  };
  applyFilters();
  activeFilterCount.value = 0;
}

function addOffer() {
  openBlade({
    blade: markRaw(OfferDetails),
    onClose() {
      reload();
    },
  });
}

async function deleteOffer(id: string) {
  const confirmed = await showConfirmation(
    t("OFFERS.PAGES.LIST.DELETE.CONFIRMATION", { count: 1 })
  );

  if (!confirmed) return;

  try {
    await remove(id);
    notification.success(t("OFFERS.PAGES.LIST.DELETE.SUCCESS"));
  } catch (error) {
    notification.error(t("OFFERS.PAGES.LIST.DELETE.ERROR"));
    console.error("[OffersList] Error deleting offer:", error);
  }
}

async function deleteSelected() {
  const confirmed = await showConfirmation(
    t("OFFERS.PAGES.LIST.DELETE.CONFIRMATION", { count: selectedItems.value.length })
  );

  if (!confirmed) return;

  try {
    await bulkDelete(selectedItems.value);
    selectedItems.value = [];
    notification.success(t("OFFERS.PAGES.LIST.DELETE.SUCCESS"));
  } catch (error) {
    notification.error(t("OFFERS.PAGES.LIST.DELETE.ERROR"));
    console.error("[OffersList] Error deleting offers:", error);
  }
}

function formatDateAgo(date: string): string {
  return moment(date).fromNow();
}

onMounted(async () => {
  await load();
});

defineExpose({
  reload,
  title: bladeTitle,
});
</script>
