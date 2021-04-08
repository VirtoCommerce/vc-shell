<template>
  <nav class="vc-header">
    <a href="/" class="vc-header__logo"><img :src="logo" :alt="title" /></a>
    <div class="vc-header__version">{{ version }}</div>

    <div class="collapse navbar-collapse">
      <div class="vc-header__license-text">
        Running community edition,<br />click to request a commercial license.
      </div>
      <button type="button" class="vc-header__license-button">Purchase</button>
    </div>
    <slot name="header-icons">
      <div
        v-for="icon in headerIcons"
        :key="icon"
        class="vc-header__action-icon"
      >
        <VcImage
          :src="require(`~/assets/img/${icon}.svg`)"
          alt="mdo"
          width="22"
          height="22"
          class="mx-1"
        />
      </div>
    </slot>
    <slot name="account">
      <VcHeaderAccount name="admin" role="Administrator" />
    </slot>
  </nav>
</template>
<script>
import Vue from 'vue'
import VcHeaderAccount from './internal/VcHeaderAccount'
import { VcImage } from '~/components/atoms'
Vue.component('VcHeaderAccount', VcHeaderAccount)

export default {
  name: 'VcHeader',
  components: { VcImage, VcHeaderAccount },
  props: {
    headerIcons: {
      type: Array,
      default() {
        return ['settings', 'support', 'notifications']
      },
    },
    logo: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    version: {
      type: String,
      default: '1.0.0',
    },
  },
}
</script>
<style lang="scss">
@import '~/assets/scss/components/organisms/VcHeader.scss';
</style>
