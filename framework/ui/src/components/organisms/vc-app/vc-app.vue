<template>
  <div class="vc-app vc-fill_all" :class="`vc-theme_${theme}`">
    <slot v-bind="options"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcApp",

  props: {
    options: {
      type: Object,
      default: () => ({}),
    },

    theme: {
      type: String,
      default: "light",
    },
  },

  setup() {
    console.debug("Init vc-app");
  },
});
</script>

<style lang="less">
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>
