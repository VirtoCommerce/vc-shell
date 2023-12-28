<template>
  <VcBlade
    :title="$t('MODULE.PAGES.LIST.TITLE')"
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
      :empty="empty"
      :notfound="notfound"
      class="tw-grow tw-basis-0"
      :multiselect="true"
      :loading="loading"
      :columns="columns"
      :item-action-builder="actionBuilder"
      :sort="sort"
      :pages="pages"
      :total-count="totalCount"
      :search-value="searchValue"
      :current-page="currentPage"
      :search-placeholder="$t('MODULE.PAGES.LIST.SEARCH.PLACEHOLDER')"
      :total-label="$t('MODULE.PAGES.LIST.TABLE.TOTALS')"
      :selected-item-id="selectedItemId"
      state-key="module"
      :items="data"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
    >
      <template #mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
          <div class="tw-w-full tw-flex tw-justify-evenly tw-mb-2">
            <VcImage
              class="tw-shrink-0"
              aspect="1x1"
              size="s"
              :bordered="true"
              :src="itemData.item.imgSrc"
            ></VcImage>
            <div class="tw-grow tw-basis-0 tw-ml-3">
              <div class="tw-font-bold tw-text-lg">
                {{ itemData.item.name }}
              </div>
            </div>
          </div>
          <div class="tw-truncate tw-grow-[2] tw-basis-0">
            <VcHint>{{ $t("MODULE.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
            <div class="tw-truncate tw-mt-1">
              {{ itemData.item.createdDate }}
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, inject, reactive, ref, markRaw, onMounted, watch } from "vue";
import {
  IBladeEvent,
  IBladeToolbar,
  IParentCallArgs,
  IActionBuilderResult,
  ITableColumns,
  useBladeNavigation,
} from "@vc-shell/framework";
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";
import { useI18n } from "vue-i18n";
import { useList } from "./../composables";
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
  url: "/classic-module-list",
  name: "ClassicModuleList",
  isWorkspace: true,
  menuItem: {
    title: "MODULE.MENU.TITLE",
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
const { getItems, data, loading, totalCount, pages, currentPage } = useList();

const sort = ref("createdDate:DESC");
const searchValue = ref();
const selectedItemId = ref<string>();

watch(
  () => props.param,
  (newVal) => {
    if (newVal) {
      selectedItemId.value = newVal;

      openBlade({
        blade: markRaw(Details),
        param: newVal,
        onOpen() {
          selectedItemId.value = newVal;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
      });
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await getItems();
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("MODULE.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "imgSrc",
    title: computed(() => t("MODULE.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")),
    width: 60,
    alwaysVisible: true,
    type: "image",
  },
  {
    id: "name",
    field: "name",
    title: computed(() => t("MODULE.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("MODULE.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: 140,
    type: "date-ago",
  },
]);

const empty = reactive({
  image: emptyImage,
  text: computed(() => t("MODULE.PAGES.LIST.TABLE.EMPTY.TITLE")),
  action: computed(() => t("MODULE.PAGES.LIST.TABLE.EMPTY.ACTION")),
  // clickHandler: () => {},
});

const notfound = reactive({
  image: emptyImage,
  text: computed(() => t("MODULE.PAGES.LIST.TABLE.NOT_FOUND.TITLE")),
  action: computed(() => t("MODULE.PAGES.LIST.TABLE.NOT_FOUND.ACTION")),
  clickHandler: async () => {
    searchValue.value = "";
  },
});

const columns = computed(() => {
  if (props.expanded) {
    return tableColumns.value;
  } else {
    return tableColumns.value.filter((item) => item.alwaysVisible === true);
  }
});

const title = computed(() => t("MODULE.PAGES.LIST.TITLE"));

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

const actionBuilder = (item: (typeof data.value)[number]): IActionBuilderResult[] => {
  const result = [];

  result.push({
    icon: "fas fa-trash",
    title: "Delete",
    variant: "danger",
    leftActions: true,
    clickHandler() {
      throw new Error("Function is not implemented.");
    },
  });

  return result;
};

defineExpose({
  title,
});
</script>
