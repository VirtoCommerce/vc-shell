<template>
  <VcBlade
    :title="$t('VIDEOS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="50%"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <!-- Blade contents -->
    <VcTable
      class="tw-grow tw-basis-0"
      :loading="loading"
      :expanded="expanded"
      :columns="tableColumns"
      :header="false"
      :items="defaultVideos"
      :item-action-builder="actionBuilder"
      multiselect
      :sort="sort"
      :pages="pages"
      :current-page="currentPage"
      :total-label="$t('VIDEOS.PAGES.LIST.TABLE.TOTALS')"
      :search-value="searchValue"
      :selected-item-id="selectedItemId"
      :total-count="totalCount"
      state-key="videos_list"
      :reorderable-rows="true"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @scroll:ptr="reload"
      @selection-changed="onSelectionChanged"
      @row:reorder="sortVideos"
    >
      <!-- Empty template -->
      <template #empty>
        <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
          <VcIcon
            class="vc-widget__icon"
            icon="fas fa-film"
            size="xxxl"
          ></VcIcon>
          <div class="tw-m-4 tw-text-xl tw-font-medium">
            {{ $t("VIDEOS.PAGES.LIST.EMPTY.NO_VIDEOS") }}
          </div>
          <VcButton @click="addVideo">{{ $t("VIDEOS.PAGES.LIST.EMPTY.ADD") }}</VcButton>
        </div>
      </template>

      <!-- Override name column template -->
      <template #item_name="itemData">
        <div class="tw-flex tw-flex-col">
          <div class="tw-truncate">
            {{ itemData.item.name }}
          </div>
          <VcHint class="tw-truncate tw-mt-1">
            {{ itemData.item.contentUrl }}
          </VcHint>
        </div>
      </template>

      <template #mobile-item="itemData">
        <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-flex tw-flex-nowrap">
          <VcImage
            class="tw-shrink-0"
            aspect="1x1"
            size="m"
            :bordered="true"
            :src="itemData.item.thumbnailUrl"
          />
          <div class="tw-grow tw-basis-0 tw-ml-3">
            <div class="tw-font-bold tw-text-lg">
              {{ itemData.item.name }}
            </div>
            <VcHint class="tw-mt-1">{{ itemData.item.contentUrl }}</VcHint>

            <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
              <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                <VcHint>{{ $t("VIDEOS.PAGES.LIST.MOBILE.CREATED") }}</VcHint>
                <div class="tw-truncate tw-mt-1">
                  {{ itemData.item.createdDate && moment(itemData.item.createdDate).fromNow() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, inject, markRaw, Ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  IBladeToolbar,
  IActionBuilderResult,
  ITableColumns,
  useBladeNavigation,
  usePopup,
  IParentCallArgs,
} from "@vc-shell/framework";
import { IVideo } from "@vc-shell/framework/core/api/catalog";
import moment from "moment";
import { useVideos } from "../composables";
import { VideosEdit } from "./";
import * as _ from "lodash-es";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
  (event: "close:children"): void;
}

defineOptions({
  url: "/videos",
  scope: {},
});

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();
const { openBlade } = useBladeNavigation();
const { showConfirmation } = usePopup();
const { t } = useI18n({ useScope: "global" });

const isDesktop = inject<Ref<boolean>>("isDesktop");

const { videos, totalCount, pages, currentPage, searchVideos, saveVideos, deleteVideos, loading } = useVideos();

const sort = ref("sortOrder:ASC");
const searchValue = ref();
const selectedItemId = ref();
const selectedVideosIds = ref([]);
const defaultVideos = ref<IVideo[]>();
const modified = ref(false);

watch(sort, async (value) => {
  await searchVideos({ ownerIds: [value], sort: value });
});

watch(
  () => defaultVideos.value,
  (newVal) => {
    modified.value = !_.isEqual(newVal, videos.value);
  },
  { deep: true }
);

onMounted(async () => {
  await reload();
});

const reload = async () => {
  console.debug("Videos list reload");
  selectedVideosIds.value = [];
  await searchVideos({
    ownerIds: [props.param ?? ""],
    skip: (currentPage.value - 1) * 20,
    sort: sort.value,
  });
  defaultVideos.value = videos.value;
  emit("parent:call", {
    method: "reload",
    args: true,
  });
};

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("VIDEOS.PAGES.LIST.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    async clickHandler() {
      await saveVideos(defaultVideos.value);
      await reload();
    },
    disabled: computed(() => !modified.value),
  },
  {
    id: "add",
    title: computed(() => t("VIDEOS.PAGES.LIST.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    async clickHandler() {
      addVideo();
    },
  },
  {
    id: "deleteSelected",
    title: computed(() => t("VIDEOS.PAGES.LIST.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      await deleteSelectedVideos();
    },
    disabled: computed(() => !selectedVideosIds.value?.length),
    isVisible: isDesktop,
  },
]);

const tableColumns = ref<ITableColumns[]>([
  {
    id: "thumbnailUrl",
    title: computed(() => t("VIDEOS.PAGES.LIST.TABLE.HEADER.THUMBNAIL")),
    width: "60px",
    type: "image",
    alwaysVisible: true,
  },
  {
    id: "name",
    title: computed(() => t("VIDEOS.PAGES.LIST.TABLE.HEADER.NAME")),
    sortable: true,
    width: "300px",
    alwaysVisible: true,
  },
  {
    id: "sortOrder",
    title: computed(() => t("VIDEOS.PAGES.LIST.TABLE.HEADER.SORT_ORDER")),
    width: "100px",
    sortable: true,
  },
  {
    id: "uploadDate",
    title: computed(() => t("VIDEOS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    width: "140px",
    sortable: true,
    type: "date-ago",
    alwaysVisible: true,
  },
]);

const onItemClick = (item: IVideo) => {
  openBlade({
    blade: markRaw(VideosEdit),
    options: { video: item, isNew: false, productId: props.param ?? "" },
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

const onPaginationClick = async (page: number) => {
  await searchVideos({
    ownerIds: [props.param ?? ""],
    skip: (page - 1) * 20,
  });
};

const onSelectionChanged = (items: IVideo[]) => {
  selectedVideosIds.value = items.map((item) => item.id);
};

function sortVideos(event: { dragIndex: number; dropIndex: number; value: IVideo[] }) {
  if (event.dragIndex !== event.dropIndex) {
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index;
      return item;
    });
    defaultVideos.value = sorted;
  }
}

const actionBuilder = (): IActionBuilderResult[] => {
  const result = [];
  result.push({
    icon: "fas fa-trash",
    title: computed(() => t("VIDEOS.PAGES.LIST.ACTIONS.DELETE")),
    variant: "danger",
    leftActions: true,
    async clickHandler(item: IVideo) {
      selectedVideosIds.value = [item.id];
      await deleteSelectedVideos();
    },
  });
  return result;
};

async function deleteSelectedVideos() {
  if (
    await showConfirmation(
      t("VIDEOS.PAGES.LIST.DELETE_SELECTED_CONFIRMATION.MESSAGE", {
        count: selectedVideosIds.value.length,
      })
    )
  ) {
    emit("close:children");
    await deleteVideos(selectedVideosIds.value);
    await reload();
  }
}

function addVideo() {
  openBlade({
    blade: markRaw(VideosEdit),
    options: { video: null, isNew: true, productId: props.param ?? "" },
  });
}

defineExpose({
  reload,
});
</script>
