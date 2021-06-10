<template>
  <a class="vc-link" :class="{ 'vc-link_disabled': disabled }" :href="to">
    <slot></slot>
  </a>
</template>

<script>
  import { defineComponent } from "@vue/composition-api";

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
