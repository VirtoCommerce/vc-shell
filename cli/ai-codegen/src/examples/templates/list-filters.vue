<template>
  <VcBlade
    v-loading="loading"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    width="30%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      :total-label="$t('ENTITIES.PAGES.LIST.TABLE.TOTALS')"
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
      state-key="ENTITY_LIST"
      :multiselect="false"
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchChange"
    >
      <template #filters>
        <div class="tw-p-4">
          <VcRow class="tw-gap-16">
            <div class="tw-flex tw-flex-col">
              <!-- Status Filter -->
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.STATUS.TITLE") }}
              </h3>
              <div class="tw-space-y-2">
                <VcRadioButton
                  v-for="status in statuses"
                  :key="status.value"
                  :model-value="stagedFilters.status[0] || ''"
                  :value="status.value"
                  :label="status.displayValue"
                  @update:model-value="(value) => toggleStatusFilter(value)"
                >
                </VcRadioButton>
              </div>
            </div>

            <!-- Date Range Filter -->
            <div class="tw-flex tw-flex-col">
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.DATE.TITLE") }}
              </h3>
              <div class="tw-space-y-3">
                <VcInput
                  v-model="stagedFilters.startDate"
                  type="date"
                  :label="$t('ENTITIES.PAGES.LIST.TABLE.FILTER.DATE.START_DATE')"
                  @update:model-value="(value) => toggleFilter('startDate', String(value || ''), true)"
                />
                <VcInput
                  v-model="stagedFilters.endDate"
                  type="date"
                  :label="$t('ENTITIES.PAGES.LIST.TABLE.FILTER.DATE.END_DATE')"
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
              {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.APPLY") }}
            </VcButton>

            <VcButton
              variant="secondary"
              :disabled="!hasFiltersApplied"
              @click="resetFilters"
            >
              {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.RESET") }}
            </VcButton>
          </div>
        </div>
      </template>

      <!-- Custom column templates -->
      <template #item_status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  useBladeNavigation,
  useTableSort,
  IBladeToolbar,
  ITableColumns,
  IParentCallArgs,
  useFunctions,
} from "@vc-shell/framework";
// TODO: Update import path for your entity's composable
import { useEntityList } from "../composables/useEntityList";
// TODO: Create and import your entity's status badge component if needed
import { StatusBadge } from "../components";
import type { Entity } from "../types";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
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
  name: "Entities",
  url: "/entities",
  isWorkspace: true,
  permissions: ["entity:view"],
  priority: 1,
  menuItem: {
    title: "ENTITIES.MENU.TITLE",
    icon: "material-list",
    priority: 1,
  },
});

const { t } = useI18n({ useScope: "global" });
const { openBlade, resolveBladeByName } = useBladeNavigation();

const {
  items,
  totalCount,
  pages,
  currentPage,
  searchQuery,
  loadEntities,
  loading,
  statuses,
  stagedFilters,
  appliedFilters,
  hasFilterChanges,
  hasFiltersApplied,
  activeFilterCount,
  toggleFilter,
  applyFilters,
  resetFilters,
  resetSearch,
} = useEntityList({ pageSize: 20 });

const { debounce } = useFunctions();

const { sortExpression, handleSortChange: tableSortHandler } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

const selectedItemId = ref<string>();
const searchKeyword = ref<string | undefined>(undefined);

const bladeTitle = computed(() => t("ENTITIES.PAGES.LIST.TITLE"));

const empty = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.EMPTY.NO_ITEMS")),
};

const notfound = {
  icon: "material-list",
  text: computed(() => t("ENTITIES.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("ENTITIES.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    resetSearch();
  },
};

onMounted(async () => {
  await loadEntities({
    take: 20,
    sort: sortExpression.value,
  });
});

watch(
  () => sortExpression.value,
  async (newVal) => {
    await loadEntities({
      ...searchQuery.value,
      sort: newVal,
    });
  },
);

watch(
  () => props.param,
  (newVal) => {
    selectedItemId.value = newVal;
  },
  { immediate: true, deep: true },
);

const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "refresh",
    title: t("ENTITIES.PAGES.LIST.TOOLBAR.REFRESH"),
    icon: "material-refresh",
    async clickHandler() {
      await loadEntities(searchQuery.value);
    },
  },
]);

const columns = computed((): ITableColumns[] => [
  {
    id: "name",
    title: t("ENTITIES.PAGES.LIST.TABLE.HEADER.NAME"),
    alwaysVisible: true,
    sortable: true,
    mobilePosition: "top-left",
  },
  {
    id: "email",
    title: t("ENTITIES.PAGES.LIST.TABLE.HEADER.EMAIL"),
    alwaysVisible: true,
    sortable: true,
    mobilePosition: "bottom-left",
  },
  {
    id: "status",
    title: t("ENTITIES.PAGES.LIST.TABLE.HEADER.STATUS"),
    alwaysVisible: true,
    sortable: true,
    type: "status",
    mobilePosition: "status",
  },
  {
    id: "createdDate",
    title: t("ENTITIES.PAGES.LIST.TABLE.HEADER.CREATED"),
    sortable: true,
    type: "date-ago",
    mobilePosition: "bottom-right",
  },
]);

async function onItemClick(item: Entity) {
  await openBlade({
    blade: resolveBladeByName("EntityDetails"),
    param: item.id,
    options: {
      item,
    },
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
}

function onHeaderClick(column: ITableColumns) {
  if (column.sortable) {
    tableSortHandler(column.id);
  }
}

async function onPaginationClick(page: number) {
  const skip = (page - 1) * (searchQuery.value.take ?? 20);
  await loadEntities({
    ...searchQuery.value,
    skip,
  });
}

const onSearchChange = debounce(async (keyword: string | undefined) => {
  searchKeyword.value = keyword;
  await loadEntities({
    ...searchQuery.value,
    keyword,
    skip: 0,
  });
}, 1000);

const reload = async () => {
  await loadEntities({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 20),
    sort: sortExpression.value,
  });
};

function toggleStatusFilter(value: string) {
  toggleFilter("status", value, true);
}

defineExpose({
  title: bladeTitle,
  reload,
});
</script>

