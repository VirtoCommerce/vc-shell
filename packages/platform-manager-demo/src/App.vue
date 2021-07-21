<template>
  <vc-app :branding="branding">
    <template #menu> </template>
  </vc-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",

  setup() {
    return {
      branding: {
        logo: "/assets/logo.svg",
        version: "0.0.1b",
      },
    };
  },
});
</script>

<style lang="less">
html,
body,
#app {
  font-family: "Roboto";
  font-size: var(--font-size-m);
}
</style>
