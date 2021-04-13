<template>
  <div class="vc-main-menu">
    <ul class="vc-main-menu__nav-pills">
      <VcMainMenuItem icon="fa-bars" :toggler="true" />
      <slot />
      <VcMainMenuItem icon="fa-ellipsis-h" title="More" />
    </ul>
  </div>
</template>
<script>
import Vue from 'vue'
import VcMainMenuItem from './internal/VcMainMenuItem.vue'
Vue.component('VcMainMenuItem', VcMainMenuItem)

export default {
  name: 'VcMainMenu',
  components: {
    VcMainMenuItem,
  },
  computed: {},
}
</script>
<style lang="scss">
@import '~/assets/scss/components/organisms/VcMainMenu.scss';
</style>
