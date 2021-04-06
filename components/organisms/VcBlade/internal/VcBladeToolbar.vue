<template>
  <nav class="navbar navbar-dark navbar-expand-sm border p-0">
    <ul class="nav navbar-nav">
      <li v-for="item in items" :key="item.id" class="nav-item">
        <VcMenuItem :icon="item.icon" :title="item.title" size="sm" />
      </li>
    </ul>
  </nav>
</template>
<script>
import { VcMenuItem } from '../../../molecules'
export default {
  name: 'VcBladeToolbar',
  components: { VcMenuItem },
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
<style lang="scss"></style>
