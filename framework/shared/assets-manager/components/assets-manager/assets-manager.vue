<template>
  <VcBlade
    :title="$t('ASSETS_MANAGER.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <div
      class="tw-relative tw-h-full"
      @dragover.stop.prevent="dragOver"
      @dragleave.stop.prevent="dragLeave"
      @drag.stop.prevent
      @dragstart.stop.prevent
      @dragend.stop.prevent
      @dragenter.stop.prevent
      @drop.stop.prevent="onDrop"
    >
      <VcLoading :active="loading"></VcLoading>
      <VcTable
        :columns="columns"
        :expanded="expanded"
        stateKey="assets_manager"
        :reorderableRows="!options.disabled"
        :items="defaultAssets"
        :header="false"
        :footer="false"
        :itemActionBuilder="actionBuilder"
        multiselect
        class="tw-h-full tw-w-full"
        @item-click="onItemClick"
        @row:reorder="sortAssets"
        @selectionChanged="onSelectionChanged"
      >
        <!-- Empty template -->
        <template v-slot:empty>
          <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
            <VcIcon
              icon="fas fa-cloud-upload-alt"
              class="tw-text-[100px] tw-text-[#41afe6]"
            ></VcIcon>
            <div class="tw-m-4 tw-text-xl tw-font-medium">
              {{ $t("ASSETS_MANAGER.EMPTY.NO_ASSETS") }}
            </div>
            <VcButton @click="toggleUploader">{{ $t("ASSETS_MANAGER.EMPTY.UPLOAD") }}</VcButton>
          </div>
        </template>

        <!-- Override size column -->
        <template v-slot:item_size="{ item }">
          <div>
            {{ readableSize(item.size) }}
          </div>
        </template>

        <!-- Override url column -->
        <template v-slot:item_url="{ item }">
          <div class="tw-flex tw-items-center tw-justify-center">
            <template v-if="isImage(item)">
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
                :icon="getFileThumbnail(item)"
                class="tw-text-[#a9bfd2] tw-text-[38px]"
              ></VcIcon>
            </template>
          </div>
        </template>

        <!-- Mobile -->
        <template v-slot:mobile-item="{ item }">
          <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-flex tw-flex-nowrap">
            <template v-if="isImage(item)">
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
                  :icon="getFileThumbnail(item)"
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
                  <VcHint>{{ $t("ASSETS_MANAGER.TABLE.MOBILE.SIZE") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ readableSize(item.size) }}
                  </div>
                </div>
                <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                  <VcHint>{{ $t("ASSETS_MANAGER.TABLE.MOBILE.MODIFIED_DATE") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ item.modifiedDate && moment(item.modifiedDate).fromNow() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </VcTable>
      <div
        v-if="isDragging"
        class="tw-absolute tw-top-0 tw-bottom-0 tw-h-full tw-w-full tw-z-[1] tw-flex tw-items-center tw-justify-center"
        :class="{
          'tw-backdrop-blur-[3px] tw-bg-[rgba(255, 255, 255, 0.5)] tw-cursor-copy tw-pointer-events-none': isDragging,
        }"
      ></div>

      <input
        ref="uploader"
        type="file"
        hidden
        @change="inputUpload"
        multiple
        name="assets_manager"
      />
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { Asset, IActionBuilderResult, IBladeToolbar, ITableColumns } from "../../../../core/types";
import { ref, computed, onMounted, shallowRef, watch, unref } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeEvent, IParentCallArgs } from "./../../../../shared";
import moment from "moment";
import Assets from "./../../../assets/components/assets-details/assets-details.vue";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  options: {
    assets: Asset[];
    assetsEditHandler: (assets: Asset[]) => void;
    assetsUploadHandler: (files: FileList) => void;
    assetsRemoveHandler: (assets: Asset[]) => void;
    disabled: boolean;
  };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "open:blade", blade: IBladeEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
  param: undefined,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

const defaultAssets = ref<Asset[]>([]);

