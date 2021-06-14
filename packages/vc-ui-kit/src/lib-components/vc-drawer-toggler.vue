<template>
  <div class="vc-drawer-toggler" @click="$emit('click')">
    <vc-drawer-item sticky="sticky" icon="bars"></vc-drawer-item>
  </div>
</template>

<script>
  import VcDrawerItem from "./vc-drawer-item.vue";

  export default {
    components: { VcDrawerItem },
  };
</script>
