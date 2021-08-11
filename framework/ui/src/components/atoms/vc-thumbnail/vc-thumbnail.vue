<template>
  <div
    class="vc-thumbnail"
    :class="`vc-thumbnail_${aspect}`"
    :style="{ background: `url(${src}) center / cover no-repeat` }"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    aspect: {
      type: String,
      default: "1x1",
    },

    src: {
      type: String,
      default: undefined,
    },
  },
});
</script>

<style lang="less">
:root {
}
</style>
