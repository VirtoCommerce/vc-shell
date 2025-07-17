<template>
  <VcBlade
    :title="$t('{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TITLE')"
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
      :pages="pages"
      :total-count="totalCount"
      :search-value="searchValue"
      :current-page="currentPage"
      :search-placeholder="$t('{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TABLE.TOTALS')"
      :selected-item-id="selectedItemId"
      state-key="{{ModuleNameUppercaseSnakeCase}}"
      :items="data"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
    >
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, ref, markRaw, onMounted, watch } from "vue";
import { IBladeToolbar, IParentCallArgs, ITableColumns, useBladeNavigation, useTableSort } from "@vc-shell/framework";
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

const { sortExpression, handleSortChange: tableSortHandler } = useTableSort({
  initialDirection: "DESC",
  initialProperty: "createdDate",
});

const { getItems, data, loading, totalCount, pages, currentPage, searchQuery } = use{{ModuleNamePascalCase}}List({
  sort: sortExpression.value,
  pageSize: 20,
});

const searchValue = ref();
const selectedItemId = ref<string>();

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
]);

const columns = ref<ITableColumns[]>([
  // You can add columns here
]);

const title = computed(() => t("{{ModuleNameUppercaseSnakeCase}}.PAGES.LIST.TITLE"));

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
