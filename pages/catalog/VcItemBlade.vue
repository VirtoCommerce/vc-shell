<template>
  <VcBlade v-bind="$props" v-on="$listeners">
    <div>
      <h1>I'm item bladecwewe wewec content1</h1>
    </div>
    <template #toolbar>
      <p>my cool toolbaewewr1</p>
    </template>
  </VcBlade>
</template>

<script lang="ts">
import { VcBlade } from '~/components/organisms'
export default {
  name: 'VcItemBlade',
  components: {
    VcBlade,
  },
  extends: VcBlade,
  inheritAttrs: false,
}
</script>
