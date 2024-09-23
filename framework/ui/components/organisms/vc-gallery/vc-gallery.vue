<template>
  <div class="vc-gallery">
    <VcLabel
      v-if="label"
      :required="required"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <template v-if="(toValue(defaultImages) && toValue(defaultImages).length) || !disabled">
      <div class="vc-gallery__container">
        <div
          ref="galleryRef"
          class="vc-gallery__wrapper"
        >
          <VcGalleryItem
            v-for="(image, i) in defaultImages"
            :key="`image_${i}`"
            class="vc-gallery__item"
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
            class="vc-gallery__upload"
            :icon="uploadIcon"
            :variant="variant"
            :multiple="multiple"
            :rules="rules"
            :name="name"
            :loading="loading"
            :custom-text="customText"
            @upload="onUpload"
          ></VcFileUpload>
        </div>
        <div
          ref="reorderGalleryRef"
          class="vc-gallery__reorder-line"
        ></div>
      </div>
    </template>
    <div
      v-else
      class="vc-gallery__empty"
    >
      <VcHint>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.GALLERY_IS_EMPTY") }}</VcHint>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MaybeRef, computed, ref, unref, watch, toValue } from "vue";
import { ICommonAsset, IValidationRules } from "../../../../core/types";
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
  uploadIcon?: string;
  multiple?: boolean;
  variant?: "gallery" | "file-upload";
  itemActions?: {
    preview: boolean;
    edit: boolean;
    remove: boolean;
  };
  hideAfterUpload?: boolean;
  rules?: keyof IValidationRules | IValidationRules;
  name?: string;
  loading?: boolean;
  customText?: {
    dragHere: string;
    browse: string;
  };
}

export interface Emits {
  (event: "upload", files: FileList, startingSortOrder?: number): void;
  (event: "sort", sorted: ICommonAsset[]): void;
  (event: "edit", image: ICommonAsset): void;
  (event: "remove", image: ICommonAsset): void;
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  uploadIcon: "fas fa-cloud-upload-alt",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any,
);

watch(
  () => props.images,
  (newVal) => {
    defaultImages.value = unref(newVal);

    if (props.hideAfterUpload) {
      uploadHidden.value = !!defaultImages.value.length;
    }
  },
  { deep: true, immediate: true },
);

const onUpload = (files: FileList) => {
  if (files && files.length) {
    const uploadedFiles: File[] = [];
    const existingImageNames = defaultImages.value.map((image) => image.name);

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

    emit("upload", modifiedFileList.files, props.images[props.images.length - 1]?.sortOrder);
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

<style lang="scss">
:root {
  --gallery-reorder-color: var(--primary-500);
}

.vc-gallery {
  &__container {
    @apply tw-flex tw-flex-wrap tw-relative;
  }

  &__wrapper {
    @apply tw-flex tw-flex-wrap tw-w-full;
  }

  &__item {
    @apply tw-m-2;
  }

  &__upload {
    @apply tw-m-2;
  }

  &__reorder-line {
    @apply tw-w-0.5 tw-bg-[color:var(--gallery-reorder-color)] tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-z-[2] tw-hidden;
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-p-5 tw-h-full tw-items-center;
  }
}
</style>
