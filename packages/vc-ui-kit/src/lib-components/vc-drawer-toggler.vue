<template>
  <div class="vc-drawer-toggler" @click="$emit('click')">
    <vc-drawer-item sticky="sticky" icon="bars"></vc-drawer-item>
  </div>
</template>

<script>
  import { defineComponent } from "@vue/composition-api";
  import VcDrawerItem from "./vc-drawer-item.vue";

  export default defineComponent({
    components: { VcDrawerItem },
  });
</script>
