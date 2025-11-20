<template>
  <VcBlade
    v-loading="loading"
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    width="100%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      :expanded="props.expanded"
      :multiselect="true"
      :columns="columns"
      :items="items"
      :pages="pages"
      :current-page="currentPage"
      :search-value="searchKeyword"
      :selected-item-id="selectedItemId"
      :active-filter-count="activeFilterCount"
      state-key="offers_list"
      @itemClick="onItemClick"
      @headerClick="onHeaderClick"
      @paginationClick="onPaginationClick"
      @selectionChanged="onSelectionChanged"
      @search:change="onSearchChange"
    >
      <template #filters="{ closePanel }">
        <div class="tw-p-4">
          <VcInput
            v-model="searchKeyword"
            :placeholder="$t('OFFERS.PAGES.LIST.FILTERS.SEARCH_PLACEHOLDER')"
            class="tw-mb-4"
            clearable
            @update:model-value="onSearchChange"
          />
          <div class="tw-flex tw-gap-2 tw-justify-end">
            <VcButton
              size="sm"
              @click="
                resetFilters();
                closePanel();
              "
            >
              {{ $t("COMMON.RESET") }}
            </VcButton>
            <VcButton
              variant="primary"
              size="sm"
              @click="
                applyFilters();
                closePanel();
              "
            >
              {{ $t("COMMON.APPLY") }}
            </VcButton>
          </div>
        </div>
      </template>

      <template #item_productImage="{ item }">
        <div
          class="tw-w-10 tw-h-10 tw-rounded tw-overflow-hidden tw-flex tw-items-center tw-justify-center tw-bg-gray-100"
        >
          <img
            v-if="item.productImage"
            :src="item.productImage"
            :alt="item.productName"
            class="tw-w-full tw-h-full tw-object-cover"
          />
          <VcIcon
            v-else
            icon="fas fa-image"
            size="sm"
            class="tw-text-gray-400"
          />
        </div>
      </template>

      <template #item_productName="{ item }">
        <span class="tw-text-blue-600 tw-cursor-pointer hover:tw-underline">
          {{ item.productName }}
        </span>
      </template>

      <template #item_createdDate="{ item }">
        {{ formatDateAgo(item.createdDate) }}
      </template>

      <template #item_isActive="{ item }">
        <VcIcon
          :icon="item.isActive ? 'fas fa-check-circle' : 'fas fa-times-circle'"
          :class="item.isActive ? 'tw-text-green-500' : 'tw-text-red-500'"
        />
      </template>

      <template #item_isDefault="{ item }">
        <VcIcon
          v-if="settings.allowDefault"
          :icon="item.isDefault ? 'fas fa-star' : 'far fa-star'"
          :class="item.isDefault ? 'tw-text-yellow-500' : 'tw-text-gray-400'"
        />
      </template>

      <template #empty>
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12">
          <VcIcon
            icon="fas fa-box-open"
            size="xxl"
            class="tw-text-gray-300 tw-mb-4"
          />
          <p class="tw-text-lg tw-font-medium tw-mb-2">{{ $t("OFFERS.PAGES.LIST.EMPTY.TITLE") }}</p>
          <p class="tw-text-gray-500 tw-mb-6">{{ $t("OFFERS.PAGES.LIST.EMPTY.MESSAGE") }}</p>
          <VcButton
            variant="primary"
            @click="openDetailsForNew"
          >
            <VcIcon
              icon="fas fa-plus"
              class="tw-mr-2"
            />
            {{ $t("OFFERS.PAGES.LIST.EMPTY.ACTION") }}
          </VcButton>
        </div>
      </template>

      <template #notfound>
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12">
          <VcIcon
            icon="fas fa-search"
            size="xxl"
            class="tw-text-gray-300 tw-mb-4"
          />
          <p class="tw-text-lg tw-font-medium tw-mb-2">{{ $t("OFFERS.PAGES.LIST.NOTFOUND.TITLE") }}</p>
          <p class="tw-text-gray-500 tw-mb-6">{{ $t("OFFERS.PAGES.LIST.NOTFOUND.MESSAGE") }}</p>
          <VcButton @click="resetSearch">
            {{ $t("OFFERS.PAGES.LIST.NOTFOUND.ACTION") }}
          </VcButton>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from "vue";
import { useI18n } from "vue-i18n";
import { useBladeNavigation } from "@vc-shell/framework";
import { notification } from "@vc-shell/framework";
import type { IBladeToolbar } from "@vc-shell/framework";
import { usePopup } from "@vc-shell/framework";
import useOffersList from "../composables/useOffersList";
import OfferDetails from "./offer-details.vue";
import moment from "moment";

defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,
  menuItem: {
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-tags",
    priority: 10,
  },
});

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

interface Emits {
  (event: "parent:call", args: { method: string; args?: unknown }): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });
const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

// Composable for list data and operations
const { items, loading, totalCount, currentPage, pages, loadOffers, deleteOffers, settings } = useOffersList();

// Local UI state
const searchKeyword = ref("");
const activeFilterCount = ref(0);
const selectedItemId = ref<string>();
const selectedIds = ref<string[]>([]);
const sortExpression = ref("");

// Format date ago
function formatDateAgo(date: string | Date): string {
  return moment(date).fromNow();
}

// Event Handlers
async function onItemClick(item: { id: string }) {
  await openBlade({
    blade: markRaw(OfferDetails),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
      // loadOffers();
    },
  });
}

function onHeaderClick(column: { id: string }) {
  const sortableColumns = ["productName", "createdDate", "sku", "isActive", "isDefault"];
  if (!sortableColumns.includes(column.id)) return;

  // Toggle sort direction
  if (sortExpression.value === column.id) {
    sortExpression.value = `${column.id}:desc`;
  } else if (sortExpression.value === `${column.id}:desc`) {
    sortExpression.value = "";
  } else {
    sortExpression.value = column.id;
  }

  // Reload with new sort
  loadOffers({ sort: sortExpression.value });
}

async function onPaginationClick(page: number) {
  await loadOffers({ page, sort: sortExpression.value });
}

function onSelectionChanged(ids: string[]) {
  selectedIds.value = ids;
}

async function onSearchChange(keyword: string) {
  searchKeyword.value = keyword;
  await loadOffers({ page: 1, keyword: searchKeyword.value, sort: sortExpression.value });
}

function applyFilters() {
  loadOffers({ keyword: searchKeyword.value, sort: sortExpression.value });
}

function resetFilters() {
  searchKeyword.value = "";
  activeFilterCount.value = 0;
  loadOffers({ page: 1 });
}

function resetSearch() {
  searchKeyword.value = "";
  loadOffers({ page: 1 });
}

async function openDetailsForNew() {
  await openBlade({
    blade: OfferDetails,
    onClose() {
      loadOffers();
    },
  });
}

async function deleteSelectedOffers() {
  const confirmed = await showConfirmation(
    t("OFFERS.PAGES.LIST.CONFIRM_DELETE_SELECTED", { count: selectedIds.value.length }),
  );

  if (!confirmed) return;

  try {
    await deleteOffers(selectedIds.value);
    selectedIds.value = [];
    notification.success(t("OFFERS.PAGES.LIST.DELETE_SUCCESS"));
    await loadOffers();
  } catch (error) {
    notification.error(t("OFFERS.PAGES.LIST.DELETE_ERROR"));
    console.error("Error deleting offers:", error);
  }
}

// Toolbar
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync",
    async clickHandler() {
      await loadOffers({ sort: sortExpression.value });
    },
  },
  {
    id: "add",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    async clickHandler() {
      await openDetailsForNew();
    },
  },
  {
    id: "delete",
    title: computed(() => t("OFFERS.PAGES.LIST.TOOLBAR.DELETE_SELECTED")),
    icon: "fas fa-trash",
    disabled: computed(() => selectedIds.value.length === 0),
    async clickHandler() {
      await deleteSelectedOffers();
    },
  },
]);

// Columns configuration
const columns = computed(() => [
  {
    id: "productImage",
    title: t("OFFERS.PAGES.LIST.COLUMNS.PRODUCT_IMAGE"),
    width: 60,
  },
  {
    id: "productName",
    title: t("OFFERS.PAGES.LIST.COLUMNS.PRODUCT_NAME"),
    sortable: true,
  },
  {
    id: "createdDate",
    title: t("OFFERS.PAGES.LIST.COLUMNS.CREATED_DATE"),
    sortable: true,
  },
  {
    id: "sku",
    title: t("OFFERS.PAGES.LIST.COLUMNS.SKU"),
    sortable: true,
  },
  {
    id: "isActive",
    title: t("OFFERS.PAGES.LIST.COLUMNS.IS_ACTIVE"),
    sortable: true,
    width: 100,
  },
  {
    id: "isDefault",
    title: t("OFFERS.PAGES.LIST.COLUMNS.IS_DEFAULT"),
    sortable: true,
    width: 100,
  },
]);

// Initialize
onMounted(async () => {
  await loadOffers();
});

// Expose methods for parent blade
defineExpose({
  title: computed(() => t("OFFERS.PAGES.LIST.TITLE")),
  reload: () => loadOffers({ sort: sortExpression.value }),
});
</script>
