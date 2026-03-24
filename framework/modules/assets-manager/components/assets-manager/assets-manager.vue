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
      v-loading="isLoading"
      class="tw-relative tw-h-full tw-flex-1"
      @dragover.prevent.stop="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent.stop="onDrop"
    >
      <!-- @vue-generic {AssetLike} -->
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
                icon="lucide-cloud-upload"
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
                    {{ item.createdDate && formatDateRelative(item.createdDate) }}
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
import type { AssetLike, UseAssetsManagerReturn } from "@core/composables/useAssetsManager";
import { IActionBuilderResult, IBladeToolbar, ITableColumns } from "@core/types";
import { ref, computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import { formatDateRelative } from "@core/utilities/date";
import { isImage, getFileThumbnail, readableSize } from "@core/utilities/assets";
import type { IParentCallArgs } from "@core/blade-navigation/types";
import { useBlade } from "@core/composables/useBlade";
import { createLogger } from "@core/utilities";

const logger = createLogger("assets-manager");

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options: {
    title?: string;
    manager: UseAssetsManagerReturn;
    disabled?: boolean;
    hiddenFields?: string[];
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

defineBlade({
  name: "AssetsManager",
});

const { t } = useI18n({ useScope: "global" });

const {
  items: defaultAssets,
  upload: managerUpload,
  removeMany,
  reorder: managerReorder,
  updateItem,
  loading: managerLoading,
} = props.options.manager;

const isLoading = computed(() => managerLoading.value);

const bladeTitle = computed(() => props.options.title || t("ASSETS_MANAGER.TITLE"));

const isDragging = ref(false);
const uploader = ref();
const selectedItems = ref<AssetLike[]>([]);
const readonly = computed(() => props.options.disabled);

const { openBlade } = useBlade();

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "add",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.ADD")),
    icon: "lucide-plus",
    clickHandler() {
      toggleUploader();
    },
    disabled: computed(() => readonly.value),
    isVisible: computed(() => !readonly.value),
  },
  {
    id: "delete",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    async clickHandler() {
      await removeMany(selectedItems.value);
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

async function sortAssets(event: { dragIndex: number; dropIndex: number; value: AssetLike[] }) {
  if (event.dragIndex !== event.dropIndex) {
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index;
      return item;
    });

    managerReorder(sorted);
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
        logger.error("Failed to upload dropped files:", error);
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

    try {
      await managerUpload(modifiedFileList.files);
    } catch (error) {
      logger.error("Failed to upload assets:", error);
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
      logger.error("Failed to upload files:", error);
      throw error;
    }
  }
}

function onItemClick(item: AssetLike) {
  openBlade({
    name: "AssetsDetails",
    options: {
      asset: unref(item),
      disabled: readonly.value,
      hiddenFields: props.options.hiddenFields,
      assetEditHandler: (asset: AssetLike) => {
        updateItem(asset);
      },
      assetRemoveHandler: async (asset: AssetLike) => {
        await props.options.manager.remove(asset);
      },
    },
  }).catch((error) => {
    logger.error("Failed to open AssetsDetails blade:", error);
  });
}

const onSelectionChanged = (items: AssetLike[]) => {
  selectedItems.value = items;
};

const actionBuilder = (): IActionBuilderResult<AssetLike>[] => {
  const result: IActionBuilderResult<AssetLike>[] = [];

  result.push({
    icon: "lucide-trash-2",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.DELETE")),
    type: "danger",
    async clickHandler(item: AssetLike) {
      await props.options.manager.remove(item);
      selectedItems.value = [];
    },
  });

  return result;
};
</script>

<style lang="scss">
:root {
  --assets-manager-empty-icon-color: var(--primary-400);
  --assets-manager-thumbnail-color: var(--secondary-500);
  --assets-manager-mobile-border: var(--info-100);
}
</style>
