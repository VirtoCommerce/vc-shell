<template>
  <VcBlade
    :title="$t('SAMPLE_APP.PAGES.LIST.TITLE')"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <!-- @vue-generic {MockedItem} -->
    <VcTable
      :expanded="expanded"
      class="tw-grow tw-basis-0"
      multiselect
      :loading="loading"
      :columns="columns"
      :sort="sortExpression"
      :pages="pages"
      :total-count="totalCount"
      :search-value="searchValue"
      :current-page="currentPage"
      :search-placeholder="$t('SAMPLE_APP.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('SAMPLE_APP.PAGES.LIST.TABLE.TOTALS')"
      :selected-item-id="selectedItemId"
      state-key="SAMPLE_APP"
      :items="data"
      :item-action-builder="actionBuilder"
      enable-item-actions
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @selection-changed="onSelectionChanged"
    >
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, markRaw, onMounted, watch } from "vue";
import {
  IActionBuilderResult,
  IBladeToolbar,
  IParentCallArgs,
  ITableColumns,
  useBladeNavigation,
  usePopup,
  useTableSort,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { useList } from "./../composables";
import Details from "./details.vue";
import { MockedItem } from "./../composables/useList";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:blade"): void;
}

defineOptions({
  url: "/sample-list",
  name: "SampleList",
  isWorkspace: true,
  menuItem: {
    title: "SAMPLE_APP.MENU.TITLE",
    icon: "lucide-file",
    priority: 1,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });
const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();

const { sortExpression, handleSortChange: tableSortHandler } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

const { getItems, removeItems, data, loading, totalCount, pages, currentPage, searchQuery } = useList({
  sort: sortExpression.value,
  pageSize: 20,
});

const searchValue = ref();
const selectedItemId = ref<string>();
const selectedIds = ref<string[]>([]);

watch(
  () => props.param,
  (newVal) => {
      selectedItemId.value = newVal;
  },
  { immediate: true },
);

onMounted(async () => {
  await getItems({
    ...searchQuery.value,
    sort: sortExpression.value,
  });
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "remove",
    icon: "material-delete",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TOOLBAR.REMOVE")),
    async clickHandler() {
      await remove(selectedIds.value);
    },
    disabled: computed(() => selectedIds.value.length === 0),
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.HEADER.IMAGE")),
    type: "image",
    width: "70px",
  },
  {
    id: "name",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    alwaysVisible: true,
  },
  {
    id: "description",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.HEADER.DESCRIPTION")),
  },
  {
    id: "price",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.HEADER.PRICE")),
    type: "money",
    alwaysVisible: true,
  },
  {
    id: "salePrice",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.HEADER.SALE_PRICE")),
    type: "money",
  },
  {
    id: "currency.name",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.HEADER.CURRENCY")),
  },
]);

const title = computed(() => t("SAMPLE_APP.PAGES.LIST.HEADER.TITLE"));

const reload = async () => {
  await getItems({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
    sort: sortExpression.value,
  });
};

const onItemClick = (item: { id: string }) => {
  openBlade({
    blade: markRaw(Details),
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
  tableSortHandler(item.id);
};

const onSelectionChanged = (items: MockedItem[]) => {
  selectedIds.value = items.map((item) => item.id!);
};

const actionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "material-delete",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.ACTIONS.DELETE")),
    type: "danger",
    clickHandler(item: MockedItem) {
      if (item.id) {
        if (!selectedIds.value.includes(item.id)) {
          selectedIds.value.push(item.id);
        }
        remove(selectedIds.value);
        selectedIds.value = [];
      }
    },
  });

  return result;
};

async function remove(ids: string[]) {
  if (
    await showConfirmation(
      t(`SAMPLE_APP.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE`, {
        count: selectedIds.value.length,
      }),
    )
  ) {
    await removeItems({ ids });
    await reload();
  }
}

watch(
  () => sortExpression.value,
  async (newVal) => {
    await getItems({
      sort: newVal,
    });
  },
);

defineExpose({
  title,
  reload,
});
</script>
