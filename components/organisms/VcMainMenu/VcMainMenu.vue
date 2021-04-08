<template>
  <div class="vc-main-menu">
    <ul class="vc-main-menu__nav-pills">
      <VcMainMenuItem icon="fa-bars" :toggler="true" />
      <VcMainMenuItem
        v-for="item in items"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
      />
      <VcMainMenuItem icon="fa-ellipsis-h" title="More" />
    </ul>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import VcMainMenuItem from './internal/VcMainMenuItem.vue'
Vue.component('VcMainMenuItem', VcMainMenuItem)

export default {
  name: 'VcMainMenu',
  components: {
    VcMainMenuItem,
  },
  props: {
    items: {
      type: Array,
      default() {
        return []
      },
    },
  },
  computed: {},
}
</script>
<style lang="scss">
@import '~/assets/scss/components/organisms/VcMainMenu.scss';
</style>
