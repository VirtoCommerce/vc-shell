<template>
  <a class="vc-link" :class="{ 'vc-link_disabled': disabled }" :href="to">
    <slot></slot>
  </a>
</template>

<script>
  export default {
    props: {
      to: {
        type: String,
      },

      disabled: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>
