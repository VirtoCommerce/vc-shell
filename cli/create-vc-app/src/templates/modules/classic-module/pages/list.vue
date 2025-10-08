<template>
  <VcBlade
    :title="title"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <!-- @vue-generic {never} -->
    <VcTable
      :expanded="expanded"
      class="tw-grow tw-basis-0"
      multiselect
      :loading="loading"
      :columns="columns"
      :sort="sortExpression"
      :current-page="currentPage"
      :search-value="searchValue"
      enable-item-actions
      :item-action-builder="actionBuilder"
      :pages="pages"
      :empty="empty"
      :notfound="notfound"
      :total-count="totalCount"
      :selected-item-id="selectedItemId"
      :search-placeholder="$t('{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TABLE.TOTALS')"
      state-key="{{ModuleNameUppercaseSnakeCase}}"
      :items="data"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @search:change="onSearchList"
      @pagination-click="onPaginationClick"
      @selection-changed="onSelectionChanged"
    >
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, markRaw, onMounted, watch } from "vue";
import { IBladeToolbar, IParentCallArgs, ITableColumns, useBladeNavigation, useTableSort, IActionBuilderResult, useFunctions, usePopup } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { use{{ModuleNamePascalCase}}List } from "./../composables";
import Details from "./details.vue";

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
  url: "/{{ModuleName}}",
  name: "{{ModuleNamePascalCase}}List",
  isWorkspace: true,
  menuItem: {
    title: "{{ModuleNameUppercaseSnakeCase}}.MENU.TITLE",
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
const { debounce } = useFunctions();
const { showConfirmation } = usePopup();
const { sortExpression, handleSortChange: tableSortHandler } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

const { getItems, data, loading, totalCount, pages, currentPage, searchQuery, removeItems } = use{{ModuleNamePascalCase}}List({
  sort: sortExpression.value,
  pageSize: 20,
});

const searchValue = ref();
const selectedItemId = ref<string>();
const selectedItemsIds = ref<string[]>([]);

const empty = {
  icon: "lucide-file",
  text: computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.EMPTY.ADD")),
  clickHandler: () => {
    addItem();
  },
};

const notfound = {
  icon: "lucide-file",
  text: computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.NOT_FOUND.EMPTY")),
  action: computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.NOT_FOUND.RESET")),
  clickHandler: async () => {
    searchValue.value = "";
    await getItems({
      ...searchQuery.value,
      keyword: "",
    });
  },
};

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
    title: computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "material-refresh",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "add",
    icon: "material-add",
    title: computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TOOLBAR.ADD")),
    clickHandler: () => {
      addItem();
    },
  },
]);

const columns = ref<ITableColumns[]>([
  // You can add columns here
]);

const title = computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TITLE"));

const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await getItems({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

const reload = async () => {
  await getItems({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
    sort: sortExpression.value,
  });
};

const addItem = () => {
  openBlade({
    blade: markRaw(Details),
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

const actionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "material-delete",
    title: "Delete",
    type: "danger",
    async clickHandler(_item: { id: string }) {
      if (_item.id && !selectedItemsIds.value.includes(_item.id)) {
        selectedItemsIds.value.push(_item.id);
      }
      await remove(selectedItemsIds.value);
      selectedItemsIds.value = [];
    },
  });

  return result;
};

const onPaginationClick = async (page: number) => {
  await getItems({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 20),
  });
};

const onSelectionChanged = (items: Record<string, any>[]) => {
  selectedItemsIds.value = items.flatMap((item) => (item.id ? [item.id] : []));
};

async function remove(ids: string[]) {
  if (
    await showConfirmation(
      t(`{{ModuleNameUppercaseSnakeCase}}.PAGES.ALERTS.DELETE_SELECTED_CONFIRMATION.MESSAGE`, {
        count: selectedItemsIds.value.length,
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
