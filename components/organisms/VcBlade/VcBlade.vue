<template>
  <div :class="['p-1', 'blade', 'bs-sm']">
    <div class="blade-header">
      <div class="blade-header-bar d-flex justify-content-end w-100">
        <button class="btn btn-sm btn-maximize btn-maximize">
          <VcIcon icon="window-maximize" class="text-light"> </VcIcon>
        </button>
        <button class="btn btn-sm btn-close btn-close" @click="onClose">
          <VcIcon icon="times" class="text-light"> </VcIcon>
        </button>
      </div>
      <slot name="header">
        <VcBladeHeader
          :title="blade.title"
          :icon="blade.icon"
          :subtitle="blade.subtitle"
        ></VcBladeHeader>
      </slot>
    </div>
    <div>
      <slot name="toolbar">
        <VcBladeToolbar :items="blade.menuItems" />
      </slot>
    </div>
    <div class="card-body border p-1 container-fluid" style="height: 30rem">
      <slot />
    </div>
    <div class="blade-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { VcIcon } from '../../atoms'
import VcBladeHeader from './internal/VcBladeHeader'
import VcBladeToolbar from './internal/VcBladeToolbar'
Vue.component('VcBladeHeader', VcBladeHeader)
Vue.component('VcBladeToolbar', VcBladeToolbar)

export default {
  name: 'VcBlade',
  components: { VcBladeHeader, VcIcon, VcBladeToolbar },
  props: {
    blade: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {},
  methods: {
    onClose(event) {
      event.preventDefault()
      this.$emit('click:close')
    },
  },
}
</script>
<style lang="scss"></style>
