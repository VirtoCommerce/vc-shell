<template>
  <h1>Dashboard layout</h1>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "VcLayoutDashboard",

  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    console.debug("Init vc-layout-dashboard");
  },
});
</script>
