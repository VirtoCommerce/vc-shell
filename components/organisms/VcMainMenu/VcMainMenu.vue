<template>
  <div class="vc-main-menu">
    <ul class="vc-main-menu__nav-pills">
      <li>
        <a href="#" class="vc-nav-link-toggler">
          <VcIcon icon="fa-bars" />
        </a>
      </li>
      <VcMainMenuItem
        v-for="item in items"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
      />
    </ul>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import VcMainMenuItem from './internal/VcMainMenuItem.vue'
import { VcIcon } from '~/components/atoms'
Vue.component('VcMainMenuItem', VcMainMenuItem)

export default {
  name: 'VcMainMenu',
  components: {
    VcIcon,
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
