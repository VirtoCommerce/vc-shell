<template>
  <VcBlade
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="toolbarComputed"
    :title="model?.settings.titleTemplate"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      v-bind="tableScope"
      state-key="123"
      :items="bladeDetails"
      multiselect
      :sort="sort"
      :pages="pages"
      :current-page="currentPage"
      :search-value="searchValue"
      :selected-item-id="selectedItemId"
      :total-label="$t('PRODUCTS.PAGES.LIST.TABLE.TOTALS')"
      :total-count="totalCount"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @selection-changed="onSelectionChanged"
      @header-click="onHeaderClick"
      @search:change="onSearchList"
      @scroll:ptr="reload"
    >
      <!-- Not found template -->
      <template #notfound>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <img :src="emptyImage" />
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("DYNAMIC.PAGES.LIST.NOT_FOUND.EMPTY") }}
          </div>
          <VcButton @click="resetSearch">{{ $t("DYNAMIC.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>
<script setup lang="ts">
import { Ref, computed, inject, markRaw, onMounted, ref, unref, watch } from "vue";
import {
  type ITableColumns,
  useBladeNavigation,
  usePopup,
  useFunctions,
  IBladeToolbar,
  BladeConstructor,
} from "@vc-shell/framework";
import { useDynamicList } from "../composables";
import { useI18n } from "vue-i18n";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";
import { DynamicData } from "../types";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  model: DynamicData;
  detailsComponent: BladeConstructor;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:children"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const { t } = useI18n({ useScope: "global" });
const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { debounce } = useFunctions();
const emit = defineEmits<Emits>();
const allSelected = ref(false);
const searchValue = ref();
const selectedItemId = ref();
const sort = ref("createdDate:DESC");
const selectedIds = ref<string[]>([]);
const isDesktop = inject<Ref<boolean>>("isDesktop");
const { loadBladeData, deleteItems, bladeDetails, loading, totalCount, pages, currentPage, searchQuery } =
  useDynamicList(props.model.settings.composable);

const toolbarDefaults = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("PRODUCTS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      removeItems();
    },
    disabled: computed(() => !selectedIds.value?.length),
    isVisible: isDesktop,
  },
]);

const toolbarOptions = ref<IBladeToolbar[]>([
  {
    id: "add",
    icon: "fas fa-plus",
    async clickHandler() {
      openBlade({
        blade: markRaw(props.detailsComponent),
      });
    },
  },
]);

onMounted(async () => {
  await loadBladeData({ sort: sort.value });
});

watch(sort, async (value) => {
  await loadBladeData({ ...searchQuery.value, sort: value });
});

watch(
  () => props.param,
  () => {
    selectedItemId.value = props.param;
  },
  { immediate: true }
);
const tableData = props.model.content.find((type) => type.type === "grid");
const tableScope = typeof tableData.columns !== "number" && {
  columns: tableData?.columns as ITableColumns[],
};

const onItemClick = (item: { id: string }) => {
  openBlade({
    blade: markRaw(props.detailsComponent),

    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

const onSelectionChanged = (items: typeof bladeDetails) => {
  console.log(items);
  const item = unref(items)
    .map((item) => item.id)
    .filter((x): x is string => x !== null);

  selectedIds.value = item;
};

async function removeItems() {
  if (
    await showConfirmation(
      t("DYNAMIC.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.MESSAGE", {
        count: allSelected.value
          ? t("DYNAMIC.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.ALL", { totalCount: totalCount.value })
          : selectedIds.value.length,
      })
    )
  ) {
    emit("close:children");
    await deleteItems(allSelected.value, selectedIds.value);
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

const reload = async () => {
  console.debug(`${props.model.settings.moduleName} list reload`);
  selectedIds.value = [];
  if (searchQuery.value.take) {
    await loadBladeData({
      ...searchQuery.value,
      skip: (currentPage.value - 1) * searchQuery.value.take,
      sort: sort.value,
    });
  }
};

const onPaginationClick = async (page: number) => {
  if (searchQuery.value.take) {
    await loadBladeData({
      ...searchQuery.value,
      skip: (page - 1) * searchQuery.value.take,
    });
  }
};

const toolbarComputed = computed((): IBladeToolbar[] => {
  const optional = props.model.settings.toolbar
    .map((item) => {
      const tool = toolbarOptions.value.find((x) => x.id === item.id);
      if (tool) {
        return {
          ...tool,
          title: item.title,
        };
      }
    })
    .filter((x) => x);

  return toolbarDefaults.value.concat(optional);
});

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
const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadBladeData({
    ...searchQuery.value,
    keyword,
  });
}, 1000);

async function resetSearch() {
  searchValue.value = "";
  await loadBladeData({
    ...searchQuery.value,
    keyword: "",
  });
}

defineExpose({
  reload,
});
</script>
