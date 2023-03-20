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

    <template v-if="(images && images.length) || !disabled">
      <div class="tw-flex tw-flex-wrap">
        <draggable
          :list="images"
          class="tw-flex tw-flex-wrap tw-w-full"
          tag="transition-group"
          v-bind="dragOptions"
          @change="updateOrder"
          :component-data="{
            tag: 'div',
          }"
        >
          <template #item="{ element, index }">
            <VcGalleryItem
              class="tw-m-2"
              :key="element.sortOrder"
              :image="element"
              :readonly="disabled"
              @preview="onPreviewClick(index)"
              @edit="$emit('item:edit', $event)"
              @remove="$emit('item:remove', $event)"
              :actions="itemActions"
              :disableDrag="disableDrag"
            ></VcGalleryItem>
          </template>
          <template #footer>
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
          </template>
        </draggable>
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
import { computed, ref } from "vue";
import { IImage } from "../../../../core/types";
import { VcLabel, VcFileUpload } from "./../../../components";
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
  (event: "item:move", image: IImage): void;
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
const previewImageIndex = ref();
const dragOptions = computed(() => {
  return {
    animation: 200,
    group: "description",
    disabled: props.disableDrag,
    ghostClass: "ghost",
  };
});

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
  const images = props.images;
  const sortedImgs = images.map((item, index) => {
    item.sortOrder = index;
    return item;
  });
  emit("sort", ref(sortedImgs).value);
};
</script>
