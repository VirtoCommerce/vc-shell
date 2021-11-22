<template>
  <div
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item_readonly': readonly,
      'vc-gallery-item_hover': hover,
    }"
    @tap="hover = !hover"
    v-click-outside="
      () => {
        hover = false;
      }
    "
  >
    <vc-image aspect="1x1" :src="image.url"></vc-image>
    <div class="vc-flex-column vc-gallery-item__overlay vc-padding_s">
      <div class="vc-flex">
        <vc-icon
          v-if="!readonly"
          class="vc-gallery-item__move vc-margin-right_s"
          icon="fas fa-arrows-alt"
          size="s"
        ></vc-icon>
        <div class="vc-gallery-item__title vc-ellipsis" :title="image.name">
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
          v-if="!readonly"
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
          v-if="!readonly"
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
import { defineComponent, ref } from "vue";
import { clickOutside } from "../../../../../directives";

export default defineComponent({
  name: "VcGalleryItem",

  directives: {
    clickOutside,
  },

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

  setup() {
    const hover = ref(false);

    return {
      hover,
    };
  },
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
    opacity: 0;
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transition: all 0.2s ease;
  }

  &:hover &__overlay,
  .vc-app_touch &.hover &__overlay {
    opacity: 1;
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
