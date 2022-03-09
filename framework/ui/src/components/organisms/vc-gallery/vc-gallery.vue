<template>
  <div class="vc-gallery">
    <vc-label
      v-if="label"
      class="vc-gallery__label"
      :tooltip="tooltip"
      :required="required"
      :tooltip-icon="tooltipIcon"
    >
      {{ label }}
    </vc-label>

    <template v-if="(images && images.length) || !disabled">
      <div class="vc-gallery__items-wrap">
        <draggable
          :list="images"
          class="vc-gallery__items-wrap"
          item-key="sortOrder"
          tag="transition-group"
          v-bind="dragOptions"
          @change="updateOrder"
          :component-data="{
            tag: 'div',
            type: 'transition-group',
          }"
        >
          <template #item="{ element, index }">
            <vc-gallery-item
              class="vc-margin_s"
              :image="element"
              :readonly="disabled"
              @preview="onPreviewClick(index)"
              @edit="$emit('item:edit', $event)"
              @remove="$emit('item:remove', $event)"
            ></vc-gallery-item>
          </template>
          <template #footer>
            <vc-file-upload
              v-if="!disabled"
              class="vc-margin_s"
              :icon="uploadIcon"
              @upload="onUpload"
              variant="gallery"
            ></vc-file-upload>
          </template>
        </draggable>
      </div>
    </template>
    <div v-else class="vc-flex vc-flex-justify_center vc-padding_xl">
      <vc-hint>Gallery is empty</vc-hint>
    </div>

    <vc-gallery-preview
      v-if="preview"
      :images="images"
      :index="previewImageIndex"
      @close="preview = false"
    ></vc-gallery-preview>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";

export default defineComponent({
  name: "VcGallery",
});
</script>

<script lang="ts" setup>
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";
import { Image } from "@virtoshell/api-client";
import VcFileUpload from "../../molecules/vc-file-upload/vc-file-upload.vue";

const props = defineProps({
  images: {
    type: Array as PropType<Image[]>,
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
    disabled: false,
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

<style lang="less">
.vc-gallery {
  &__items-wrap {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
