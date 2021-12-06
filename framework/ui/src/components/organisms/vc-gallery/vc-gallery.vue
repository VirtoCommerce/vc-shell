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
        </draggable>
        <vc-gallery-upload
          v-if="!disabled"
          class="vc-margin_s"
          :icon="uploadIcon"
          @upload="onUpload"
        ></vc-gallery-upload>
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
import { computed, defineComponent, PropType, ref } from "vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryUpload from "./_internal/vc-gallery-upload/vc-gallery-upload.vue";
import VcGalleryPreview from "./_internal/vc-gallery-preview/vc-gallery-preview.vue";
import { Image } from "@virtoshell/api-client";

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
  },

  emits: [
    "upload",
    "sort",
    "item:preview",
    "item:edit",
    "item:remove",
    "item:move",
  ],

  setup(_props, { emit }) {
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
      const images = _props.images;
      const sortedImgs = images.map((item, index) => {
        const newSort = index;
        item.sortOrder = newSort;
        return item;
      });
      emit("sort", ref(sortedImgs).value);
    };

    return {
      preview,
      previewImageIndex,
      dragOptions,
      onUpload,
      onPreviewClick,
      updateOrder,
    };
  },
});
</script>

<style lang="less">
.vc-gallery {
  &__items-wrap {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
