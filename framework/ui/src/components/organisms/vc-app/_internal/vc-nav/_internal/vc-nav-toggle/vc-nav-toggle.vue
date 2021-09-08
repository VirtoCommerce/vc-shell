<template>
  <div class="vc-nav-toggle" @click="$emit('click')">
    <vc-nav-item sticky="sticky" icon="fas fa-bars"></vc-nav-item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcNavItem from "../vc-nav-item/vc-nav-item.vue";

export default defineComponent({
  name: "VcNavToggle",

  components: { VcNavItem },

  emits: ["click"],
});
</script>

<style lang="less">
.vc-nav-toggle {
  --nav-item-icon-color: #319ed4;
}
</style>
