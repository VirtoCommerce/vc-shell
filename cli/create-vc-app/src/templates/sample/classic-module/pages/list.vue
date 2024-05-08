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
  IBladeEvent,
  IBladeToolbar,
  IParentCallArgs,
  ITableColumns,
  useBladeNavigation,
  usePopup,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { useList } from "./../composables";
import Details from "./details.vue";
import { MockedItem } from "../sample-data";

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
  url: "/sample-list",
  name: "SampleList",
  isWorkspace: true,
  menuItem: {
    title: "SAMPLE_APP.MENU.TITLE",
    icon: "fas fa-file-alt",
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
const { getItems, removeItems, data, loading, totalCount, pages, currentPage } = useList();

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref<string>();
const selectedIds = ref<string[]>([]);
const query = ref();

watch(
  () => props.param,
  (newVal) => {
      selectedItemId.value = newVal;
  },
  { immediate: true },
);

onMounted(async () => {
  await reload();
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "remove",
    icon: "fas fa-trash",
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
  await getItems(query.value);
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

const onSelectionChanged = (items: MockedItem[]) => {
  selectedIds.value = items.map((item) => item.id!);
};

const actionBuilder = (): IActionBuilderResult[] => {
  const result: IActionBuilderResult[] = [];
  result.push({
    icon: "fas fa-trash",
    title: computed(() => t("SAMPLE_APP.PAGES.LIST.TABLE.ACTIONS.DELETE")),
    type: "danger",
    position: "left",
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

defineExpose({
  title,
  reload,
});
</script>
