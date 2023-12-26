<template>
  <VcBlade
    :title="t('ASSETS_MANAGER.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    width="70%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <div
      v-loading="options?.loading"
      class="tw-relative tw-h-full"
      @dragover.prevent.stop="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent.stop="onDrop"
    >
      <VcTable
        :columns="columns"
        :expanded="expanded"
        state-key="assets_manager"
        :reorderable-rows="!readonly"
        :items="defaultAssets"
        :header="false"
        :footer="false"
        :item-action-builder="!readonly ? actionBuilder : undefined"
        :multiselect="!readonly"
        class="tw-h-full tw-w-full"
        @item-click="onItemClick"
        @row:reorder="sortAssets"
        @selection-changed="onSelectionChanged"
      >
        <!-- Empty template -->
        <template #empty>
          <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
            <VcIcon
              icon="fas fa-cloud-upload-alt"
              class="tw-text-[100px] tw-text-[#41afe6]"
            ></VcIcon>
            <div class="tw-m-4 tw-text-xl tw-font-medium">
              {{ t("ASSETS_MANAGER.EMPTY.NO_ASSETS") }}
            </div>
            <VcButton @click="toggleUploader">{{ t("ASSETS_MANAGER.EMPTY.UPLOAD") }}</VcButton>
          </div>
        </template>

        <!-- Override size column -->
        <template #item_size="{ item }">
          <div>
            {{ readableSize(item.size ?? 0) }}
          </div>
        </template>

        <!-- Override url column -->
        <template #item_url="{ item }">
          <div class="tw-flex tw-items-center tw-justify-center">
            <template v-if="isImage(item.name ?? '')">
              <VcImage
                :bordered="true"
                size="s"
                aspect="1x1"
                :src="item.url"
                background="contain"
              ></VcImage>
            </template>
            <template v-else>
              <VcIcon
                :icon="getFileThumbnail(item.name ?? '')"
                class="tw-text-[#a9bfd2] tw-text-[38px]"
              ></VcIcon>
            </template>
          </div>
        </template>

        <!-- Overide order column -->
        <template #item_sortOrder="{ item }">
          <div>
            {{ item.sortOrder }}
          </div>
        </template>

        <!-- Mobile -->
        <template #mobile-item="{ item }">
          <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-flex tw-flex-nowrap">
            <template v-if="isImage(item.name ?? '')">
              <VcImage
                :bordered="true"
                size="s"
                aspect="1x1"
                :src="item.url"
                background="contain"
              ></VcImage>
            </template>
            <template v-else>
              <div class="tw-w-12 tw-flex tw-items-center tw-justify-center">
                <VcIcon
                  :icon="getFileThumbnail(item.name ?? '')"
                  class="tw-text-[#a9bfd2] tw-w-12 tw-text-[48px]"
                ></VcIcon>
              </div>
            </template>
            <div class="tw-grow tw-basis-0 tw-ml-3 tw-truncate">
              <div class="tw-font-bold tw-text-lg tw-truncate">
                {{ item.name }}
              </div>
              <div class="tw-mt-3 tw-w-full tw-flex tw-justify-between">
                <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                  <VcHint>{{ t("ASSETS_MANAGER.TABLE.HEADER.SIZE") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ readableSize(item.size ?? 0) }}
                  </div>
                </div>
                <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                  <VcHint>{{ t("ASSETS_MANAGER.TABLE.HEADER.CREATED_DATE") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ item.createdDate && moment(item.createdDate).fromNow() }}
                  </div>
                </div>
                <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                  <VcHint>{{ t("ASSETS_MANAGER.TABLE.HEADER.SORT_ORDER") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ item.sortOrder }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </VcTable>
    </div>

    <input
      ref="uploader"
      type="file"
      hidden
      multiple
      name="assets_manager"
      @change="inputUpload"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ICommonAsset, IActionBuilderResult, IBladeToolbar, ITableColumns } from "../../../../../core/types";
import { ref, computed, onMounted, unref, watch, markRaw, Ref } from "vue";
import { useI18n } from "vue-i18n";
import moment from "moment";
import { isImage, getFileThumbnail, readableSize } from "./../../../../utilities/assets";
import * as _ from "lodash-es";
import { IParentCallArgs, useBladeNavigation } from "../../../../components";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options: {
    assets: ICommonAsset[];
    loading: Ref<boolean>;
    assetsEditHandler: (assets: ICommonAsset[]) => ICommonAsset[];
    assetsUploadHandler: (files: FileList) => Promise<ICommonAsset[]>;
    assetsRemoveHandler: (assets: ICommonAsset[]) => Promise<ICommonAsset[]>;
    disabled: boolean;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "AssetsManager",
});

