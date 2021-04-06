<template>
  <div class="main-menu d-flex align-items-center">
    <aside class="main-menu list-group bg-light border-right flex-fill">
      <button
        class="list-group-item list-group-item-action font-weight-bold"
        ng-click=""
      >
        <VcIcon icon="bars" size="lg" />
      </button>
      <VcMenuItem
        v-for="item in items"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
      />
    </aside>
  </div>
</template>
<script lang="ts">
import { VcIcon } from '../../atoms'
import { VcMenuItem } from '../../molecules'
export default {
  name: 'VcMainMenu',
  components: {
    VcIcon,
    VcMenuItem,
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
<style lang="scss"></style>
