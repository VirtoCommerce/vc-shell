<template>
  <div class="vc-gallery">
    <VcLabel
      v-if="label"
      :tooltip="tooltip"
      :required="required"
      :tooltip-icon="tooltipIcon"
    >
      {{ label }}
    </VcLabel>

    <template v-if="(defaultImages && defaultImages.length) || !disabled">
      <div class="tw-flex tw-flex-wrap tw-relative">
        <div
          ref="galleryRef"
          class="tw-flex tw-flex-wrap tw-w-full"
        >
          <VcGalleryItem
            v-for="(image, i) in defaultImages"
            :key="`image_${i}`"
            class="tw-m-2 vc-gallery__item"
            :image="image"
            :readonly="disabled"
            :actions="itemActions"
            :disable-drag="disableDrag"
            @preview="onPreviewClick(i)"
            @edit="$emit('edit', $event)"
            @remove="$emit('remove', $event)"
            @mousedown="onItemMouseDown"
            @dragstart="onItemDragStart($event, image)"
            @dragover="onItemDragOver"
            @dragleave="onItemDragLeave"
            @drop="onItemDrop($event, image)"
          ></VcGalleryItem>
          <VcFileUpload
            v-if="!disabled && !uploadHidden"
            class="tw-m-2"
            :icon="uploadIcon"
            :variant="variant"
            :multiple="multiple"
            :rules="rules"
            :name="name"
            :loading="loading"
            @upload="onUpload"
          ></VcFileUpload>
        </div>
        <div
          ref="reorderGalleryRef"
          class="tw-w-0.5 tw-bg-[#41afe6] tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-z-[2] tw-hidden"
        ></div>
      </div>
    </template>
    <div
      v-else
      class="tw-flex tw-justify-center tw-p-5"
    >
      <VcHint>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.GALLERY_IS_EMPTY") }}</VcHint>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MaybeRef, computed, ref, unref, watch } from "vue";
import { ICommonAsset } from "../../../../core/types";
import { VcLabel, VcFileUpload, VcHint } from "./../../";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";
import { usePopup } from "./../../../../shared/components/popup-handler/composables/usePopup";
import { useI18n } from "vue-i18n";

