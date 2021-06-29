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
