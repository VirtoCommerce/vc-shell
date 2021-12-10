<template>
  <div
    class="vc-popup"
    :class="['vc-popup', { 'vc-popup_fullscreen': fullscreen }]"
  >
    <div class="vc-popup__wrapper">
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

    fullscreen: {
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
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  background: rgba(31, 40, 50, 0.58);

  &_fullscreen {
    .vc-popup__centerer {
      justify-content: normal;
      align-items: normal;
    }
    .vc-popup__wrapper {
      max-height: 100vh;
    }
  }

  &__wrapper {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    max-height: 75vh;
    height: 100%;

    .vc-app_phone & {
      max-height: 100vh;
    }
  }

  &__inner {
    flex: 1 1 auto;
    margin: 40px;
    box-sizing: border-box;
    background: white;
    border-radius: 5px;
    overflow: hidden;
    flex-grow: 1;
    position: relative;

    .vc-app_phone & {
      margin: 0;
      border-radius: 0;
    }
  }

  &__header {
    height: 44px;
    padding: 0 var(--padding-l);
    background-color: #eef5fa;

    &-icon {
      cursor: pointer;
      color: #a1c0d4;
    }
  }
}
</style>
