<template>
  <div
    class="vc-bubble"
    :class="{
      'vc-bubble_clickable': clickable,
      'vc-bubble_disabled': disabled,
    }"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcBubble",

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    clickable: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["click"],

  setup(props, { emit }) {
    return {
      onClick(): void {
        if (props.clickable && !props.disabled) {
          emit("click");
        }
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --bubble-padding: 4px 14px;

  --bubble-font-size: var(--font-size-m);
  --bubble-font-weight: var(--font-weight-normal);

  --bubble-background-color: hsl(0, 0%, 100%);
  --bubble-background-color-hover: hsl(0, 0%, 98%);
  --bubble-background-color-disabled: hsl(0, 0%, 95%);

  --bubble-text-color: hsl(204, 37%, 73%);
  --bubble-text-color-hover: hsl(204, 37%, 68%);
  --bubble-text-color-disabled: hsl(204, 37%, 78%);

  --bubble-border-radius: 2px;
  --bubble-border-width: 1px;

  --bubble-border-color: hsl(205, 68%, 93%);
  --bubble-border-color-hover: hsl(205, 68%, 88%);
  --bubble-border-color-disabled: hsl(205, 68%, 98%);
}

.vc-bubble {
  display: inline-block;
  border-radius: var(--bubble-border-radius);
  padding: var(--bubble-padding);
  font-size: var(--bubble-font-size);
  font-weight: var(--bubble-font-weight);
  background-color: var(--bubble-background-color);
  color: var(--bubble-text-color);
  border: var(--bubble-border-width) solid var(--bubble-border-color);
  transition: all 0.2s ease;

  &_clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--bubble-background-color-hover);
      color: var(--bubble-text-color-hover);
      border: var(--bubble-border-width) solid var(--bubble-border-color-hover);
    }
  }

  &_disabled,
  &_disabled:hover {
    cursor: not-allowed;
    background-color: var(--bubble-background-color-disabled);
    color: var(--bubble-text-color-disabled);
    border: var(--bubble-border-width) solid var(--bubble-border-color-disabled);
  }
}
</style>
