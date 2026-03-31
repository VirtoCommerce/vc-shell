<template>
  <VcBlade
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    width="70%"
  >
    <div
      v-loading="isLoading"
      class="tw-relative tw-h-full tw-flex-1"
      @dragover.prevent.stop="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent.stop="onDrop"
    >
      <!-- @vue-generic {AssetLike} -->
      <VcDataTable
        v-model:selection="selectedItems"
        :items="defaultAssets"
        state-key="assets_manager"
        :reorderable-rows="!readonly"
        :selection-mode="!readonly ? 'multiple' : undefined"
        :row-actions="!readonly ? actionBuilder : undefined"
        :empty-state="{
          icon: 'lucide-cloud-upload',
          title: $t('ASSETS_MANAGER.EMPTY.UPLOAD_ASSETS'),
          actionLabel: $t('ASSETS_MANAGER.EMPTY.UPLOAD'),
          actionHandler: toggleUploader,
        }"
        class="tw-h-full tw-w-full"
        @row-click="({ data }) => onItemClick(data)"
        @row-reorder="sortAssets"
      >
        <VcColumn
          id="url"
          :title="t('ASSETS_MANAGER.TABLE.HEADER.IMAGE')"
          width="10%"
          always-visible
        >
          <template #body="{ data }">
            <div class="tw-flex tw-items-center tw-justify-center">
              <template v-if="isImage(data.name ?? '')">
                <VcImage
                  :bordered="true"
                  size="s"
                  aspect="1x1"
                  :src="data.url"
                  background="contain"
                ></VcImage>
              </template>
              <template v-else>
                <div class="assets-manager__file-badge" :style="{ backgroundColor: getExtensionColor(data.name ?? '') }">
                  {{ getExtensionLabel(data.name ?? '') }}
                </div>
              </template>
            </div>
          </template>
        </VcColumn>

        <VcColumn
          id="name"
          :title="t('ASSETS_MANAGER.TABLE.HEADER.NAME')"
          width="20%"
          always-visible
        />

        <VcColumn
          id="size"
          :title="t('ASSETS_MANAGER.TABLE.HEADER.SIZE')"
          width="20%"
          always-visible
        >
          <template #body="{ data }">
            <div>
              {{ readableSize(data.size ?? 0) }}
            </div>
          </template>
        </VcColumn>

        <VcColumn
          id="sortOrder"
          :title="t('ASSETS_MANAGER.TABLE.HEADER.SORT_ORDER')"
          width="25%"
          always-visible
        >
          <template #body="{ data }">
            <div>
              {{ data.sortOrder }}
            </div>
          </template>
        </VcColumn>

        <VcColumn
          id="createdDate"
          :title="t('ASSETS_MANAGER.TABLE.HEADER.CREATED_DATE')"
          width="25%"
          type="date-ago"
          always-visible
        />
      </VcDataTable>
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
import { IBladeToolbar } from "@core/types";
import { ref, computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import { formatDateRelative } from "@core/utilities/date";
import { isImage, readableSize, getExtensionColor, getExtensionLabel } from "@core/utilities/assets";
import { useBlade } from "@core/composables/useBlade";
import { createLogger } from "@core/utilities";
import { TableAction } from "@ui/components/organisms/vc-data-table/types";

const logger = createLogger("assets-manager");

interface AssetsManagerOptions {
  title?: string;
  manager: UseAssetsManagerReturn;
  disabled?: boolean;
  hiddenFields?: string[];
}

defineBlade({
  name: "AssetsManager",
});

const { options, openBlade } = useBlade<AssetsManagerOptions>();

const { t } = useI18n({ useScope: "global" });

const manager = computed(() => options.value!.manager);

const defaultAssets = computed(() => manager.value.items.value ?? []);

const isLoading = computed(() => manager.value.loading.value);

const bladeTitle = computed(() => options.value?.title || t("ASSETS_MANAGER.TITLE"));

const isDragging = ref(false);
const uploader = ref();
const selectedItems = ref<AssetLike[]>([]);
const readonly = computed(() => options.value?.disabled);

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
      await manager.value.removeMany(selectedItems.value);
    },
    disabled: computed(() => !selectedItems.value.length || readonly.value),
    isVisible: computed(() => !readonly.value),
  },
]);

async function sortAssets(event: { dragIndex: number; dropIndex: number; value: AssetLike[] }) {
  if (event.dragIndex !== event.dropIndex) {
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index;
      return item;
    });

    manager.value.reorder(sorted);
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
  if (!files || files.length === 0) return;

  const existingNames = new Set((defaultAssets.value ?? []).map((asset) => asset.name).filter(Boolean));

  const transfer = new DataTransfer();
  for (const file of Array.from(files)) {
    let fileName = file.name;

    if (existingNames.has(fileName)) {
      const ext = fileName.includes(".") ? `.${fileName.split(".").pop()}` : "";
      const base = fileName.slice(0, fileName.length - ext.length);
      let i = 1;
      while (existingNames.has(fileName)) {
        fileName = `${base}_${i}${ext}`;
        i++;
      }
    }

    existingNames.add(fileName);
    transfer.items.add(new File([file], fileName, { type: file.type }));
  }

  try {
    const maxSortOrder = defaultAssets.value.reduce((max, asset) => Math.max(max, asset.sortOrder ?? 0), -1);
    await manager.value.upload(transfer.files, maxSortOrder);
  } catch (error) {
    logger.error("Failed to upload assets:", error);
    throw error;
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
      hiddenFields: options.value?.hiddenFields,
      assetEditHandler: (asset: AssetLike) => {
        manager.value.updateItem(asset);
      },
      assetRemoveHandler: async (asset: AssetLike) => {
        await manager.value.remove(asset);
      },
    },
  }).catch((error) => {
    logger.error("Failed to open AssetsDetails blade:", error);
  });
}

const actionBuilder = (): TableAction[] => {
  return [
    {
      icon: "lucide-trash-2",
      title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.DELETE")),
      type: "danger",
      async clickHandler(item: AssetLike) {
        await manager.value.remove(item);
        selectedItems.value = [];
      },
    },
  ];
};
</script>

<style lang="scss">
:root {
  --assets-manager-empty-icon-color: var(--primary-400);
  --assets-manager-mobile-border: var(--info-100);
}

.assets-manager__file-badge {
  @apply tw-flex tw-items-center tw-justify-center;
  @apply tw-px-2.5 tw-py-1;
  @apply tw-rounded;
  @apply tw-text-xs tw-font-bold tw-tracking-wide;
  @apply tw-text-white;
}
</style>