export interface Props {
  images?: ICommonAsset[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
  tooltip?: string;
  tooltipIcon?: string;
  uploadIcon?: string;
  multiple?: boolean;
  variant?: "gallery" | "file-upload";
  itemActions?: {
    preview: boolean;
    edit: boolean;
    remove: boolean;
  };
  hideAfterUpload?: boolean;
  rules?: string | Record<string, unknown>;
  name?: string;
  loading?: boolean;
}

export interface Emits {
  (event: "upload", files: FileList, startingSortOrder?: number): void;
  (event: "sort", sorted: ICommonAsset[]): void;
  (event: "edit", image: ICommonAsset): void;
  (event: "remove", image: ICommonAsset): void;
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  tooltipIcon: "fas fa-info",
  uploadIcon: "fas fa-upload",
  variant: "gallery",
  itemActions: () => ({
    preview: true,
    edit: true,
    remove: true,
  }),
  name: "Gallery",
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const previewImageIndex = ref<number>();

const defaultImages = ref<MaybeRef<ICommonAsset[]>>([]);
const draggedItem = ref<ICommonAsset>();
const draggedElement = ref<HTMLElement>();
const galleryRef = ref<HTMLElement>();
const reorderGalleryRef = ref<HTMLElement>();
const dropPosition = ref<number>();

const currentIndex = computed(() => previewImageIndex.value);
const disableDrag = computed(() => defaultImages.value.length <= 1);
const uploadHidden = ref(false);

const { open } = usePopup(
  computed(() => ({
    component: VcGalleryPreview,
    props: {
      images: props.images,
      index: currentIndex.value,
    },
  }))
);

watch(
  () => props.images,
  (newVal) => {
    defaultImages.value = unref(newVal);

    if (props.hideAfterUpload) {
      uploadHidden.value = !!defaultImages.value.length;
    }
  },
  { deep: true, immediate: true }
);

const onUpload = (files: FileList) => {
  if (files && files.length) {
    emit("upload", files, props.images[props.images.length - 1]?.sortOrder);
  }
};

const onPreviewClick = (index: number) => {
  previewImageIndex.value = index;

  open();
};

const updateOrder = () => {
  const images = defaultImages.value;
  const sortedImgs = images.map((item, index) => {
    item.sortOrder = index;
    return item;
  });

  emit("sort", sortedImgs);
};

function onItemMouseDown(event: MouseEvent & { currentTarget?: { draggable: boolean } }) {
  if (!disableDrag.value && !props.disabled) {
    event.currentTarget.draggable = true;
    return;
  }
}

function onItemDragStart(event: DragEvent, item: ICommonAsset) {
  if (!disableDrag.value && !props.disabled) {
    draggedItem.value = item;
    draggedElement.value = event.target as HTMLElement;
    event.dataTransfer?.setData("text", "gallery_reorder");
  }
}

function onItemDragOver(event: DragEvent) {
  const dropItem = findParentElement(event.target as HTMLElement);

  if (!disableDrag.value && !props.disabled && draggedItem.value && dropItem) {
    event.preventDefault();

    const containerOffset = galleryRef.value?.getBoundingClientRect();
    const dropItemOffset = dropItem.getBoundingClientRect();

    if (draggedElement.value !== dropItem && containerOffset) {
      const elementStyle = getComputedStyle(dropItem);
      const dropItemOffsetWidth = dropItem.offsetWidth + parseFloat(elementStyle.marginLeft);
      const targetLeft = dropItemOffset.left - containerOffset.left;
      const columnCenter = dropItemOffset.left + dropItemOffsetWidth / 2;

      if (reorderGalleryRef.value) {
        reorderGalleryRef.value.style.top = dropItemOffset.top - containerOffset.top + "px";
        reorderGalleryRef.value.style.height = dropItem.offsetHeight + "px";

        if (event.pageX > columnCenter) {
          reorderGalleryRef.value.style.left = targetLeft + dropItemOffsetWidth + "px";
          dropPosition.value = 1;
        } else {
          reorderGalleryRef.value.style.left = targetLeft - parseFloat(elementStyle.marginLeft) + "px";
          dropPosition.value = -1;
        }

        reorderGalleryRef.value.style.display = "block";
      }
    }
  }
}

function onItemDragLeave(event: DragEvent) {
  if (!disableDrag.value && !props.disabled && draggedItem.value && reorderGalleryRef.value) {
    event.preventDefault();

    reorderGalleryRef.value.style.display = "none";
  }
}

function onItemDrop(event: DragEvent, item: ICommonAsset) {
  event.preventDefault();

  if (draggedItem.value) {
    const dragIndex = defaultImages.value.indexOf(draggedItem.value);
    const dropIndex = defaultImages.value.indexOf(item);

    let allowDrop = dragIndex !== dropIndex;

    if (
      allowDrop &&
      ((dropIndex - dragIndex === 1 && dropPosition.value === -1) ||
        (dropIndex - dragIndex === -1 && dropPosition.value === 1))
    ) {
      allowDrop = false;
    }

    if (allowDrop) {
      reorderArray(defaultImages.value, dragIndex, dropIndex);

      updateOrder();
    }

    if (reorderGalleryRef.value && draggedElement.value) {
      reorderGalleryRef.value.style.display = "none";
      draggedElement.value.draggable = false;
      draggedItem.value = undefined;
      dropPosition.value = undefined;
    }
  }
}

function reorderArray(value: unknown[], from: number, to: number) {
  if (value && from !== to) {
    if (to >= value.length) {
      to %= value.length;
      from %= value.length;
    }

    value.splice(to, 0, value.splice(from, 1)[0]);
  }
}

function findParentElement(element: HTMLElement) {
  if (element.classList.contains("vc-gallery__item")) {
    return element;
  } else {
    let parent = element.parentElement;

    while (!(parent && parent.classList.contains("vc-gallery__item"))) {
      parent = parent?.parentElement || null;
      if (!parent) break;
    }
    return parent;
  }
}
</script>
