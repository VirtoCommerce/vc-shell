<template>
  <div class="vc-drawer-toggler" @click="$emit('click')">
    <vc-drawer-item sticky="sticky" icon="bars"></vc-drawer-item>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcDrawerItem from "../vc-drawer-item/vc-drawer-item.vue";

export default defineComponent({
  components: { VcDrawerItem },

  emits: ["click"],
});
</script>

<style lang="less">
.vc-drawer-toggler {
  --drawer-item-icon-color: #319ed4;
}
</style>
