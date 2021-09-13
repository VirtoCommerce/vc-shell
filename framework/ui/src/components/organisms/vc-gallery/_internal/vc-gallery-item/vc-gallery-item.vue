<template>
  <div
    class="vc-gallery-item"
    :class="{ 'vc-gallery-item_readonly': readonly }"
  >
    <vc-image aspect="1x1" :src="src"></vc-image>
    <div class="vc-flex-column vc-gallery-item__overlay">
      <div class="vc-flex">
        <div>Move</div>
        <div>Title</div>
      </div>
      <div class="vc-flex vc-align-items_center vc-justify-content_center">
        <div>Btn1</div>
        <div>Btn2</div>
        <div>Btn3</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcGalleryItem",

  props: {
    title: {
      type: String,
      default: undefined,
    },

    src: {
      type: String,
      default: undefined,
    },

    readonly: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="less">
.vc-gallery-item {
  position: relative;
  width: 155px;
  border: 1px solid #d3dae9;
  border-radius: 6px;
  padding: var(--padding-s);
  cursor: pointer;

  &__overlay {
    background: rgba(238, 246, 252, 0.97);
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  &:hover &__overlay {
    display: flex;
  }
}
</style>
