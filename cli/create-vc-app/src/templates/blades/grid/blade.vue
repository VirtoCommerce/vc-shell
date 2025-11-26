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
    <!-- @vue-generic {I{{EntityName}}} -->
    <VcTable
      :total-label="$t('{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.TOTALS')"
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
      state-key="{{entity_name_plural}}_list"
      :multiselect="false"
      class="tw-grow tw-basis-0"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchList"
      @scroll:ptr="reload"
    >
      <template #filters>
        <div class="tw-p-4">
          <VcRow class="tw-gap-16">
            <div class="tw-flex tw-flex-col">
              <!-- Status Filter -->
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.FILTER.STATUS.TITLE") }}
              </h3>
              <div class="tw-space-y-2">
                <VcRadioButton
                  v-for="status in statuses"
                  :key="status.value"
                  :model-value="stagedFilters.status[0] || ''"
                  :value="status.value"
                  :label="status.displayValue"
                  @update:model-value="(value) => toggleFilter('status', String(value), true)"
                >
                </VcRadioButton>
              </div>
            </div>

            <!-- Date Range Filter -->
            <div class="tw-flex tw-flex-col">
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.FILTER.DATE.TITLE") }}
              </h3>
              <div class="tw-space-y-3">
                <VcInput
                  v-model="stagedFilters.startDate"
                  type="date"
                  :label="$t('{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.FILTER.DATE.START_DATE')"
                  @update:model-value="(value: string) => toggleFilter('startDate', String(value || ''), true)"
                />
                <VcInput
                  v-model="stagedFilters.endDate"
                  type="date"
                  :label="$t('{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.FILTER.DATE.END_DATE')"
                  @update:model-value="(value: string) => toggleFilter('endDate', String(value || ''), true)"
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
              {{ $t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.FILTER.APPLY") }}
            </VcButton>

            <VcButton
              variant="secondary"
              :disabled="!hasFiltersApplied"
              @click="resetFilters"
            >
              {{ $t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.FILTER.RESET") }}
            </VcButton>
          </div>
        </div>
      </template>

      <!-- Override column template example -->
      <template #item_name="itemData">
        <div class="tw-truncate">
          {{ itemData.item.name }}
        </div>
      </template>

      <!-- Status column template example -->
      <template #item_isActive="itemData">
        <VcStatusIcon :status="itemData.item.isActive" />
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
import { use{{EntityName}}List } from "../composables";
{{DETAILS_BLADE_IMPORT}}
import { useI18n } from "vue-i18n";

// TODO: Replace with your actual types
// Example: import { IProduct } from "@your-app/api/products";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  name: "{{EntityName}}List",
  url: "/{{entity-name-list}}",
  notifyType: "{{EntityName}}DeletedDomainEvent",
  isWorkspace: {{isWorkspace}},
  menuItem: {{menuItem}},
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
  load{{EntityName}}s,
  loading,
  statuses,
  // Filters
  stagedFilters,
  appliedFilters,
  hasFilterChanges,
  hasFiltersApplied,
  activeFilterCount,
  toggleFilter,
  applyFilters,
  resetFilters,
  resetSearch,
} = use{{EntityName}}List();

const { markAsRead, setNotificationHandler } = useNotifications("{{EntityName}}DeletedDomainEvent");
const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: "createdDate",
  initialDirection: "DESC",
});
const blade = useBlade();

const searchValue = ref();
const selectedItemId = ref<string>();
const isDesktop = inject<Ref<boolean>>("isDesktop");
const bladeTitle = computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TITLE"));

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
  await load{{EntityName}}s({ ...searchQuery.value, sort: value });
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
  await load{{EntityName}}s({ ...searchQuery.value, sort: sortExpression.value });
});

const reload = async () => {
  await load{{EntityName}}s({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 20),
    sort: sortExpression.value,
  });
  emit("parent:call", { method: "reload" });
};

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await load{{EntityName}}s({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    title: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler() {
      add{{EntityName}}();
    },
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "name",
    field: "name",
    title: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    alwaysVisible: true,
    mobilePosition: "top-left",
  },
  {
    id: "createdDate",
    title: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    sortable: true,
    type: "date-ago",
    mobilePosition: "bottom-right",
  },
]);

const empty = {
  icon: "material-list",
  text: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.EMPTY.ADD")),
  clickHandler: () => {
    add{{EntityName}}();
  },
};

const notfound = {
  icon: "material-list",
  text: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("{{MODULE_NAME_UPPERCASE}}.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchValue.value = "";
    await resetSearch();
  },
};

const onItemClick = (item: { id?: string }) => {
  {{DETAILS_BLADE_OPEN_ITEM}}
};

const onHeaderClick = (item: ITableColumns) => {
  handleSortChange(item.id);
};

const add{{EntityName}} = () => {
  {{DETAILS_BLADE_OPEN_NEW}}
};

const onPaginationClick = async (page: number) => {
  await load{{EntityName}}s({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
};

defineExpose({
  title: bladeTitle,
  reload,
  onItemClick,
});
</script>
