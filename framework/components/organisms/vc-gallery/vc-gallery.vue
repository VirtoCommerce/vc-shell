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
      <div class="flex flex-wrap">
        <draggable
          :list="images"
          class="flex flex-wrap w-full"
          tag="transition-group"
          v-bind="dragOptions"
          @change="updateOrder"
          :component-data="{
            tag: 'div',
          }"
        >
          <template #item="{ element, index }">
            <VcGalleryItem
              class="m-2"
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
              class="m-2"
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
    <div v-else class="flex justify-center p-5">
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
import { computed, PropType, ref } from "vue";
import { VcLabel, VcFileUpload } from "@/components";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";
import { IImage } from "@/core/types";

const props = defineProps({
  images: {
    type: Array as PropType<IImage[]>,
    default: () => [],
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  required: {
    type: Boolean,
    default: false,
  },

  label: {
    type: String,
    default: undefined,
  },

  tooltip: {
    type: String,
    default: undefined,
  },

  tooltipIcon: {
    type: String,
    default: "fas fa-info",
  },

  uploadIcon: {
    type: String,
    default: "fas fa-upload",
  },

  multiple: {
    type: Boolean,
    default: false,
  },

  variant: {
    type: String,
    default: "gallery",
  },

  itemActions: {
    type: Object,
    default: () => ({
      preview: true,
      edit: true,
      remove: true,
    }),
  },

  disableDrag: {
    type: Boolean,
    default: false,
  },

  hideAfterUpload: {
    type: Boolean,
    default: false,
  },

  rules: {
    type: [String, Object],
  },

  name: {
    type: String,
    default: "Gallery",
  },
});

const emit = defineEmits([
  "upload",
  "sort",
  "item:preview",
  "item:edit",
  "item:remove",
  "item:move",
]);

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
