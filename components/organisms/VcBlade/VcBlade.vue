<template>
  <div class="vc-content__blade">
    <div class="blade-head">
      <div class="blade-nav">
        <ul class="menu__inline">
          <li class="menu-item menu-item__minimize">
            <button type="button">
              <VcIcon
                icon="fa-window-minimize"
                class="menu-item__icon"
              ></VcIcon>
            </button>
          </li>
          <li class="menu-item menu-item__maximize">
            <button type="button">
              <VcIcon
                icon="fa-window-maximize"
                class="menu-item__icon"
              ></VcIcon>
            </button>
          </li>
          <li class="menu-item menu-item__close">
            <button type="button" @click.prevent="onClose">
              <VcIcon icon="fa-times" class="menu-item__icon"></VcIcon>
            </button>
          </li>
        </ul>
      </div>
      <slot name="header">
        <VcBladeHeader
          :title="blade.title"
          :icon="blade.icon"
          :subtitle="blade.subtitle"
        ></VcBladeHeader>
      </slot>
      <slot name="toolbar">
        <VcBladeToolbar :items="blade.menuItems" />
      </slot>
    </div>

    <slot />

    <div class="blade-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import VcBladeHeader from './internal/VcBladeHeader'
import VcBladeToolbar from './internal/VcBladeToolbar'
import { VcIcon } from '~/components/atoms'

Vue.component('VcBladeHeader', VcBladeHeader)
Vue.component('VcBladeToolbar', VcBladeToolbar)

export default {
  name: 'VcBlade',
  components: { VcBladeHeader, VcBladeToolbar, VcIcon },
  props: {
    // TODO: replace the blade parameter to set of properties that have basic types
    blade: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {},
  methods: {
    onClose() {
      this.$emit('click:close')
    },
  },
}
</script>
<style lang="scss">
@import '~/assets/scss/components/organisms/VcBlade.scss';
</style>
