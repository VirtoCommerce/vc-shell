<template>
  <div class="vc-popup">
    <div class="vc-popup__overlay"></div>
    <div
      class="vc-fill_all vc-flex vc-flex-align_stretch vc-flex-justify_stretch"
    >
      <div class="vc-popup__inner vc-flex vc-flex-column vc-flex-grow_1">
        <div
          class="vc-popup__header vc-flex vc-flex-shrink_0 vc-flex-align_center"
        >
          <div class="vc-ellipsis vc-flex-grow_1">
            <slot name="title">{{ title }}</slot>
          </div>
          <vc-icon
            v-if="closable"
            class="vc-popup__header-icon"
            icon="fas fa-times"
            @click="$emit('close')"
          ></vc-icon>
        </div>

        <div class="vc-popup__content vc-flex-grow_1">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcPopup",

  props: {
    title: {
      type: String,
      default: undefined,
    },

    closable: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["close"],
});
</script>

<style lang="less">
.vc-popup {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;

  &__overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(31, 40, 50, 0.58);
  }

  &__inner {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: 40px;
    box-sizing: border-box;
    background: white;
    border-radius: 5px;
    overflow: hidden;
  }

  &__header {
    height: 44px;
    background-color: #eef5fa;
    padding: 0 var(--padding-l);

    &-icon {
      color: #a1c0d4;
      cursor: pointer;
    }
  }
}
</style>
