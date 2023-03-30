<template>
  <VcBlade
    :title="$t('ASSETS_MANAGER.TITLE')"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('close:blade')"
    width="50%"
  >
    <div
      class="tw-relative tw-h-full"
      @dragover.prevent.stop="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent.stop="onDrop"
    >
      <VcLoading :active="loading"></VcLoading>
      <VcTable
        :columns="columns"
        :expanded="expanded"
        stateKey="assets_manager"
        :reorderableRows="!readonly"
        :items="defaultAssets"
        :header="false"
        :footer="false"
        :itemActionBuilder="!readonly && actionBuilder"
        :multiselect="!readonly"
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
            <template v-if="isImage(item.name)">
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
                :icon="getFileThumbnail(item.name)"
                class="tw-text-[#a9bfd2] tw-text-[38px]"
              ></VcIcon>
            </template>
          </div>
        </template>

        <!-- Overide order column -->
        <template v-slot:item_sortOrder="{ item }">
          <div>
            {{ item.sortOrder }}
          </div>
        </template>

        <!-- Mobile -->
        <template v-slot:mobile-item="{ item }">
          <div class="tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-flex tw-flex-nowrap">
            <template v-if="isImage(item.name)">
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
                  :icon="getFileThumbnail(item.name)"
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
                  <VcHint>{{ $t("ASSETS_MANAGER.TABLE.SIZE") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ readableSize(item.size) }}
                  </div>
                </div>
                <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                  <VcHint>{{ $t("ASSETS_MANAGER.TABLE.CREATED_DATE") }}</VcHint>
                  <div class="tw-truncate tw-mt-1">
                    {{ item.createdDate && moment(item.createdDate).fromNow() }}
                  </div>
                </div>
                <div class="tw-truncate tw-grow tw-basis-0 tw-mr-2">
                  <VcHint>{{ $t("ASSETS_MANAGER.TABLE.SORT_ORDER") }}</VcHint>
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
      @change="inputUpload"
      multiple
      name="assets_manager"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { Asset, IActionBuilderResult, IBladeToolbar, ITableColumns } from "../../../../../core/types";
import { ref, computed, onMounted, shallowRef, unref } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeEvent, IParentCallArgs } from "./../../../../../shared";
import moment from "moment";
import Assets from "./../../../assets/components/assets-details/assets-details.vue";
import { isImage, getFileThumbnail, readableSize } from "./../../../../utilities/assets";

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
const readonly = computed(() => props.options.disabled);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("ASSETS_MANAGER.TOOLBAR.SAVE")),
    icon: "fas fa-save",
    clickHandler() {
      emit("close:blade");
    },
    disabled: computed(() => readonly.value),
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
    clickHandler() {
      if (props.options.assetsRemoveHandler && typeof props.options.assetsRemoveHandler === "function") {
        props.options.assetsRemoveHandler(selectedItems.value);
        defaultAssets.value = defaultAssets.value.filter((asset) => !selectedItems.value.includes(asset));
      }
    },
    disabled: computed(() => !selectedItems.value.length && readonly.value),
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

onMounted(() => {
  defaultAssets.value = props.options?.assets;
});

function sortAssets(event: { dragIndex: number; dropIndex: number; value: Asset[] }) {
  if (props.options.assetsEditHandler && typeof props.options.assetsEditHandler === "function") {
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index;
      return item;
    });
    defaultAssets.value = sorted;
    props.options.assetsEditHandler(sorted);
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
      disabled: readonly.value,
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

const onSelectionChanged = (items: Asset[]) => {
  selectedItems.value = items;
};

const actionBuilder = (): IActionBuilderResult[] => {
  let result = [];

  result.push({
    icon: "fas fa-edit",
    title: computed(() => t("ASSETS_MANAGER.TABLE.ACTIONS.EDIT")),
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
      defaultAssets.value = defaultAssets.value.filter((asset) => asset !== item);
      selectedItems.value = [];
    },
  });

  return result;
};

defineExpose({
  title: t("ASSETS_MANAGER.TITLE"),
});
</script>
