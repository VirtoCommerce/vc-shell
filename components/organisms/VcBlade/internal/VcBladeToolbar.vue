<template>
  <div class="blade-toolbar">
    <ul class="menu__inline">
      <VcMenuItem
        v-for="item in items"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
      />
    </ul>
  </div>
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
