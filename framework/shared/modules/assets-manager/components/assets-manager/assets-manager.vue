<template>
  <VcBlade
    :title="bladeTitle"
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
      class="tw-relative tw-h-full tw-flex-1"
      @dragover.prevent.stop="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent.stop="onDrop"
    >
      <!-- @vue-generic {ICommonAsset} -->
      <VcTable
        :columns="columns"
        :expanded="expanded"
        state-key="assets_manager"
        :reorderable-rows="!readonly"
        :items="defaultAssets"
        :header="false"
        :footer="false"
        :item-action-builder="!readonly ? actionBuilder : undefined"
        :enable-item-actions="!readonly"
        :multiselect="!readonly"
        class="tw-h-full tw-w-full"
        @item-click="onItemClick"
        @row:reorder="sortAssets"
        @selection-changed="onSelectionChanged"
      >
        <!-- Empty template -->
        <template #empty>
          <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
            <template v-if="!readonly">
              <VcIcon
                icon="material-cloud_upload"
                class="tw-text-[100px] tw-text-[color:var(--assets-manager-empty-icon-color)]"
              ></VcIcon>
              <div class="tw-m-4 tw-text-l tw-font-medium tw-text-center">
                {{ t("ASSETS_MANAGER.EMPTY.UPLOAD_ASSETS") }}
              </div>
              <VcButton @click="toggleUploader">{{ t("ASSETS_MANAGER.EMPTY.UPLOAD") }}</VcButton>
            </template>
            <template v-else>
              <div class="tw-m-4 tw-text-l tw-font-medium tw-text-center">
                {{ t("ASSETS_MANAGER.EMPTY.NO_ASSETS") }}
              </div>
            </template>
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
                class="tw-text-[color:var(--assets-manager-thumbnail-color)] tw-text-[38px]"
              ></VcIcon>
            </template>
          </div>
        </template>

        <!-- Override order column -->
        <template #item_sortOrder="{ item }">
          <div>
            {{ item.sortOrder }}
          </div>
        </template>

        <!-- Mobile -->
        <template #mobile-item="{ item }">
          <div
            class="tw-border-b tw-border-solid tw-border-b-[--assets-manager-mobile-border] tw-p-3 tw-flex tw-flex-nowrap"
          >
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
                  class="tw-text-[color:var(--assets-manager-thumbnail-color)] tw-w-12 tw-text-[48px]"
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
import { ref, computed, onMounted, unref, watch, Ref } from "vue";
import { useI18n } from "vue-i18n";
import moment from "moment";
import { isImage, getFileThumbnail, readableSize } from "./../../../../utilities/assets";
import * as _ from "lodash-es";
import { IParentCallArgs, useBladeNavigation } from "../../../../components";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options: {
    title?: string;
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

defineEmits<Emits>();

defineOptions({
  name: "AssetsManager",
});

const { t } = useI18n({ useScope: "global" });

const defaultAssets = ref<ICommonAsset[]>([]);

const bladeTitle = computed(() => props.options.title || t("ASSETS_MANAGER.TITLE"));

const isDragging = ref(false);
const uploader = ref();
const selectedItems: Ref<ICommonAsset[]> = ref([]);
const readonly = computed(() => props.options.disabled);
let assetsCopy: ICommonAsset[];
const modified = ref(false);

const { openBlade, resolveBladeByName } = useBladeNavigation();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "add",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.ADD")),
    icon: "material-add",
    clickHandler() {
      toggleUploader();
    },
    disabled: computed(() => readonly.value),
    isVisible: computed(() => !readonly.value),
  },
  {
    id: "delete",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.DELETE")),
    icon: "material-delete",
    async clickHandler() {
      if (props.options.assetsRemoveHandler && typeof props.options.assetsRemoveHandler === "function") {
        defaultAssets.value = await props.options.assetsRemoveHandler(selectedItems.value);
      }
    },
    disabled: computed(() => !selectedItems.value.length || readonly.value),
    isVisible: computed(() => !readonly.value),
  },
]);

const columns = ref<ITableColumns[]>([
  {
    id: "url",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.IMAGE")),
    width: "10%",
    alwaysVisible: true,
  },
  {
    id: "name",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.NAME")),
    width: "20%",
    alwaysVisible: true,
  },
  {
    id: "size",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.SIZE")),
    width: "20%",
    alwaysVisible: true,
  },
  {
    id: "sortOrder",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.SORT_ORDER")),
    width: "25%",
    alwaysVisible: true,
  },
  {
    id: "createdDate",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.CREATED_DATE")),
    width: "25%",
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
      try {
        await upload(fileList);
      } catch (error) {
        console.error(error);
        throw error;
      }

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
    const uploadedFiles: File[] = [];
    const existingImageNames = defaultAssets.value.map((asset) => asset.name);

    Array.from(files).forEach((file: File) => {
      let fileName = file.name;

      if (existingImageNames.includes(fileName)) {
        let index = 1;
        const baseName = fileName.replace(/\.[^/.]+$/, "");

        while (existingImageNames.includes(fileName)) {
          fileName = `${baseName}_${index}.${file.name.split(".").pop()}`;
          index++;
        }
      }

      const modifiedFile = new File([file], fileName, { type: file.type });

      uploadedFiles.push(modifiedFile);
    });

    const modifiedFileList = new DataTransfer();
    uploadedFiles.forEach((file) => {
      modifiedFileList.items.add(file);
    });
    if (props.options.assetsUploadHandler && typeof props.options.assetsUploadHandler === "function")
    try {
      defaultAssets.value = await props.options.assetsUploadHandler(modifiedFileList.files);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

async function inputUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const fileList = target.files;

  if (fileList && fileList.length) {
    try {
      await upload(fileList);
    } catch (error) {
      console.error(error);
      throw error;
    }

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
    icon: "material-delete",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.DELETE")),
    type: "danger",
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

<style lang="scss">
:root {
  --assets-manager-empty-icon-color: var(--primary-400);
  --assets-manager-thumbnail-color: var(--secondary-500);
  --assets-manager-mobile-border: var(--info-100);
}
</style>
