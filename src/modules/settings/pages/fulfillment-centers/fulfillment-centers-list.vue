<template>
  <VcBlade
    :title="title"
    width="70%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    :expandable="false"
    @close="$emit('close:blade')"
  >
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="columns"
      :items="fulfillmentCentersList"
      :sort="sort"
      :pages="pages"
      :current-page="currentPage"
      :total-count="totalCount"
      :header="false"
      :selected-item-id="selectedItemId"
      :pull-to-reload="true"
      state-key="fulfillment_centers_list"
      @header-click="onHeaderClick"
      @item-click="onItemClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
    >
      <template #mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-py-3 tw-px-4">
          <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
            <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
              <VcHint>{{ $t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TABLE.HEADER.NAME") }}</VcHint>
              <div class="tw-truncate tw-mt-1">
                {{ itemData.item.name }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { UserPermissions } from "../../../types";
import { IBladeToolbar, ITableColumns, useBladeNavigation } from "@vc-shell/framework";
import useFulfillmentCenters from "../../composables/useFulfillmentCenters";
import { useI18n } from "vue-i18n";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

defineOptions({
  url: "/fulfillment-centers-list",
  name: "FulfillmentCentersList",
  isWorkspace: true,
  permissions: [UserPermissions.SellerDetailsEdit],
  menuItem: {
    title: "SETTINGS.MENU.FULFILLMENT_CENTERS",
    icon: "fas fa-sliders-h",
    group: "SETTINGS.MENU.TITLE",
    priority: 6,
  },
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

defineEmits<Emits>();
const { openBlade, resolveBladeByName } = useBladeNavigation();
const { t } = useI18n({ useScope: "global" });
const { searchQuery, loading, currentPage, pages, totalCount, fulfillmentCentersList, searchFulfillmentCenters } =
  useFulfillmentCenters();

const sort = ref("createdDate:DESC");
const selectedItemId = ref();
const title = t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TITLE");

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "refresh",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TOOLBAR.REFRESH")),
    icon: "fas fa-sync-alt",
    async clickHandler() {
      await reload();
    },
  },
  {
    id: "addMember",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TOOLBAR.ADD_FULFILLMENT_CENTER")),
    icon: "fas fa-plus",
    clickHandler() {
      openBlade({
        blade: resolveBladeByName("FulfillmentCenterDetails"),
      });
    },
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "name",
    title: computed(() => t("SETTINGS.FULFILLMENT_CENTERS.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    alwaysVisible: true,
  },
]);

watch(sort, async (value) => {
  await searchFulfillmentCenters({ ...searchQuery.value, sort: value });
});

watch(
  () => props.param,
  () => {
    selectedItemId.value = props.param;
  },
  { immediate: true },
);

onMounted(async () => {
  await reload();
});

const reload = async () => {
  await searchFulfillmentCenters({
    ...searchQuery.value,
    skip: (currentPage.value - 1) * (searchQuery.value.take ?? 10),
    sort: sort.value,
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

const onPaginationClick = async (page: number) => {
  await searchFulfillmentCenters({
    ...searchQuery.value,
    skip: (page - 1) * (searchQuery.value.take ?? 10),
  });
};

const onItemClick = (item: { id?: string }) => {
  openBlade({
    blade: resolveBladeByName("FulfillmentCenterDetails"),
    param: item.id,
    onOpen() {
      selectedItemId.value = item.id;
    },
    onClose() {
      selectedItemId.value = undefined;
    },
  });
};

defineExpose({
  reload,
  title,
});
</script>
