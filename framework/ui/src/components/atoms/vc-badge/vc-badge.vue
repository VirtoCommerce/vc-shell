<template>
  <div
    class="vc-badge"
    :class="{
      'vc-badge_active': active,
      'vc-badge_clickable': clickable,
      'vc-badge_disabled': disabled,
    }"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcBadge",

  props: {
    active: {
      type: Boolean,
      default: false,
    },

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
  --badge-padding: 4px 8px;

  --badge-font-size: var(--font-size-m);
  --badge-font-weight: var(--font-weight-normal);

  --badge-background-color: hsl(0, 0%, 100%);
  --badge-background-color-hover: hsl(0, 0%, 98%);
  --badge-background-color-active: hsl(0, 0%, 98%);
  --badge-background-color-disabled: hsl(0, 0%, 95%);

  --badge-text-color: hsl(211, 20%, 34%);
  --badge-text-color-hover: hsl(211, 20%, 29%);
  --badge-text-color-active: hsl(211, 20%, 29%);
  --badge-text-color-disabled: hsl(211, 20%, 59%);

  --badge-border-radius: 35px;
  --badge-border-width: 1px;

  --badge-border-color: hsl(204, 37%, 73%);
  --badge-border-color-hover: hsl(204, 37%, 68%);
  --badge-border-color-active: hsl(204, 37%, 68%);
  --badge-border-color-disabled: hsl(204, 37%, 78%);
}

.vc-badge {
  display: inline-block;
  border-radius: var(--badge-border-radius);
  padding: var(--badge-padding);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  background-color: var(--badge-background-color);
  color: var(--badge-text-color);
  border: var(--badge-border-width) solid var(--badge-border-color);
  transition: all 0.2s ease;

  &_clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--badge-background-color-hover);
      color: var(--badge-text-color-hover);
      border: var(--badge-border-width) solid var(--badge-border-color-hover);
    }
  }

  &_active {
    background-color: var(--badge-background-color-active);
    color: var(--badge-text-color-active);
    border: var(--badge-border-width) solid var(--badge-border-color-active);
  }

  &_disabled,
  &_disabled:hover {
    cursor: not-allowed;
    background-color: var(--badge-background-color-disabled);
    color: var(--badge-text-color-disabled);
    border: var(--badge-border-width) solid var(--badge-border-color-disabled);
  }
}
</style>
