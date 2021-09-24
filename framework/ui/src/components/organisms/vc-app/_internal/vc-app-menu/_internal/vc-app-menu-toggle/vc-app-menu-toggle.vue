<template>
  <div class="vc-app-menu-toggle" @click="$emit('click')">
    <vc-app-menu-item sticky="sticky" icon="fas fa-bars"></vc-app-menu-item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcAppMenuItem from "../vc-app-menu-item/vc-app-menu-item.vue";

export default defineComponent({
  name: "VcAppMenuToggle",

  components: { VcAppMenuItem },

  emits: ["click"],
});
</script>

<style lang="less">
.vc-app-menu-toggle {
  --app-menu-item-icon-color: #319ed4;
}
</style>
