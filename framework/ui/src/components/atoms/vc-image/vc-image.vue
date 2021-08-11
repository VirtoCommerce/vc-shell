<template>
  <img class="vc-image" :src="src" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    src: {
      type: String,
      default: undefined,
    },
  },
});
</script>

<style lang="less">
.vc-image {
  max-width: 100%;
}
</style>
