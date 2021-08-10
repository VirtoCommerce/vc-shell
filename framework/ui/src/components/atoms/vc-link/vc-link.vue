<template>
  <router-link
    class="vc-link"
    :class="{ 'vc-link_active': active, 'vc-link_disabled': disabled }"
    :href="disabled ? null : to"
    @click="onClick"
  >
    <slot></slot>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    to: {
      type: String,
      default: undefined,
    },

    active: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["click"],

  setup(props, { emit }) {
    return {
      onClick(): void {
        if (!props.disabled) {
          emit("click");
        }
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --link-text-color: hsl(200, 77%, 58%);
  --link-text-color-hover: hsl(200, 77%, 48%);
  --link-text-color-active: hsl(200, 77%, 48%);
  --link-text-color-disabled: hsl(200, 77%, 73%);
}

.vc-link {
  color: var(--link-text-color);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--link-text-color-hover);
    text-decoration: underline;
  }

  &_active {
    color: var(--link-text-color-active);
    text-decoration: none;
  }

  &_disabled {
    cursor: not-allowed;
    color: var(--link-text-color-disabled);

    &:hover {
      color: var(--link-text-color-disabled);
      text-decoration: none;
    }
  }
}
</style>
