<template>
  <VcBlade
    :title="title"
    width="50%"
    :toolbar-items="bladeToolbar"
  >
    <!-- Blade contents -->
    <!-- @vue-generic {MockedItem} -->
    <VcDataTable
      v-model:search-value="searchValue"
      v-model:active-item-id="selectedItemId"
      v-model:selection="selectedItems"
      :loading="loading"
      class="tw-grow tw-basis-0"
      selection-mode="multiple"
      :items="data ?? []"
      :row-actions="actionBuilder"
      :pagination="{ currentPage, pages }"
      :searchable="true"
      :search-placeholder="$t('SAMPLE_APP.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :empty-state="{
        icon: 'lucide-file',
        title: $t('SAMPLE_APP.PAGES.LIST.EMPTY.NO_ITEMS'),
        actionLabel: $t('SAMPLE_APP.PAGES.LIST.EMPTY.ADD'),
        actionHandler: addItem,
      }"
      :not-found-state="{
        icon: 'lucide-file',
        title: $t('SAMPLE_APP.PAGES.LIST.NOT_FOUND.EMPTY'),
        actionLabel: $t('SAMPLE_APP.PAGES.LIST.NOT_FOUND.RESET'),
        actionHandler: clearSearch,
      }"
      :total-label="$t('SAMPLE_APP.PAGES.LIST.TABLE.TOTALS')"
      :total-count="totalCount"
      state-key="SAMPLE_APP"
      @search="onSearchList"
      @row-click="onItemClick"
      @pagination-click="onPaginationClick"
    >
      <VcColumn
        id="imgSrc"
        :title="$t('SAMPLE_APP.PAGES.LIST.TABLE.HEADER.IMAGE')"
        type="image"
        width="70px"
      />
      <VcColumn
        id="name"
        :title="$t('SAMPLE_APP.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME')"
        :sortable="true"
        :always-visible="true"
      />
      <VcColumn
        id="description"
        :title="$t('SAMPLE_APP.PAGES.LIST.TABLE.HEADER.DESCRIPTION')"
      />
      <VcColumn
        id="price"
        :title="$t('SAMPLE_APP.PAGES.LIST.TABLE.HEADER.PRICE')"
        type="money"
        :sortable="true"
        :always-visible="true"
      />
      <VcColumn
        id="salePrice"
        :title="$t('SAMPLE_APP.PAGES.LIST.TABLE.HEADER.SALE_PRICE')"
        type="money"
      />
      <VcColumn
        id="currency.name"
        :title="$t('SAMPLE_APP.PAGES.LIST.TABLE.HEADER.CURRENCY')"
      />
    </VcDataTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import {
  IBladeToolbar,
  useBlade,
  usePopup,
  useTableSort,
  useFunctions,
  VcColumn,
  VcDataTable,
} from "@vc-shell/framework";
import type { TableAction } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { useList } from "./../composables";
import { MockedItem } from "./../composables/useList";

defineBlade({
  name: "SampleList",
  url: "/sample-list",
  isWorkspace: true,
  menuItem: {
    title: "SAMPLE_APP.MENU.TITLE",
    icon: "lucide-file",
    priority: 1,
  },
});

const { t } = useI18n({ useScope: "global" });
const { param, openBlade, exposeToChildren } = useBlade();
const { showConfirmation } = usePopup();
const { debounce } = useFunctions();

const { sortExpression } = useTableSort({
  initialProperty: "createdDate",
  initialDirection: "DESC",
});

const { getItems, removeItems, data, loading, totalCount, pages, currentPage, searchQuery } = useList({
  sort: sortExpression.value,
  pageSize: 20,
});

const searchValue = ref();
const selectedItemId = ref<string>();
const selectedItems = ref<MockedItem[]>([]);

const selectedIds = computed(() => selectedItems.value.map((item) => item.id).filter(Boolean) as string[]);

watch(
  param,
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

watch(sortExpression, async (value) => {
  await getItems({
    ...searchQuery.value,
    sort: value,
  });
});

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await getItems({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const clearSearch = async () => {
  searchValue.value = "";
  await getItems({
    ...searchQuery.value,
    keyword: "",
  });
};

const addItem = () => {
  openBlade({
    name: "SampleDetails",
  });
};

const onPaginationClick = async (page: number) => {
  await getItems({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
};

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "lucide-refresh-cw",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "remove",
    icon: "lucide-trash-2",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TOOLBAR.REMOVE")),
    async clickHandler() {
      await remove(selectedIds.value);
    },
    disabled: computed(() => selectedIds.value.length === 0),
  },
]);

const title = computed(() => t("SAMPLE_APP.PAGES.LIST.TITLE"));

const reload = async () => {
  selectedItems.value = [];
  await getItems({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
    sort: sortExpression.value,
  });
};

const onItemClick = (event: { data: MockedItem; index: number; originalEvent: Event }) => {
  const item = event.data;
  openBlade({
    name: "SampleDetails",
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const actionBuilder = (item: MockedItem): TableAction[] => {
  return [
    {
      icon: "lucide-trash-2",
      title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.ACTIONS.DELETE")),
      type: "danger",
      async clickHandler() {
        if (item.id) {
          if (!selectedIds.value.includes(item.id)) {
            selectedItems.value = [...selectedItems.value, item];
          }
          await remove(selectedIds.value);
          selectedItems.value = [];
        }
      },
    },
  ];
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

exposeToChildren({ reload });
</script>