const { t } = useI18n({ useScope: "global" });

const defaultAssets = ref<ICommonAsset[]>([]);

const isDragging = ref(false);
const uploader = ref();
const selectedItems: Ref<ICommonAsset[]> = ref([]);
const readonly = computed(() => props.options.disabled);
let assetsCopy: ICommonAsset[];
const modified = ref(false);

const { openBlade, resolveBladeByName } = useBladeNavigation();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    clickHandler() {
      emit("close:blade");
    },
    disabled: computed(() => !modified.value || readonly.value),
  },
  {
    id: "add",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    clickHandler() {
      toggleUploader();
    },
    disabled: computed(() => readonly.value),
  },
  {
    id: "delete",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    async clickHandler() {
      if (props.options.assetsRemoveHandler && typeof props.options.assetsRemoveHandler === "function") {
        defaultAssets.value = await props.options.assetsRemoveHandler(selectedItems.value);
      }
    },
    disabled: computed(() => !selectedItems.value.length || readonly.value),
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "url",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.IMAGE")),
    width: "60px",
    alwaysVisible: true,
  },
  {
    id: "name",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.NAME")),
    width: "120px",
    alwaysVisible: true,
  },
  {
    id: "size",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.SIZE")),
    width: "100px",
    alwaysVisible: true,
  },
  {
    id: "sortOrder",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.SORT_ORDER")),
    width: "180px",
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.CREATED_DATE")),
    width: "140px",
    alwaysVisible: true,
    type: "date-ago",
  },
]);

watch(
  () => defaultAssets.value,
  (newVal) => {
    modified.value = !_.isEqual(newVal, assetsCopy);
  },
  { deep: true },
);

onMounted(() => {
  defaultAssets.value = props.options?.assets;
  assetsCopy = _.cloneDeep(props.options?.assets);
});

async function sortAssets(event: { dragIndex: number; dropIndex: number; value: ICommonAsset[] }) {
  if (
    props.options.assetsEditHandler &&
    typeof props.options.assetsEditHandler === "function" &&
    event.dragIndex !== event.dropIndex
  ) {
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index;
      return item;
    });

    defaultAssets.value = await props.options.assetsEditHandler(sorted);
  }
}

function dragOver() {
  if (!readonly.value) {
    isDragging.value = true;
  }
}

function dragLeave() {
  if (!readonly.value) {
    isDragging.value = false;
  }
}

async function onDrop(event: DragEvent) {
  if (!readonly.value) {
    const fileList = event.dataTransfer?.files;

    if (fileList && fileList.length) {
      await upload(fileList);
    }
    isDragging.value = false;
  }
}

function toggleUploader() {
  uploader.value.value = "";
  uploader.value.click();
}

async function upload(files: FileList) {
  if (files && files.length) {
    if (props.options.assetsUploadHandler && typeof props.options.assetsUploadHandler === "function")
      defaultAssets.value = await props.options.assetsUploadHandler(files);
  }
}

async function inputUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const fileList = target.files;

  if (fileList && fileList.length) {
    upload(fileList);
  }
}

function onItemClick(item: ICommonAsset) {
  openBlade({
    blade: resolveBladeByName("AssetsDetails"),
    options: {
      asset: unref(item),
      disabled: readonly.value,
      assetEditHandler: (asset: ICommonAsset) => {
        if (props.options.assetsEditHandler && typeof props.options.assetsEditHandler === "function") {
          defaultAssets.value = props.options.assetsEditHandler([asset]);
        } else throw new Error("Asset edit handler is not defined");
      },
      assetRemoveHandler: async (asset: ICommonAsset) => {
        if (props.options.assetsRemoveHandler && typeof props.options.assetsRemoveHandler === "function") {
          defaultAssets.value = await props.options.assetsRemoveHandler([asset]);
        } else throw new Error("Asset remove handler is not defined");
      },
    },
  });
}

const onSelectionChanged = (items: ICommonAsset[]) => {
  selectedItems.value = items;
};

const actionBuilder = (): IActionBuilderResult<ICommonAsset>[] => {
  const result: IActionBuilderResult<ICommonAsset>[] = [];

  result.push({
    icon: "fas fa-edit",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.EDIT")),
    variant: "success",
    clickHandler(item: ICommonAsset) {
      onItemClick(item);
    },
  });

  result.push({
    icon: "fas fa-trash",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.DELETE")),
    variant: "danger",
    leftActions: true,
    async clickHandler(item: ICommonAsset) {
      defaultAssets.value = await props.options.assetsRemoveHandler([item]);
      selectedItems.value = [];
    },
  });

  return result;
};

defineExpose({
  title: t("ASSETS_MANAGER.TITLE"),
});
</script>
