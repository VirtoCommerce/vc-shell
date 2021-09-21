<template>
  <div
    class="vc-gallery-item"
    :class="{ 'vc-gallery-item_readonly': readonly }"
  >
    <vc-image aspect="1x1" :src="image.url"></vc-image>
    <div class="vc-flex-column vc-gallery-item__overlay vc-padding_s">
      <div class="vc-flex">
        <vc-icon
          class="vc-gallery-item__move"
          icon="fas fa-arrows-alt"
          size="s"
        ></vc-icon>
        <div
          class="vc-margin-left_s vc-gallery-item__title vc-ellipsis"
          :title="image.name"
        >
          {{ image.name }}
        </div>
      </div>
      <div
        class="
          vc-flex
          vc-flex-grow_1
          vc-flex-align_center
          vc-flex-justify_space-around
        "
      >
        <div
          class="
            vc-gallery-item__button
            vc-flex vc-flex-column
            vc-flex-align_center
          "
          @click="$emit('preview', image)"
        >
          <vc-icon
            class="vc-gallery-item__button-icon"
            icon="fas fa-eye"
          ></vc-icon>
          <div class="vc-margin-top_s">Fullscreen</div>
        </div>
        <div
          class="
            vc-gallery-item__button
            vc-flex vc-flex-column
            vc-flex-align_center
          "
          @click="$emit('edit', image)"
        >
          <vc-icon
            class="vc-gallery-item__button-icon"
            icon="fas fa-pen"
          ></vc-icon>
          <div class="vc-margin-top_s">Edit</div>
        </div>
        <div
          class="
            vc-gallery-item__button
            vc-flex vc-flex-column
            vc-flex-align_center
          "
          @click="$emit('remove', image)"
        >
          <vc-icon
            class="vc-gallery-item__button-icon"
            icon="fas fa-trash"
          ></vc-icon>
          <div class="vc-margin-top_s">Delete</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcGalleryItem",

  props: {
    image: {
      type: Object,
      default: () => ({}),
    },

    readonly: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["preview", "edit", "remove"],
});
</script>

<style lang="less">
.vc-gallery-item {
  position: relative;
  width: 155px;
  height: 155px;
  box-sizing: border-box;
  border: 1px solid #d3dae9;
  border-radius: 6px;
  padding: var(--padding-xs);

  &__overlay {
    background: rgba(238, 246, 252, 0.97);
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }

  &:hover &__overlay {
    display: flex;
  }

  &__move {
    color: #a1c0d4;
    cursor: pointer;
  }

  &__button {
    cursor: pointer;

    &-icon {
      color: #319ed4;
    }
  }
}
</style>
