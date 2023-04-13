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
          class="tw-flex tw-flex-wrap tw-w-full"
          ref="galleryRef"
        >
          <VcGalleryItem
            class="tw-m-2 vc-gallery__item"
            v-for="(image, i) in defaultImages"
            :key="`image_${i}`"
            :image="image"
            :readonly="disabled"
            @preview="onPreviewClick(i)"
            @edit="$emit('item:edit', $event)"
            @remove="$emit('item:remove', $event)"
            :actions="itemActions"
            :disableDrag="disableDrag"
            @mousedown="onItemMouseDown"
            @dragstart="onItemDragStart($event, image)"
            @dragover="onItemDragOver"
            @dragleave="onItemDragLeave"
            @drop="onItemDrop($event, image)"
          ></VcGalleryItem>
          <VcFileUpload
            v-if="!disabled && !hideAfterUpload"
            class="tw-m-2"
            :icon="uploadIcon"
            @upload="onUpload"
            :variant="variant"
            :multiple="multiple"
            :rules="rules"
            :name="name"
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
      <VcHint>Gallery is empty</VcHint>
    </div>

    <VcGalleryPreview
      v-if="preview"
      :images="images"
      :index="previewImageIndex"
      @close="preview = false"
    ></VcGalleryPreview>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { IImage } from "../../../../core/types";
import { VcLabel, VcFileUpload, VcHint } from "./../../";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";

export interface Props {
  images?: IImage[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
  tooltip?: string;
  tooltipIcon?: string;
  uploadIcon?: string;
  multiple?: boolean;
  variant?: "gallery" | "file-upload";
  itemActions?: {
    name?: string;
    preview: boolean;
    edit: boolean;
    remove: boolean;
  };
  disableDrag?: boolean;
  hideAfterUpload?: boolean;
  rules?: string | Record<string, unknown>;
  name?: string;
}

export interface Emits {
  (event: "upload", files: FileList): void;
  (event: "sort", sorted: IImage[]): void;
  (event: "item:edit", image: IImage): void;
  (event: "item:remove", image: IImage): void;
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

const preview = ref(false);
const previewImageIndex = ref<number>();

const defaultImages = ref<IImage[]>([]);
const draggedItem = ref<IImage>();
const draggedElement = ref<HTMLElement>();
const galleryRef = ref<HTMLElement>();
const reorderGalleryRef = ref<HTMLElement>();
const dropPosition = ref<number>();

watch(
  () => props.images,
  (newVal) => {
    defaultImages.value = newVal;
  },
  { deep: true, immediate: true }
);

const onUpload = (files: FileList) => {
  if (files && files.length) {
    emit("upload", files);
  }
};

const onPreviewClick = (index: number) => {
  preview.value = true;
  previewImageIndex.value = index;
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
  if (!props.disableDrag && !props.disabled) {
    event.currentTarget.draggable = true;
    return;
  }
}

function onItemDragStart(event: DragEvent, item: IImage) {
  if (!props.disableDrag && !props.disabled) {
    draggedItem.value = item;
    draggedElement.value = event.target as HTMLElement;
    event.dataTransfer.setData("text", "gallery_reorder");
  }
}

function onItemDragOver(event: DragEvent) {
  let dropItem = findParentElement(event.target as HTMLElement);

  if (!props.disableDrag && !props.disabled && draggedItem.value && dropItem) {
    event.preventDefault();

    let containerOffset = galleryRef.value.getBoundingClientRect();
    let dropItemOffset = dropItem.getBoundingClientRect();

    if (draggedElement.value !== dropItem) {
      let elementStyle = getComputedStyle(dropItem);
      const dropItemOffsetWidth = dropItem.offsetWidth + parseFloat(elementStyle.marginLeft);
      let targetLeft = dropItemOffset.left - containerOffset.left;
      let columnCenter = dropItemOffset.left + dropItemOffsetWidth / 2;

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

function onItemDragLeave(event: DragEvent) {
  if (!props.disableDrag && !props.disabled && draggedItem.value) {
    event.preventDefault();

    reorderGalleryRef.value.style.display = "none";
  }
}

function onItemDrop(event: DragEvent, item: IImage) {
  event.preventDefault();

  if (draggedItem.value) {
    let dragIndex = defaultImages.value.indexOf(draggedItem.value);
    let dropIndex = defaultImages.value.indexOf(item);

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

    reorderGalleryRef.value.style.display = "none";
    draggedElement.value.draggable = false;
    draggedItem.value = null;
    dropPosition.value = null;
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

    while (!parent.classList.contains("vc-gallery__item")) {
      parent = parent.parentElement;
      if (!parent) break;
    }
    return parent;
  }
}
</script>
