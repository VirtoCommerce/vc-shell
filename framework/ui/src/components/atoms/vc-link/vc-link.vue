<template>
  <a class="vc-link" :class="{ 'vc-link_disabled': disabled }" :href="to">
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    to: {
      type: String,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="less">
.vc-link {
  color: var(--basic-black-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &_disabled {
    cursor: not-allowed;

    &:hover {
      text-decoration: none;
    }
  }
}
</style>
