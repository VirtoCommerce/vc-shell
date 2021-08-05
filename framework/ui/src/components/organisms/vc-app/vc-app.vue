<template>
  <div class="vc-app vc-fill_all" :class="`vc-theme_${theme}`">
    <slot :options="options"></slot>
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

  setup(props) {
    console.log("vc-app");
    console.dir(props);
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