const isDragging = ref(false);
const uploader = ref();
const loading = ref(false);
const selectedItems = ref([]);
const fileThumbnails = [
  { image: "fas fa-file-pdf", extensions: ["pdf"] },
  { image: "fas fa-file-word", extensions: ["doc", "docx"] },
  { image: "fas fa-file-excel", extensions: ["xls", "xlsx"] },
  { image: "fas fa-file-powerpoint", extensions: ["ppt", "pptx"] },
  { image: "fas fa-file-csv", extensions: ["csv"] },
  { image: "fas fa-file-archive", extensions: ["zip"] },
  { image: "fas fa-file-music", extensions: ["mp3", "aac"] },
  { image: "fas fa-file-video", extensions: ["mp4", "avi"] },
];

const imageExtensions = ["png", "jpg", "jpeg", "svg", "gif"];

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    clickHandler() {
      emit("close:blade");
    },
  },
  {
    id: "add",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.ADD")),
    icon: "fas fa-plus",
    clickHandler() {
      toggleUploader();
    },
  },
  {
    id: "delete",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.DELETE")),
    icon: "fas fa-trash",
    clickHandler() {
      if (props.options.assetsRemoveHandler && typeof props.options.assetsRemoveHandler === "function") {
        props.options.assetsRemoveHandler(selectedItems.value);
      }
    },
    disabled: computed(() => !selectedItems.value.length),
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
    width: "100px",
    alwaysVisible: true,
  },
  {
    id: "size",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.SIZE")),
    width: "180px",
    alwaysVisible: true,
  },
  {
    id: "modifiedDate",
    title: computed(() => t("ASSETS_MANAGER.TABLE.HEADER.MODIFIED_DATE")),
    width: "140px",
    alwaysVisible: true,
    type: "date-ago",
  },
]);

onMounted(() => {
  if (props.options?.assets && props.options?.assets.length) {
    defaultAssets.value = props.options.assets;
  }
});

function sortAssets(event: { dragIndex: number; dropIndex: number; value: Asset[] }) {
  if (props.options.assetsEditHandler && typeof props.options.assetsEditHandler === "function") {
    defaultAssets.value = event.value;
    props.options.assetsEditHandler(event.value);
  }
}

function dragOver() {
  if (!props.options.disabled) {
    isDragging.value = true;
  }
}

function dragLeave() {
  if (!props.options.disabled) {
    isDragging.value = false;
  }
}

async function onDrop(event: DragEvent) {
  if (!props.options.disabled) {
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
    try {
      loading.value = true;
      await props.options.assetsUploadHandler(files);
    } finally {
      loading.value = false;
    }
  }
}

async function inputUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const fileList = target.files;

  if (fileList && fileList.length) {
    upload(fileList);
  }
}

function onItemClick(item: Asset) {
  emit("open:blade", {
    component: shallowRef(Assets),
    bladeOptions: {
      asset: unref(item),
      assetEditHandler: (asset: Asset) => {
        const mutated = defaultAssets.value.map((x) => {
          if (x.id === asset.id || x.url === asset.url) {
            return asset;
          }
          return x;
        });

        if (props.options.assetsEditHandler && typeof props.options.assetsEditHandler === "function") {
          defaultAssets.value = mutated;
          props.options.assetsEditHandler(mutated);
        }
      },
      assetRemoveHandler: (asset: Asset) => {
        props.options.assetsRemoveHandler([asset]);
      },
    },
  });
}

function readableSize(bytes: number, decimals = 2) {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const onSelectionChanged = (items: Asset[]) => {
  selectedItems.value = items;
};

const actionBuilder = (): IActionBuilderResult[] => {
  let result = [];

  result.push({
    icon: "fas fa-edit",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.EDIT")),
    variant: "danger",
    clickHandler(item: Asset) {
      onItemClick(item);
    },
  });

  result.push({
    icon: "fas fa-trash",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.DELETE")),
    variant: "danger",
    leftActions: true,
    clickHandler(item: Asset) {
      props.options.assetsRemoveHandler([item]);
    },
  });

  return result;
};

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase();
}

function isImage(item: Asset) {
  return imageExtensions.includes(getExtension(item.name));
}

function getFileThumbnail(item: Asset) {
  return (
    fileThumbnails.find((thumb) => thumb.extensions.some((ext) => ext === getExtension(item.name)))?.image ||
    "fas fa-file"
  );
}

defineExpose({
  title: t("ASSETS_MANAGER.TITLE"),
});
</script>
