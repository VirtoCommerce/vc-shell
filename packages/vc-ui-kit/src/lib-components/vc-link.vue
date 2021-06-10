<template>
  <nuxt-link class="vc-link" :class="{ 'vc-link_disabled': disabled }" :to="to">
    <slot></slot>
  </nuxt-link>
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
