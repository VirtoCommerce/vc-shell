<template>
  <div class="vc-list">
    <!-- @slot -->
    <slot />
  </div>
</template>
<script>
import Vue from 'vue'
import VcListItem from './internal/VcListItem.vue'
Vue.component('VcListItem', VcListItem)

export default {
  name: 'VcList',
  computed: {},
}
</script>
<style lang="scss">
@import '~/assets/scss/components/organisms/VcList.scss';
</style>
