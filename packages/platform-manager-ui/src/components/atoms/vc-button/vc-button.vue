<template>
  <div
    class="vc-button"
    :class="[
      `vc-button_${variant}`,
      { 'vc-button_disabled': disabled, 'vc-button_small': small },
    ]"
  >
    <i v-if="icon" class="vc-button__icon"></i>
    <div v-if="title" class="vc-button__title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    icon: {
      type: String,
    },

    title: {
      type: String,
    },

    variant: {
      type: String,
      enum: ["primary", "secondary", "special"],
      default: "primary",
    },

    disabled: {
      type: Boolean,
    },

    small: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="less">
.vc-button {
  border-radius: 2px;
  padding: 0 28px;
  height: var(--vc-button-height);
  display: inline-flex;
  align-items: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-s);
  cursor: pointer;

  &_special {
    background: var(--vc-button-special-color);
    color: #ffffff;

    &:hover {
      background: var(--vc-button-special-color-hover);
    }
  }

  &_small {
    height: var(--vc-button-small-height);
    font-weight: var(--font-weight-normal);
    font-size: var(--font-size-xs);
  }
}
</style>
