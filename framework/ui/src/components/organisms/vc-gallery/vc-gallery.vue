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

    <div class="vc-gallery__items">
      <vc-gallery-item
        class="vc-margin_s"
        v-for="(item, i) in images"
        :key="i"
        :image="item"
        :readonly="readonly"
        @preview="onPreviewClick(i)"
        @edit="$emit('item:edit', $event)"
        @remove="$emit('item:remove', $event)"
        @move="onMoveClick"
      ></vc-gallery-item>

      <vc-gallery-upload
        v-if="!readonly"
        class="vc-margin_s"
        :icon="uploadIcon"
        @upload="onUpload"
      ></vc-gallery-upload>
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
import { defineComponent, ref } from "vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryUpload from "./_internal/vc-gallery-upload/vc-gallery-upload.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";

export default defineComponent({
  name: "VcGallery",

  components: {
    VcLabel,
    VcGalleryItem,
    VcGalleryUpload,
    VcGalleryPreview,
  },

  props: {
    images: {
      type: Array,
      default: () => [],
    },

    readonly: {
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
  },

  emits: ["upload", "item:preview", "item:edit", "item:remove", "item:move"],

  setup(_props, { emit }) {
    const preview = ref(false);
    const previewImageIndex = ref();

    const onUpload = (files: FileList) => {
      if (files && files.length) {
        emit("upload", files);
      }
    };

    const onPreviewClick = (index: number) => {
      preview.value = true;
      previewImageIndex.value = index;
    };

    return {
      preview,
      previewImageIndex,
      onUpload,
      onPreviewClick,
    };
  },
});
</script>

<style lang="less">
.vc-gallery {
  &__items {
    display: flex;
    flex-wrap: wrap;
    margin: 0 calc(-1 * var(--padding-s));
  }
}
</style>
