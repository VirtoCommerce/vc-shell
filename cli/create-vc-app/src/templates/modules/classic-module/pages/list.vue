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
      :sort="sort"
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
import { IBladeEvent, IBladeToolbar, IParentCallArgs, ITableColumns, useBladeNavigation } from "@vc-shell/framework";
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
  (event: "open:blade", blade: IBladeEvent): void;
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
const { getItems, data, loading, totalCount, pages, currentPage } = use{{ModuleNamePascalCase}}List();

const sort = ref("createdDate:DESC");
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
  await getItems();
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
  await getItems();
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

defineExpose({
  title,
});
</script>
