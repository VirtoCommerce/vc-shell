<template>
  <VcBlade v-bind="$props" v-on="$listeners">
    <div>
      <h1>I'm item blade content</h1>
    </div>
    <template #toolbar>
      <p>my cool toolbar</p>
    </template>
  </VcBlade>
</template>

<script lang="ts">
import { VcBlade } from '../../components/organisms'
export default {
  name: 'VcItemBlade',
  components: {
    VcBlade,
  },
  extends: VcBlade,
  inheritAttrs: false,
}
</script>
