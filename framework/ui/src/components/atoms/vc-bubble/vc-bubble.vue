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

  --bubble-background-color: #ffffff;
  --bubble-background-color-hover: #fafafa;
  --bubble-background-color-disabled: #f2f2f2;

  --bubble-text-color: #a1bfd4;
  --bubble-text-color-hover: #8fb3cc;
  --bubble-text-color-disabled: #b2cbdc;

  --bubble-border-radius: 2px;
  --bubble-border-width: 1px;

  --bubble-border-color: #e1eff9;
  --bubble-border-color-hover: #cce4f5;
  --bubble-border-color-disabled: #f6fafd;
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
