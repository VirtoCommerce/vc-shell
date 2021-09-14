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
        :src="item.src"
        :title="item.title"
        :readonly="readonly"
        @preview="onPreviewClick"
        @edit="onPreviewClick"
        @remove="onPreviewClick"
        @move="onMoveClick"
      ></vc-gallery-item>

      <vc-gallery-upload
        v-if="!readonly"
        class="vc-margin_s"
        :icon="uploadIcon"
        @upload="onUpload"
      ></vc-gallery-upload>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryUpload from "./_internal/vc-gallery-upload/vc-gallery-upload.vue";

export default defineComponent({
  name: "VcGallery",

  components: {
    VcLabel,
    VcGalleryItem,
    VcGalleryUpload,
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

  emits: ["upload", "item:preview", "item:edit", "item:click", "item:move"],

  setup(_props, { emit }) {
    const onUpload = (files: FileList) => {
      if (files && files.length) {
        emit("upload", files);
      }
    };

    return {
      onUpload,
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
